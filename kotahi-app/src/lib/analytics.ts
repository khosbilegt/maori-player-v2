import { posthog } from "./posthog";

// Helper to get current user info
const getCurrentUser = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Decode JWT token to get user info
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

// Video tracking events
export const trackVideoPlay = (
  positionSec: number,
  playbackRate: number,
  videoId?: string
) => {
  const user = getCurrentUser();
  posthog.capture("video_play", {
    position_sec: positionSec,
    playback_rate: playbackRate,
    video_id: videoId,
    user_id: user?.user_id,
    user_email: user?.email,
    user_role: user?.role,
  });
};

export const trackVideoPause = (positionSec: number, videoId?: string) => {
  const user = getCurrentUser();
  posthog.capture("video_pause", {
    position_sec: positionSec,
    video_id: videoId,
    user_id: user?.user_id,
    user_email: user?.email,
    user_role: user?.role,
  });
};

export const trackVideoSeek = (
  fromSec: number,
  toSec: number,
  videoId?: string
) => {
  const user = getCurrentUser();
  posthog.capture("video_seek", {
    from_sec: fromSec,
    to_sec: toSec,
    video_id: videoId,
    user_id: user?.user_id,
    user_email: user?.email,
    user_role: user?.role,
  });
};

export const trackVideoComplete = (videoId?: string) => {
  const user = getCurrentUser();
  posthog.capture("video_complete", {
    video_id: videoId,
    user_id: user?.user_id,
    user_email: user?.email,
    user_role: user?.role,
  });
};

export const trackVideoProgress = (progress: number, videoId?: string) => {
  const user = getCurrentUser();
  posthog.capture("video_progress", {
    progress_percent: progress,
    video_id: videoId,
    user_id: user?.user_id,
    user_email: user?.email,
    user_role: user?.role,
  });
};

// Transcript tracking events
export const trackTranscriptScroll = (
  scrollPosition: number,
  videoId?: string
) => {
  const user = getCurrentUser();
  posthog.capture("transcript_scroll", {
    scroll_position: scrollPosition,
    video_id: videoId,
    user_id: user?.user_id,
    user_email: user?.email,
    user_role: user?.role,
  });
};

export const trackTranscriptClickLine = (lineId: string, videoId?: string) => {
  const user = getCurrentUser();
  posthog.capture("transcript_click_line", {
    line_id: lineId,
    video_id: videoId,
    user_id: user?.user_id,
    user_email: user?.email,
    user_role: user?.role,
  });
};

// Vocabulary tracking events
export const trackVocabOpen = (vocabId: string, videoId?: string) => {
  const user = getCurrentUser();
  posthog.capture("vocab_open", {
    vocab_id: vocabId,
    video_id: videoId,
    user_id: user?.user_id,
    user_email: user?.email,
    user_role: user?.role,
  });
};

export const trackVocabMarkKnown = (vocabId: string, videoId?: string) => {
  const user = getCurrentUser();
  posthog.capture("vocab_mark_known", {
    vocab_id: vocabId,
    video_id: videoId,
    user_id: user?.user_id,
    user_email: user?.email,
    user_role: user?.role,
  });
};

export const trackVocabMarkUnknown = (vocabId: string, videoId?: string) => {
  const user = getCurrentUser();
  posthog.capture("vocab_mark_unknown", {
    vocab_id: vocabId,
    video_id: videoId,
    user_id: user?.user_id,
    user_email: user?.email,
    user_role: user?.role,
  });
};

// Search tracking events
export const trackSearchSubmit = (query: string, videoId?: string) => {
  const user = getCurrentUser();
  posthog.capture("search_submit", {
    query_len: query.length,
    video_id: videoId,
    user_id: user?.user_id,
    user_email: user?.email,
    user_role: user?.role,
  });
};

// Utility for throttling events
export const createThrottledTracker = (
  tracker: () => void,
  delay: number = 1000
) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return () => {
    if (timeoutId) return;

    timeoutId = setTimeout(() => {
      tracker();
      timeoutId = null;
    }, delay);
  };
};

// Video progress tracking with quartiles
export class VideoProgressTracker {
  private videoId?: string;
  private duration: number = 0;
  private lastProgress: number = 0;
  private lastQuartile: number = 0;
  private lastMinute: number = 0;

  constructor(videoId?: string) {
    this.videoId = videoId;
  }

  setDuration(duration: number) {
    this.duration = duration;
  }

  updateProgress(currentTime: number) {
    const progress = (currentTime / this.duration) * 100;

    // Track quartiles (25%, 50%, 75%)
    const currentQuartile = Math.floor(progress / 25) * 25;
    if (currentQuartile > this.lastQuartile && currentQuartile <= 75) {
      trackVideoProgress(currentQuartile, this.videoId);
      this.lastQuartile = currentQuartile;
    }

    // Track every 60 seconds
    const currentMinute = Math.floor(currentTime / 60);
    if (currentMinute > this.lastMinute) {
      trackVideoProgress(progress, this.videoId);
      this.lastMinute = currentMinute;
    }

    // Track completion at 95%
    if (progress >= 95 && this.lastProgress < 95) {
      trackVideoComplete(this.videoId);
    }

    this.lastProgress = progress;
  }
}
