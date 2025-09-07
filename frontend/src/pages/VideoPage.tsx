import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import type { VideoPlayerRef } from "../components/VideoPlayer";
import TranscriptViewer from "../components/TranscriptViewer";
import type { TranscriptItem } from "../components/TranscriptViewer";
import { type VideoData } from "../components/VideoCard";
import { loadVTTTranscript } from "../utils/vttParser";
import { getVTTPath } from "../utils/assetPaths";
import "./VideoPage.css";

function VideoPage() {
  const location = useLocation();
  const selectedVideo = location.state?.selectedVideo as VideoData | undefined;

  const [currentTime, setCurrentTime] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const videoPlayerRef = useRef<VideoPlayerRef>(null);

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleSeek = (time: number) => {
    videoPlayerRef.current?.seekTo(time);
    setCurrentTime(time);
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
