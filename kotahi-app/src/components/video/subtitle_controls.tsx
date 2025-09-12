import { useEffect, useState } from "react";
import { SubtitleControlsProps } from "./types";

const SubtitleControls: React.FC<SubtitleControlsProps> = ({
  onSizeChange,
  className = "",
}) => {
  const [fontSize, setFontSize] = useState(1.1); // Default 1.1rem
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

  return (
    <div className={`subtitle-controls ${className}`}>
      <div className="subtitle-controls-label">Subtitle Size</div>
      <div className="subtitle-controls-buttons">
        <button
          className="subtitle-control-btn decrease"
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

        <div className="subtitle-size-display">{formatSize(fontSize)}</div>

        <button
          className="subtitle-control-btn increase"
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
        className="subtitle-reset-btn"
        onClick={resetFontSize}
        title="Reset subtitle size (Ctrl+0)"
      >
        Reset
      </button>
    </div>
  );
};

export default SubtitleControls;
