// Renders a structured-data <script> per Next's JSON-LD guidance. `<` is escaped
// to its unicode form so a stray HTML tag in any string field can't break out of
// the script context.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
