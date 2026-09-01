import { cn } from "@/lib/utils";

/**
 * Hand-drawn line icons that replace the emoji tiles across the marketing
 * pages. Single rough stroke, round caps, slightly irregular coordinates so
 * they read as sketched rather than geometric. Colour follows the current
 * text colour (`stroke="currentColor"`), so size and colour come from the
 * caller's Tailwind classes.
 */

export type DoodleName =
  | "gift"
  | "heart"
  | "bell"
  | "pencil"
  | "save"
  | "sparkle"
  | "bag"
  | "person"
  | "target"
  | "bug"
  | "bulb"
  | "cake"
  | "ring"
  | "gradcap"
  | "pram";

const PATHS: Record<DoodleName, React.ReactNode> = {
  gift: (
    <>
      <path d="M3.5 8.3h17v12.4h-17z" />
      <path d="M3.2 12.2h17.4M12 8.1v12.6M7.6 8.2C6 8 5 6.4 5.6 4.9 6.3 3.4 9 3.6 10.4 5.2c1 1.1 1.6 3 1.6 3s.7-2 1.8-3.1c1.4-1.5 4-1.6 4.6 0 .5 1.6-.6 3-2.2 3.1" />
    </>
  ),
  heart: (
    <path d="M12 20.5C11 20 4 15.8 4 9.8 4 6.6 6.7 4.6 9.3 5.6c1.4.5 2.4 1.9 2.7 2.6.3-.7 1.3-2.1 2.7-2.6C19.3 4.6 22 6.6 22 9.8c0 6-7 10.2-8 10.7z" />
  ),
  bell: (
    <>
      <path d="M18 8.2c0-3.4-2.7-6-6.1-6-3.3 0-5.9 2.7-5.9 6 0 6.8-3 9-3 9h18s-3-2.2-3-9z" />
      <path d="M13.6 21c-.7 1.1-2.4 1.1-3.2 0" />
    </>
  ),
  pencil: (
    <path d="M11.8 20.2h9.4M16.4 3.6c.9-.9 2.3-.8 3.1 0 .8.8.9 2.2 0 3.1L7 19l-4.2 1 1.1-4z" />
  ),
  save: (
    <>
      <path d="M4.3 7.4h15.4v13.3H4.3z" />
      <path d="M4.2 11.2h15.6M12 7.3v13.4M9.2 3.4l2.8 3.8 2.9-3.7" />
    </>
  ),
  sparkle: (
    <path d="M12 3.2l1.9 5.7 5.9 1.2-5.9 1.3-1.9 5.6-1.9-5.6L4.2 11l5.9-1.3z" />
  ),
  bag: (
    <>
      <path d="M6.2 7.3h11.6l-1.1 13H7.3z" />
      <path d="M9 7.2c0-1.7 1.4-3 3-3s3 1.3 3 3" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M5 20.8v-.9c0-3.7 3.1-6.7 7-6.7s7 3 7 6.7v.9" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="12" cy="12" r="0.6" />
    </>
  ),
  bug: (
    <>
      <path d="M8.5 8.2c0-2 1.6-3.6 3.5-3.6s3.5 1.6 3.5 3.6" />
      <path d="M6.4 12.2c0-3 2.5-5 5.6-5s5.6 2 5.6 5c0 4-2.5 7.4-5.6 7.4s-5.6-3.4-5.6-7.4z" />
      <path d="M3.4 10.5l3 1.7M3 16.6l3.2-1.2M4.2 21.4l3-2.6M20.6 10.5l-3 1.7M21 16.6l-3.2-1.2M19.8 21.4l-3-2.6M12 12.4v7" />
    </>
  ),
  bulb: (
    <>
      <path d="M8.4 15.2A5.6 5.6 0 016.4 11a5.6 5.6 0 0111.2 0 5.6 5.6 0 01-2 4.2c-.8.7-1.3 1.5-1.4 2.4H9.8c-.1-.9-.6-1.7-1.4-2.4z" />
      <path d="M9.6 20.4h4.8M10.4 22.6h3.2" />
    </>
  ),
  cake: (
    <>
      <path d="M4 21h16M5.2 21v-6.6c0-.5.4-.9.9-.9h11.8c.5 0 .9.4.9.9V21" />
      <path d="M4.6 17.2c1.2-1.1 2.4-1.1 3.6 0s2.4 1.1 3.6 0 2.4-1.1 3.6 0 2.4 1.1 3.7 0" />
      <path d="M8 10.5V7.6M12 10.5V7M16 10.5V7.6" />
      <path d="M8 7.4c0-.9.7-1.2.7-2C8.7 4.7 8 4.3 8 4.3M12 6.8c0-.9.7-1.2.7-2C12.7 4 12 3.7 12 3.7M16 7.4c0-.9.7-1.2.7-2C16.7 4.7 16 4.3 16 4.3" />
    </>
  ),
  ring: (
    <>
      <circle cx="12" cy="15.2" r="5.4" />
      <path d="M9.2 9.6l1.5-3.4h2.6l1.5 3.4M12 6.2 8.9 9.7h6.2z" />
    </>
  ),
  gradcap: (
    <>
      <path d="M2.6 9.2 12 5.1l9.4 4.1L12 13.3z" />
      <path d="M6.2 11.2v4.4c0 1.4 2.6 2.5 5.8 2.5s5.8-1.1 5.8-2.5v-4.4" />
      <path d="M21.4 9.4v4.6M21.4 14a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
    </>
  ),
  pram: (
    <>
      <path d="M3.6 10.5c0 3.6 3.6 5.5 8.4 5.5s8.4-1.9 8.4-5.5c0-.6-.5-1-1.1-1H4.7c-.6 0-1.1.4-1.1 1z" />
      <path d="M12 9.5V4.2c-3.6 0-6.6 2.3-7.1 5.3" />
      <path d="M20.4 9.5v4" />
      <circle cx="8" cy="19" r="2" />
      <circle cx="15" cy="19" r="2" />
    </>
  ),
};

interface DoodleIconProps extends React.SVGProps<SVGSVGElement> {
  name: DoodleName;
}

export function DoodleIcon({ name, className, ...props }: DoodleIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      {PATHS[name]}
    </svg>
  );
}
