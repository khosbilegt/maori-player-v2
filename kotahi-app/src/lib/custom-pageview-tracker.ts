import { posthog } from "./posthog";

// Custom pageview tracking for specific pages
export const trackCustomPageView = (
  pageName: string,
  additionalProperties?: Record<string, any>
) => {
  const user = getCurrentUser();

  posthog.capture("$pageview", {
    page_name: pageName,
    page_title: document.title,
    page_url: window.location.href,
    user_id: user?.user_id,
    user_email: user?.email,
    user_role: user?.role,
    ...additionalProperties,
  });
};

// Helper to get current user info (same as in analytics.ts)
const getCurrentUser = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return {
          user_id: payload.user_id,
          email: payload.email,
          username: payload.username,
          role: payload.role,
        };
      } catch (error) {
        console.warn("Failed to decode user token:", error);
      }
    }
  }
  return null;
};

// Specific page tracking functions
export const trackVideoPageView = (videoId: string, videoTitle?: string) => {
  trackCustomPageView("video_watch", {
    video_id: videoId,
    video_title: videoTitle,
  });
};

export const trackLibraryPageView = () => {
  trackCustomPageView("library");
};

export const trackSearchPageView = (query?: string) => {
  trackCustomPageView("search", {
    search_query: query,
  });
};

export const trackVocabularyPageView = () => {
  trackCustomPageView("vocabulary");
};

export const trackProgressPageView = () => {
  trackCustomPageView("progress");
};
