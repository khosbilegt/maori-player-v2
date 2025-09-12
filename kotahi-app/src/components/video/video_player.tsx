"use client";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { VideoPlayerProps, VideoPlayerRef } from "./types";
import SubtitleOverlay from "./subtitle_overlay";
import SubtitleControls from "./subtitle_controls";

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
