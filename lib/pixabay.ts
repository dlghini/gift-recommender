import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN ? Redis.fromEnv() : null;

const PIXABAY_CACHE_TTL_SECONDS = 60 * 60 * 24; // Pixabay's API terms require caching responses for 24h

// Pixabay's free-tier terms require every response to be cached for 24h. This doubles as a real
// capacity win: popular gift searches (common products recur across different users' sessions) get
// served from cache instead of burning a fresh API call against the 100req/60s limit. A miss (no
// real match) is cached too, as "", so a dead query doesn't keep re-hitting Pixabay all day.
// image_type=photo excludes illustrations/vectors from results — Pixabay's default search mixes
// those in with real photos, which we don't want for a "real gift photo" card.
async function searchPixabay(query: string, apiKey: string): Promise<string | undefined> {
  const cacheKey = `giftwhisperer:pixabay:${query.toLowerCase()}`;
  if (redis) {
    try {
      const cached = await redis.get<string>(cacheKey);
      if (cached !== null && cached !== undefined) return cached || undefined;
    } catch (err) {
      console.error("[pixabay cache read]", err);
    }
  }

  let url: string | undefined;
  try {
    const res = await fetch(
      `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=photo&safesearch=true&per_page=3`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const data = (await res.json()) as { hits?: { webformatURL?: string }[] };
      url = data.hits?.[0]?.webformatURL;
    }
  } catch (err) {
    console.error("[pixabay search]", err);
  }

  if (redis) {
    redis.set(cacheKey, url ?? "", { ex: PIXABAY_CACHE_TTL_SECONDS }).catch((err) =>
      console.error("[pixabay cache write]", err)
    );
  }
  return url;
}

// Generic image lookup for any gift without a real product photo (Amazon/Etsy always, Viator if its own
// image is missing) — also used to re-resolve an image that's expired since it was first shown (Pixabay's
// URLs are only valid ~24h). A specific/branded query (e.g. "HexClad hybrid frying pan") often has zero
// matches on stock photography, so if the first search comes up empty, retry with the gift's tags —
// broader, more photogenic terms that are far more likely to have real coverage. Tags are tried one at a
// time (not joined) so an unrelated tag pairing (e.g. "travel" + "outdoors") can't dominate the result and
// pull in an off-topic photo.
export async function fetchPixabayImage(query: string, tags: string[] = []): Promise<string | undefined> {
  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey) return undefined;
  let url = await searchPixabay(query, apiKey);
  for (const tag of tags) {
    if (url) break;
    url = await searchPixabay(tag, apiKey);
  }
  return url;
}
