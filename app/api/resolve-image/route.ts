import { fetchPixabayImage } from "@/lib/pixabay";

// Pixabay's image URLs are only valid for ~24h, so any image persisted past that (saved gifts,
// Loved Ones history, shared links, emails opened late) will eventually 404. Rather than falling
// straight to the emoji the moment that happens, the frontend calls this to re-run the same
// (cached) search and get a fresh URL before giving up.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  if (!q) {
    return Response.json({ error: "Missing q" }, { status: 400 });
  }
  const tags = searchParams.get("tags")?.split(",").filter(Boolean) ?? [];

  try {
    const imageUrl = await fetchPixabayImage(q, tags);
    return Response.json({ imageUrl: imageUrl ?? null });
  } catch (err) {
    console.error("[/api/resolve-image]", err);
    return Response.json({ imageUrl: null });
  }
}
