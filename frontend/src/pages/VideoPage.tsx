import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import type { VideoPlayerRef } from "../components/VideoPlayer";
import TranscriptViewer from "../components/TranscriptViewer";
import type { TranscriptItem } from "../components/TranscriptViewer";
import { type VideoData } from "../components/VideoCard";
import { loadVTTTranscript } from "../utils/vttParser";
import { getVTTPath } from "../utils/assetPaths";
import { apiClient } from "../utils/apiClient";
import { useAuth } from "../contexts/AuthContext";
import "./VideoPage.css";

function VideoPage() {
  const location = useLocation();
  const selectedVideo = location.state?.selectedVideo as VideoData | undefined;
  const { user, token } = useAuth();

  const [currentTime, setCurrentTime] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [videoDuration, setVideoDuration] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const videoPlayerRef = useRef<VideoPlayerRef>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to update watch history
  const updateWatchHistory = useCallback(
    async (currentTime: number, duration: number) => {
      if (!user || !token || !selectedVideo?.id) {
        return;
      }

      try {
        const progress = duration > 0 ? currentTime / duration : 0;
        const completed = progress >= 0.9; // Consider 90% as completed

        await apiClient.createOrUpdateWatchHistory(token, {
          video_id: selectedVideo.id,
          progress,
          current_time: currentTime,
          duration,
          completed,
        });

        setLastUpdateTime(currentTime);
      } catch (error) {
        console.error("Failed to update watch history:", error);
      }
    },
    [user, token, selectedVideo?.id]
  );

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);

    // Update watch history every 10 seconds
    if (time - lastUpdateTime >= 10) {
      updateWatchHistory(time, videoDuration);
    }
  };

  const handleSeek = (time: number) => {
    videoPlayerRef.current?.seekTo(time);
    setCurrentTime(time);
    // Update watch history immediately when seeking
    updateWatchHistory(time, videoDuration);
  };

  // Load transcript from VTT file
  useEffect(() => {
    const loadTranscript = async () => {
      setIsLoading(true);
      try {
        // Use the subtitle file from the selected video or fallback to default
        const subtitleFile = selectedVideo?.subtitle || "tetepus10e6.vtt";
        const vttUrl = getVTTPath(subtitleFile);
        const transcriptData = await loadVTTTranscript(vttUrl);
        setTranscript(transcriptData);
      } catch (error) {
        console.error("Failed to load transcript:", error);
        setTranscript([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTranscript();
  }, [selectedVideo]);

  // Handle video duration change
  const handleDurationChange = useCallback((duration: number) => {
    setVideoDuration(duration);
  }, []);

  // Handle video end - mark as completed
  const handleVideoEnd = useCallback(() => {
    if (videoDuration > 0) {
      updateWatchHistory(videoDuration, videoDuration);
    }
  }, [videoDuration, updateWatchHistory]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const interval = updateIntervalRef.current;
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <Link to="/library" className="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M12 19L5 12L12 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Library
        </Link>
        <h1>{selectedVideo?.title || "Māori Language Player"}</h1>
      </header>
      <main className="app-main">
        <div className="video-section">
          <VideoPlayer
            ref={videoPlayerRef}
            src={selectedVideo?.video || "/tetepus10e6.mp4"}
            subtitleSrc={getVTTPath(
              selectedVideo?.subtitle || "tetepus10e6.vtt"
            )}
            onTimeUpdate={handleTimeUpdate}
            onDurationChange={handleDurationChange}
            onVideoEnd={handleVideoEnd}
            className="main-video-player"
            transcript={transcript}
            currentTime={currentTime}
          />
        </div>
        <div className="transcript-section">
          {isLoading ? (
            <div className="transcript-loading">
              <div className="loading-spinner"></div>
              <p>Loading transcript...</p>
            </div>
          ) : (
            <TranscriptViewer
              transcript={transcript}
              currentTime={currentTime}
              onSeek={handleSeek}
              className="main-transcript-viewer"
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default VideoPage;
