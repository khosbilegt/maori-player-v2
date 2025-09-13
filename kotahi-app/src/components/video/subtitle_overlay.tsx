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

      if (isNowFullscreen) {
        // Create a container for subtitles in fullscreen mode
        const container = document.createElement("div");
        container.id = "fullscreen-subtitle-container";
        container.style.position = "fixed";
        container.style.bottom = "100px";
        container.style.left = "50%";
        container.style.transform = "translateX(-50%)";
        container.style.zIndex = "999999";
        container.style.display = "flex";
        container.style.justifyContent = "center";
        container.style.alignItems = "center";
        container.style.pointerEvents = "none";
        container.style.width = "100vw";
        container.style.height = "auto";

        document.body.appendChild(container);
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
  }, []);

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
      className={`bg-black/90 text-white px-6 py-3 rounded-lg backdrop-blur-sm border border-white/30 shadow-2xl text-center font-medium ${
        isFullscreen ? "max-w-[90%] text-lg" : "max-w-[80%]"
      }`}
      style={{
        fontSize: `${fontSize * (isFullscreen ? 1.2 : 1)}rem`,
        textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
      }}
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
