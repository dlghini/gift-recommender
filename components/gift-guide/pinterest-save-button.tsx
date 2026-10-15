"use client";

import { usePostHog } from "posthog-js/react";
import { buttonVariants } from "@/components/ui/button";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

// A plain link into Pinterest's save dialog: no third-party script, so no extra
// tracking surface and nothing to load. Pinterest builds a new pin from the
// guide's tall image (`/gifts-for/<slug>/pin.png`), title and URL, so it lands
// in the visitor's own board pointing back at the guide.
export function PinterestSaveButton({
  slug,
  title,
  description,
  location,
  label = "Save to Pinterest",
}: {
  slug: string;
  title: string;
  description: string;
  location: "top" | "bottom";
  label?: string;
}) {
  const posthog = usePostHog();

  const params = new URLSearchParams({
    url: `${SITE_URL}/gifts-for/${slug}`,
    media: `${SITE_URL}/gifts-for/${slug}/pin.png`,
    description: `${title}. ${description}`.slice(0, 480),
  });

  return (
    <a
      href={`https://www.pinterest.com/pin/create/button/?${params}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => posthog?.capture("guide_save_clicked", { guide: slug, location })}
      className={cn(
        buttonVariants({ variant: "outline", size: "default" }),
        "h-9 gap-2 rounded-full border-stone-300 bg-white px-4 text-stone-700 hover:bg-stone-50"
      )}
    >
      <svg viewBox="0 0 24 24" aria-hidden className="size-4 fill-[#e60023]">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
      </svg>
      {label}
    </a>
  );
}
