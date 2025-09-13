"use client";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { VideoPlayerProps, VideoPlayerRef } from "./types";
import { environment } from "@/lib/config";
import SubtitleOverlay from "./subtitle_overlay";
import SubtitleControls from "./subtitle_controls";

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  (
    {
      src,
      subtitleSrc,
      onTimeUpdate,
      onDurationChange,
      onVideoEnd,
      className = "",
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [subtitleFontSize, setSubtitleFontSize] = useState(1.1);
    const [trackElement, setTrackElement] = useState<HTMLTrackElement | null>(
      null
    );

    const handleSubtitleSizeChange = (size: number) => {
      setSubtitleFontSize(size);
    };

    // Handle dynamic subtitle loading
    useEffect(() => {
      const video = videoRef.current;
      if (!video || !subtitleSrc) return;

      // Remove existing track if it exists
      if (trackElement) {
        video.removeChild(trackElement);
      }

      // Create new track element
      const track = document.createElement("track");
      track.kind = "subtitles";
      track.src = environment.apiBaseUrl + subtitleSrc;
      track.srclang = "en";
      track.label = "English";
      track.default = true;

      video.appendChild(track);
      setTrackElement(track);

      // Cleanup function
      return () => {
        if (trackElement && video.contains(trackElement)) {
          video.removeChild(trackElement);
        }
      };
    }, [subtitleSrc]);

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
      <div className={`relative w-full max-w-4xl mx-auto ${className}`}>
        <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
          <video
            ref={videoRef}
            src={src}
            controls
            className="w-full h-auto"
            preload="metadata"
          />
        </div>
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
