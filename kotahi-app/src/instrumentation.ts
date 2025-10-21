export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Server-side PostHog initialization
    const { PostHog } = await import("posthog-node");

    const posthogKey = process.env.POSTHOG_KEY;
    const posthogHost = process.env.POSTHOG_HOST;

    if (posthogKey && posthogHost) {
      const posthog = new PostHog(posthogKey, {
        host: posthogHost,
      });

      // Store in global for access in API routes
      (global as any).posthog = posthog;
    }
  }
}
