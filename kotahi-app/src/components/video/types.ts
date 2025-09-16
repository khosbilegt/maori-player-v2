export interface VideoPlayerRef {
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (time: number) => void;
  play: () => void;
  pause: () => void;
}

export interface TranscriptItem {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

export interface VideoPlayerProps {
  src?: string;
  subtitleSrc?: string;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  onVideoEnd?: () => void;
  className?: string;
  transcript?: TranscriptItem[];
  currentTime?: number;
  initialTime?: number;
}

export interface SubtitleOverlayProps {
  transcript: TranscriptItem[];
  currentTime: number;
  className?: string;
  fontSize?: number;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}

export interface SubtitleControlsProps {
  onSizeChange: (size: number) => void;
  className?: string;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}
