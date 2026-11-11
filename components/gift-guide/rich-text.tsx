import Link from "next/link";
import { parseRichText } from "@/lib/gift-guides/rich-text";

export function RichText({ text }: { text: string }) {
  return (
    <>
      {parseRichText(text).map((part, i) =>
        part.href ? (
          <Link
            key={i}
            href={part.href}
            className="text-amber-700 underline underline-offset-2 hover:text-amber-800"
          >
            {part.text}
          </Link>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </>
  );
}
