import { auth, clerkClient } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { getResend } from "@/lib/resend";

const SITE = "https://www.thegiftwhisperer.gifts";

// DELETE: owner removes an item from their list.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ shareId: string; itemId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });
    const { shareId, itemId } = await params;

    const sql = getDb();
    const [deleted] = await sql`
      DELETE FROM gift_list_items gli
      USING gift_lists gl
      WHERE gli.id = ${itemId}
        AND gli.list_id = gl.id
        AND gl.share_id = ${shareId}
        AND gl.clerk_user_id = ${userId}
      RETURNING gli.id
    `;
    if (!deleted) return Response.json({ error: "Not found." }, { status: 404 });
    return Response.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/lists/[shareId]/items/[itemId] DELETE]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}

// PATCH is public (no auth): claiming, unclaiming and marking purchased are all
// done by whoever has the share link. `claimedBy` is a plain name; unclaim /
// purchase require it to match the current claimer so a stranger can't undo
// someone else's claim.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ shareId: string; itemId: string }> }
) {
  try {
    const { shareId, itemId } = await params;
    const body = (await request.json()) as {
      action: "claim" | "unclaim" | "purchase" | "unpurchase";
      claimedBy?: string;
      claimedEmail?: string | null;
    };
    const name = body.claimedBy?.trim();
    if (!name) return Response.json({ error: "A name is required." }, { status: 400 });

    const sql = getDb();
    const [list] = (await sql`
      SELECT id, clerk_user_id, recipient_name FROM gift_lists WHERE share_id = ${shareId}
    `) as { id: string; clerk_user_id: string; recipient_name: string }[];
    if (!list) return Response.json({ error: "Not found." }, { status: 404 });

    if (body.action === "claim") {
      const email = body.claimedEmail?.trim() || null;
      const [item] = (await sql`
        UPDATE gift_list_items
        SET claimed_by = ${name}, claimed_email = ${email}, claimed_at = NOW()
        WHERE id = ${itemId} AND list_id = ${list.id} AND claimed_by IS NULL
        RETURNING id, name
      `) as { id: string; name: string }[];
      if (!item) {
        // Either the item doesn't exist here, or someone claimed it first.
        const [exists] = await sql`
          SELECT id FROM gift_list_items WHERE id = ${itemId} AND list_id = ${list.id}
        `;
        return Response.json(
          { error: exists ? "Someone already claimed that one." : "Not found." },
          { status: exists ? 409 : 404 }
        );
      }
      notifyOwnerOfClaim(list.clerk_user_id, list.recipient_name, item.name, name, shareId);
      return Response.json({ ok: true });
    }

    if (body.action === "unclaim") {
      const [item] = await sql`
        UPDATE gift_list_items
        SET claimed_by = NULL, claimed_email = NULL, claimed_at = NULL, purchased = FALSE
        WHERE id = ${itemId} AND list_id = ${list.id} AND lower(claimed_by) = lower(${name})
        RETURNING id
      `;
      if (!item) {
        return Response.json({ error: "That claim isn't yours to release." }, { status: 403 });
      }
      return Response.json({ ok: true });
    }

    if (body.action === "purchase" || body.action === "unpurchase") {
      const [item] = await sql`
        UPDATE gift_list_items
        SET purchased = ${body.action === "purchase"}
        WHERE id = ${itemId} AND list_id = ${list.id} AND lower(claimed_by) = lower(${name})
        RETURNING id
      `;
      if (!item) {
        return Response.json({ error: "Claim this gift first." }, { status: 403 });
      }
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/lists/[shareId]/items/[itemId] PATCH]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}

// Best-effort "someone claimed a gift" email to the list owner. Never blocks the
// claim: a mail failure is logged and swallowed.
async function notifyOwnerOfClaim(
  ownerClerkId: string,
  recipientName: string,
  itemName: string,
  claimerName: string,
  shareId: string
): Promise<void> {
  try {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(ownerClerkId);
    const email =
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ??
      user.emailAddresses[0]?.emailAddress;
    if (!email) return;

    const esc = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const url = `${SITE}/lists/${shareId}`;

    await getResend().emails.send({
      from: "The Gift Whisperer <hello@thegiftwhisperer.gifts>",
      to: email,
      subject: `${esc(claimerName)} claimed a gift on your ${esc(recipientName)} list`,
      html: `
        <div style="font-family:Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#e9eee6;">
          <h1 style="font-family:Georgia,serif;font-size:22px;color:#2f3a33;text-align:center;margin-bottom:4px;">The Gift Whisperer</h1>
          <p style="text-align:center;color:#6c756b;font-size:14px;margin-bottom:24px;">An update on your group gift list</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e4d9cf;">
            <tr><td style="padding:24px;text-align:center;">
              <p style="font-size:16px;color:#2f3a33;margin:0 0 16px 0;"><strong>${esc(
                claimerName
              )}</strong> claimed <strong>${esc(itemName)}</strong> for ${esc(recipientName)}.</p>
              <a href="${url}" style="display:inline-block;background:#a8543a;color:#ffffff;font-weight:600;font-size:14px;padding:10px 20px;border-radius:6px;text-decoration:none;">See the list &rarr;</a>
            </td></tr>
          </table>
        </div>`,
    });
  } catch (error) {
    console.error("[lists] owner claim notification failed", error);
  }
}
