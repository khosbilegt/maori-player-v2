import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { SubtitleControlsProps } from "./types";

const SubtitleControls: React.FC<SubtitleControlsProps> = ({
  onSizeChange,
  className = "",
  videoRef,
}) => {
  const [fontSize, setFontSize] = useState(1.1); // Default 1.1rem
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenContainerRef = useRef<HTMLDivElement | null>(null);
  const minSize = 0.7;
  const maxSize = 2.0;
  const stepSize = 0.1;

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + stepSize, maxSize);
    setFontSize(newSize);
    onSizeChange(newSize);
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - stepSize, minSize);
    setFontSize(newSize);
    onSizeChange(newSize);
  };

  const resetFontSize = () => {
    const defaultSize = 1.1;
    setFontSize(defaultSize);
    onSizeChange(defaultSize);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);

      if (isNowFullscreen && videoRef?.current) {
        // Create a container for controls in fullscreen mode
        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.bottom = "16px";
        container.style.left = "16px";
        container.style.zIndex = "9999";
        container.style.pointerEvents = "auto";

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

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key) {
        case "+":
        case "=": // Handle both + and = (since + requires shift)
          event.preventDefault();
          increaseFontSize();
          break;
        case "-":
          event.preventDefault();
          decreaseFontSize();
          break;
        case "0":
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            resetFontSize();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [fontSize]);

  const formatSize = (size: number) => `${Math.round(size * 100)}%`;

  const controlsElement = (
    <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-3">
      <div className="text-white text-sm font-medium mb-2">Subtitle Size</div>
      <div className="flex items-center gap-2 mb-2">
        <button
          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={decreaseFontSize}
          disabled={fontSize <= minSize}
          title="Decrease subtitle size (-)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <line
              x1="5"
              y1="12"
              x2="19"
              y2="12"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </button>

        <div className="text-white text-sm font-medium min-w-[3rem] text-center">
          {formatSize(fontSize)}
        </div>

        <button
          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={increaseFontSize}
          disabled={fontSize >= maxSize}
          title="Increase subtitle size (+)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <line
              x1="12"
              y1="5"
              x2="12"
              y2="19"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="5"
              y1="12"
              x2="19"
              y2="12"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </button>
      </div>

      <button
        className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
        onClick={resetFontSize}
        title="Reset subtitle size (Ctrl+0)"
      >
        Reset
      </button>
    </div>
  );

  // In fullscreen mode, render controls inside the video element
  if (isFullscreen && fullscreenContainerRef.current) {
    return createPortal(controlsElement, fullscreenContainerRef.current);
  }

  // In normal mode, render controls in the regular container
  return (
    <div className={`absolute bottom-4 left-4 z-20 ${className}`}>
      {controlsElement}
    </div>
  );
};

export default SubtitleControls;
