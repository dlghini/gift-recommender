// Guide copy can carry internal links as `[anchor text](/path)`. Only root-relative
// paths are allowed, so copy can never link off-site by accident.
const LINK_RE = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;

export type RichPart = { text: string; href?: string };

export function parseRichText(input: string): RichPart[] {
  const parts: RichPart[] = [];
  let last = 0;
  for (const m of input.matchAll(LINK_RE)) {
    const start = m.index ?? 0;
    if (start > last) parts.push({ text: input.slice(last, start) });
    parts.push({ text: m[1], href: m[2] });
    last = start + m[0].length;
  }
  if (last < input.length) parts.push({ text: input.slice(last) });
  return parts;
}

/** Plain text with link markup removed (for JSON-LD and metadata). */
export function plainText(input: string): string {
  return input.replace(LINK_RE, "$1");
}
