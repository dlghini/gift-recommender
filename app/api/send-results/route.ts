import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getDb } from "@/lib/db";
import { getResend } from "@/lib/resend";
import { fetchPixabayImage } from "@/lib/pixabay";

const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(10, "1 h"),
        prefix: "giftwhisperer:email-ratelimit",
      })
    : null;

const RAKUTEN_ID = "wa9JRgUhXO8";
const ETSY_MID = "54027";
const VIATOR_PID = "P00304135";

interface GiftResult {
  name: string;
  price: string;
  rationale: string;
  tags: string[];
  affiliateUrl: string;
  type: "product" | "experience";
  store: "amazon" | "etsy" | "viator";
  searchQuery: string;
  imageUrl?: string;
}

function buildBuyUrl(gift: GiftResult): string {
  if (gift.store === "viator") {
    if (gift.affiliateUrl && gift.affiliateUrl !== "#") return gift.affiliateUrl;
    return `https://www.viator.com/searchResults/all?text=${encodeURIComponent(gift.searchQuery || gift.name)}&pid=${VIATOR_PID}`;
  }
  if (gift.store === "etsy") {
    const etsyUrl = `https://www.etsy.com/search?q=${encodeURIComponent(gift.searchQuery || gift.name)}`;
    return `https://click.linksynergy.com/deeplink?id=${RAKUTEN_ID}&mid=${ETSY_MID}&murl=${encodeURIComponent(etsyUrl)}`;
  }
  return `https://www.amazon.com/s?k=${encodeURIComponent(gift.searchQuery || gift.name)}&tag=giftwhisper0e-20`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderGiftCard(gift: GiftResult): string {
  const isExperience = gift.type === "experience";
  const accent = isExperience ? "#6366f1" : "#f59e0b";
  const buttonLabel = isExperience ? "Book now" : "Buy now";
  const imageCell = gift.imageUrl
    ? `<td width="64" valign="top" style="padding-right:14px;">
         <img src="${escapeHtml(gift.imageUrl)}" width="64" height="64" alt="${escapeHtml(gift.name)}" style="width:64px;height:64px;border-radius:8px;object-fit:cover;display:block;background:#f5f0e6;" />
       </td>`
    : "";
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;margin-bottom:16px;border:1px solid #f0e6d2;">
      <tr><td style="padding:20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          ${imageCell}
          <td valign="top">
            ${isExperience ? `<span style="display:inline-block;font-size:11px;font-weight:600;color:${accent};background:#eef2ff;padding:2px 8px;border-radius:9999px;margin-bottom:8px;">EXPERIENCE</span><br/>` : ""}
            <span style="font-family:Georgia,serif;font-size:18px;color:#1c1917;">${escapeHtml(gift.name)}</span><br/>
            <span style="font-size:14px;font-weight:600;color:${accent};">${escapeHtml(gift.price)}</span>
          </td>
        </tr></table>
        <p style="font-size:14px;color:#78716c;line-height:1.6;margin:12px 0;">${escapeHtml(gift.rationale)}</p>
        <a href="${buildBuyUrl(gift)}" style="display:inline-block;background:${accent};color:#ffffff;font-weight:600;font-size:14px;padding:10px 20px;border-radius:6px;text-decoration:none;">${buttonLabel} →</a>
      </td></tr>
    </table>`;
}

function renderEmail(gifts: GiftResult[]): string {
  return `
    <div style="font-family:Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#fffbeb;">
      <h1 style="font-family:Georgia,serif;font-size:22px;color:#1c1917;text-align:center;margin-bottom:4px;">🎁 The Gift Whisperer</h1>
      <p style="text-align:center;color:#78716c;font-size:14px;margin-bottom:24px;">Here are the gifts we picked for you</p>
      ${gifts.map(renderGiftCard).join("")}
      <p style="font-size:12px;color:#a8a29e;margin-top:24px;">We earn from qualifying purchases via affiliate partnerships. <a href="https://www.thegiftwhisperer.gifts/disclosure" style="color:#a8a29e;">Learn more</a></p>
    </div>`;
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "anonymous";

    if (ratelimit) {
      try {
        const { success } = await ratelimit.limit(ip);
        if (!success) {
          return Response.json({ error: "Too many requests. Please try again in an hour." }, { status: 429 });
        }
      } catch (rateLimitError) {
        // Fail open: an unreachable rate limiter shouldn't take down the whole feature.
        console.error("[rate limit]", rateLimitError);
      }
    }

    const { email, gifts } = (await request.json()) as { email: string; gifts: GiftResult[] };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!Array.isArray(gifts) || gifts.length === 0) {
      return Response.json({ error: "No gifts to send." }, { status: 400 });
    }

    // Re-resolve non-Viator images fresh at send time rather than trusting whatever URL the client
    // had — Pixabay's URLs are only valid ~24h, and an email might sit unopened for longer than that.
    // Viator's own images are left as-is; they're not ours to re-resolve.
    const giftsWithImages = await Promise.all(
      gifts.map(async (gift) => {
        if (gift.store === "viator") return gift;
        const imageUrl = await fetchPixabayImage(gift.searchQuery || gift.name, gift.tags);
        return { ...gift, imageUrl };
      })
    );

    try {
      const sql = getDb();
      await sql`INSERT INTO subscribers (email, gifts) VALUES (${email}, ${JSON.stringify(giftsWithImages)})`;
    } catch (dbError) {
      console.error("[subscriber logging]", dbError);
    }

    const { error } = await getResend().emails.send({
      from: "The Gift Whisperer <hello@thegiftwhisperer.gifts>",
      to: email,
      subject: "Your gift picks from The Gift Whisperer 🎁",
      html: renderEmail(giftsWithImages),
    });

    if (error) {
      console.error("[send-results]", error);
      return Response.json({ error: "Failed to send email." }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const cause = error instanceof Error && error.cause ? String(error.cause) : undefined;
    console.error("[/api/send-results]", msg, cause ? `cause: ${cause}` : "");
    return Response.json({ error: msg, cause }, { status: 500 });
  }
}
