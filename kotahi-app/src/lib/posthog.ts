import posthog from "posthog-js";

export const initPostHog = () => {
  if (typeof window !== "undefined") {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    if (posthogKey && posthogHost) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        person_profiles: "identified_only",
        capture_pageview: true, // Enable automatic pageview capture
        capture_pageleave: true,
        autocapture: true, // Enable automatic event capture
        capture_performance: true, // Track performance metrics
        capture_heatmaps: true, // Enable heatmaps
        loaded: (posthog) => {
          // Track initial pageview
          posthog.capture("$pageview");

          // Track app initialization
          posthog.capture("$app_initialized", {
            app_name: "Kotahi",
            app_version: "1.0.0",
            platform: "web",
          });
        },
      });
    }
  }
};

export { posthog };
