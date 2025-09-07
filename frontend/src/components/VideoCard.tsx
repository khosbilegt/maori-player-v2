import React from "react";

export interface VideoData {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  video: string;
  subtitle?: string;
  duration?: string;
}

interface VideoCardProps {
  video: VideoData;
  onPlay: (video: VideoData) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onPlay }) => {
  const handlePlayClick = () => {
    onPlay(video);
  };

  return (
    <div className="video-card">
      <div className="video-card-thumbnail">
        <img src={video.thumbnail} alt={video.title} loading="lazy" />
        {video.duration && (
          <div className="video-duration">{video.duration}</div>
        )}
        <div className="video-card-overlay">
          <button className="play-button" onClick={handlePlayClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M8 5V19L19 12L8 5Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
            Play
          </button>
        </div>
      </div>
      <div className="video-card-content">
        <h3 className="video-card-title">{video.title}</h3>
        <p className="video-card-description">{video.description}</p>
        <div className="video-card-actions">
          <button
            className="video-card-button primary"
            onClick={handlePlayClick}
          >
            Watch Now
          </button>
          <button className="video-card-button secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 14C19 15.1 18.1 16 17 16H5L12 23L19 16Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 16V4C5 2.9 5.9 2 7 2H17C18.1 2 19 2.9 19 4V14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
