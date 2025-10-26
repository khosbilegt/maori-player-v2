"use client";

import { useEffect, useRef } from "react";
import { useUser } from "./user-context";
import {
  trackUserEngagement,
  trackSessionStart,
  trackSessionEnd,
  trackFeatureUsage,
  trackLearningProgress,
  trackUserBehavior,
  setUserProperties,
  trackVideoEvent,
} from "./essential-metrics";

// Hook for automatic analytics tracking
export const useAnalytics = () => {
  const { user, isAuthenticated } = useUser();
  const sessionStartTime = useRef<number>(Date.now());
  const engagementInterval = useRef<NodeJS.Timeout | null>(null);

  // Track session start
  useEffect(() => {
    if (isAuthenticated) {
      trackSessionStart();
      sessionStartTime.current = Date.now();
    }
  }, [isAuthenticated]);

  // Track user engagement periodically
  useEffect(() => {
    if (isAuthenticated) {
      // Track engagement every 30 seconds
      engagementInterval.current = setInterval(() => {
        trackUserEngagement();
      }, 30000);
    }

    return () => {
      if (engagementInterval.current) {
        clearInterval(engagementInterval.current);
      }
    };
  }, [isAuthenticated]);

  // Track session end on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isAuthenticated) {
        const sessionDuration = Date.now() - sessionStartTime.current;
        trackSessionEnd(sessionDuration);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isAuthenticated]);

  // Set user properties when user changes
  useEffect(() => {
    if (user) {
      setUserProperties({
        email: user.email,
        username: user.username,
        role: user.role,
        last_login: new Date().toISOString(),
      });
    }
  }, [user]);

  return {
    trackFeatureUsage,
    trackLearningProgress,
    trackUserBehavior,
  };
};

// Hook for learning-specific analytics
export const useLearningAnalytics = () => {
  const { user } = useUser();

  const trackVideoStart = (videoId: string, videoTitle: string) => {
    trackVideoEvent("video_play", videoId, {
      video_title: videoTitle,
      action: "play",
    });
  };

  const trackVideoPause = (videoId: string, videoTitle: string) => {
    trackVideoEvent("video_pause", videoId, {
      video_title: videoTitle,
      action: "pause",
    });
  };

  const trackVideoSeek = (
    videoId: string,
    fromTime: number,
    toTime: number
  ) => {
    trackVideoEvent("video_seek", videoId, {
      from_time: fromTime,
      to_time: toTime,
    });
  };

  const trackVideoProgress = (
    videoId: string,
    currentTime: number,
    duration: number
  ) => {
    trackVideoEvent("video_progress", videoId, {
      current_time: currentTime,
      duration: duration,
      progress_percent: (currentTime / duration) * 100,
    });
  };

  const trackVideoComplete = (
    videoId: string,
    videoTitle: string,
    duration: number
  ) => {
    trackVideoEvent("video_complete", videoId, {
      video_title: videoTitle,
      video_duration: duration,
    });
  };

  const trackVocabularyLearned = (vocabId: string, vocabText: string) => {
    trackFeatureUsage("vocab_mark_known", {
      vocab_id: vocabId,
      vocab_text: vocabText,
    });

    trackLearningProgress("vocabulary_learning", 1, {
      vocab_id: vocabId,
      vocab_text: vocabText,
    });
  };

  const trackVocabularyMarkedUnknown = (vocabId: string, vocabText: string) => {
    trackFeatureUsage("vocab_mark_unknown", {
      vocab_id: vocabId,
      vocab_text: vocabText,
    });
  };

  const trackVocabularyClick = (
    vocabId: string,
    vocabText: string,
    videoId: string
  ) => {
    trackFeatureUsage("vocab_click", {
      vocab_id: vocabId,
      vocab_text: vocabText,
      video_id: videoId,
    });
  };

  const trackSearchUsage = (query: string, resultsCount: number) => {
    trackFeatureUsage("search_submit", {
      search_query: query,
      results_count: resultsCount,
    });
  };

  const trackTranscriptInteraction = (
    interactionType: string,
    videoId: string,
    lineNumber?: number
  ) => {
    if (interactionType === "scroll") {
      trackUserBehavior("transcript_scroll", {
        video_id: videoId,
        interaction_type: interactionType,
      });
    } else if (interactionType === "click_line") {
      trackUserBehavior("transcript_click_line", {
        video_id: videoId,
        line_number: lineNumber,
        interaction_type: interactionType,
      });
    }
  };

  return {
    trackVideoStart,
    trackVideoPause,
    trackVideoSeek,
    trackVideoProgress,
    trackVideoComplete,
    trackVocabularyLearned,
    trackVocabularyMarkedUnknown,
    trackVocabularyClick,
    trackSearchUsage,
    trackTranscriptInteraction,
  };
};
