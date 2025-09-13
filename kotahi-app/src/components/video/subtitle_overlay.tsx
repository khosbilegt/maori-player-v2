import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { TranscriptItem, SubtitleOverlayProps } from "./types";

const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  transcript,
  currentTime,
  className = "",
  fontSize = 1.1,
  videoRef,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);

      if (isNowFullscreen && videoRef?.current) {
        // Create a container for subtitles in fullscreen mode
        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.bottom = "80px";
        container.style.left = "0";
        container.style.right = "0";
        container.style.zIndex = "9999";
        container.style.display = "flex";
        container.style.justifyContent = "center";
        container.style.pointerEvents = "none";

        videoRef.current.appendChild(container);
        fullscreenContainerRef.current = container;
      } else if (!isNowFullscreen && fullscreenContainerRef.current) {
        // Clean up fullscreen container
        fullscreenContainerRef.current.remove();
        fullscreenContainerRef.current = null;
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (fullscreenContainerRef.current) {
        fullscreenContainerRef.current.remove();
      }
    };
  }, [videoRef]);

  // Find the current active subtitle
  const currentSubtitle = transcript
    .slice()
    .reverse()
    .find(
      (item) => currentTime >= item.startTime && currentTime <= item.endTime
    );

  if (!currentSubtitle) {
    return null;
  }

  const subtitleElement = (
    <div
      className="bg-black/80 text-white px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg max-w-[80%] text-center"
      style={{ fontSize: `${fontSize}rem` }}
    >
      {currentSubtitle.text}
    </div>
  );

  // In fullscreen mode, render subtitles inside the video element
  if (isFullscreen && fullscreenContainerRef.current) {
    return createPortal(subtitleElement, fullscreenContainerRef.current);
  }

  // In normal mode, render subtitles in the regular container
  return (
    <div
      className={`absolute bottom-20 left-0 right-0 z-10 flex justify-center ${className}`}
    >
      {subtitleElement}
    </div>
  );
};

export default SubtitleOverlay;
