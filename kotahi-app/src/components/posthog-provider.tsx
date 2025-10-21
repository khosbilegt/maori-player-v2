"use client";

import { useEffect } from "react";
import { initPostHog } from "@/lib/posthog";
import { useUser } from "@/lib/user-context";
import { usePageView } from "@/lib/pageview-tracker";
import { useAnalytics } from "@/lib/analytics-hook";

export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useUser();

  // Track pageviews
  usePageView();

  // Track essential analytics
  useAnalytics();

  useEffect(() => {
    initPostHog();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Identify user with PostHog when they log in
      const { posthog } = require("@/lib/posthog");
      posthog.identify(user.id, {
        email: user.email,
        username: user.username,
        role: user.role,
      });
    }
  }, [user, isAuthenticated]);

  return <>{children}</>;
}
