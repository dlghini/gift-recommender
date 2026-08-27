"use client";

import { useState } from "react";

// Pixabay image URLs expire after ~24h. Any image shown here might be from a search run
// well before now (a saved gift, Loved Ones history, a shared link), so instead of falling
// straight to the emoji fallback on load failure, try re-resolving it once via /api/resolve-image
// before giving up.
export function useResolvedImage(initialUrl: string | null | undefined, query: string, tags: string[] = []) {
  const [retriedUrl, setRetriedUrl] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [failed, setFailed] = useState(false);

  const src = retriedUrl ?? initialUrl ?? undefined;

  const handleError = () => {
    if (attempted) {
      setFailed(true);
      return;
    }
    setAttempted(true);
    const params = new URLSearchParams({ q: query, tags: tags.join(",") });
    fetch(`/api/resolve-image?${params}`)
      .then((r) => r.json())
      .then((data: { imageUrl: string | null }) => {
        if (data.imageUrl) setRetriedUrl(data.imageUrl);
        else setFailed(true);
      })
      .catch(() => setFailed(true));
  };

  return { src, failed, handleError };
}
