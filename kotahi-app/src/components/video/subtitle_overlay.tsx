import { TranscriptItem } from "./types";

interface SubtitleOverlayProps {
  transcript: TranscriptItem[];
  currentTime: number;
  className?: string;
  fontSize?: number;
}

const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  transcript,
  currentTime,
  className = "",
  fontSize = 1.1,
}) => {
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

  return (
    <div className={`subtitle-overlay ${className}`}>
      <div className="subtitle-text" style={{ fontSize: `${fontSize}rem` }}>
        {currentSubtitle.text}
      </div>
    </div>
  );
};

export default SubtitleOverlay;
