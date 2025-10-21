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
    trackFeatureUsage("video_start", {
      video_id: videoId,
      video_title: videoTitle,
    });
  };

  const trackVideoComplete = (
    videoId: string,
    videoTitle: string,
    duration: number
  ) => {
    trackFeatureUsage("video_complete", {
      video_id: videoId,
      video_title: videoTitle,
      video_duration: duration,
    });

    trackLearningProgress("video_completion", 100, {
      video_id: videoId,
      video_title: videoTitle,
    });
  };

  const trackVocabularyLearned = (vocabId: string, vocabText: string) => {
    trackFeatureUsage("vocabulary_learned", {
      vocab_id: vocabId,
      vocab_text: vocabText,
    });

    trackLearningProgress("vocabulary_learning", 1, {
      vocab_id: vocabId,
      vocab_text: vocabText,
    });
  };

  const trackSearchUsage = (query: string, resultsCount: number) => {
    trackFeatureUsage("search_used", {
      search_query: query,
      results_count: resultsCount,
    });
  };

  const trackTranscriptInteraction = (
    interactionType: string,
    videoId: string
  ) => {
    trackUserBehavior("transcript_interaction", {
      interaction_type: interactionType,
      video_id: videoId,
    });
  };

  return {
    trackVideoStart,
    trackVideoComplete,
    trackVocabularyLearned,
    trackSearchUsage,
    trackTranscriptInteraction,
  };
};
