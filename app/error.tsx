"use client";

import { ErrorScreen } from "@/components/error-screen";

export default function PageError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return <ErrorScreen error={error} onRetry={unstable_retry} boundary="page" />;
}
