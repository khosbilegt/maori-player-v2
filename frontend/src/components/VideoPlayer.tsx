import {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import SubtitleOverlay from "./SubtitleOverlay";
import SubtitleControls from "./SubtitleControls";
import type { TranscriptItem } from "./TranscriptViewer";

export interface VideoPlayerRef {
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (time: number) => void;
  play: () => void;
  pause: () => void;
}

interface VideoPlayerProps {
  src?: string;
  subtitleSrc?: string;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  onVideoEnd?: () => void;
  className?: string;
  transcript?: TranscriptItem[];
  currentTime?: number;
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  (
    {
      src,
      onTimeUpdate,
      onDurationChange,
      onVideoEnd,
      className = "",
      transcript,
      currentTime = 0,
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [subtitleFontSize, setSubtitleFontSize] = useState(1.1);

    const handleSubtitleSizeChange = (size: number) => {
      setSubtitleFontSize(size);
    };

    useImperativeHandle(ref, () => ({
      getCurrentTime: () => videoRef.current?.currentTime || 0,
      getDuration: () => videoRef.current?.duration || 0,
      seekTo: (time: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = time;
        }
      },
      play: () => videoRef.current?.play(),
      pause: () => videoRef.current?.pause(),
    }));

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const handleTimeUpdate = () => {
        onTimeUpdate?.(video.currentTime);
      };

      const handleLoadedMetadata = () => {
        onDurationChange?.(video.duration);
      };

      const handleVideoEnd = () => {
        onVideoEnd?.();
      };

      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("ended", handleVideoEnd);

      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("ended", handleVideoEnd);
      };
    }, [onTimeUpdate, onDurationChange, onVideoEnd]);

    return (
      <div className={`video-player ${className}`}>
        <div className="video-container">
          <video
            ref={videoRef}
            src={src}
            controls
            className="video-element"
            preload="metadata"
          />
          {transcript && (
            <SubtitleOverlay
              transcript={transcript}
              currentTime={currentTime}
              className="video-subtitles"
              fontSize={subtitleFontSize}
            />
          )}

          <SubtitleControls
            onSizeChange={handleSubtitleSizeChange}
            className="video-subtitle-controls"
          />
        </div>
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
