"use client";

import { Suspense } from "react";
import PostHogProvider from "./posthog-provider";

export default function AnalyticsWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PostHogProvider>{children}</PostHogProvider>
    </Suspense>
  );
}
