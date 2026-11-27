"use client";

import "./globals.css";
import { ErrorScreen } from "@/components/error-screen";

// Replaces the root layout when the layout itself fails, so it supplies its
// own <html> and <body>.
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <title>Something went wrong</title>
        <ErrorScreen error={error} onRetry={unstable_retry} boundary="root" />
      </body>
    </html>
  );
}
