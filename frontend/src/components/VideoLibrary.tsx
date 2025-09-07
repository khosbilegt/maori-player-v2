import React, { useState, useMemo } from "react";
import VideoCard, { type VideoData } from "./VideoCard";
import SearchBar from "./SearchBar";
import { useNavigate } from "react-router-dom";

interface VideoLibraryProps {
  videos: VideoData[];
}

const VideoLibrary: React.FC<VideoLibraryProps> = ({ videos }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return videos;

    const query = searchQuery.toLowerCase();
    return videos.filter(
      (video) =>
        video.title.toLowerCase().includes(query) ||
        video.description.toLowerCase().includes(query)
    );
  }, [videos, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="video-library">
      <div className="library-header">
        <div className="library-header-content">
          <h1 className="library-title">Māori Language Library</h1>
          <p className="library-subtitle">
            Discover and learn with our collection of Māori language videos
          </p>
        </div>
        <div className="library-search">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      <div className="library-stats">
        <div className="stats-item">
          <span className="stats-number">{filteredVideos.length}</span>
          <span className="stats-label">
            {filteredVideos.length === 1 ? "Video" : "Videos"} Found
          </span>
        </div>
        {searchQuery && (
          <div className="stats-item">
            <span className="stats-search">
              Results for: "<strong>{searchQuery}</strong>"
            </span>
          </div>
        )}
      </div>

      {filteredVideos.length > 0 ? (
        <div className="video-grid">
          {filteredVideos.map((video) => (
            <VideoCard
              key={`${video.id}-${video.title}`}
              video={video}
              onPlay={() => {
                navigate(`/video/${video.id}`, {
                  state: { selectedVideo: video },
                });
              }}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <circle
                cx="11"
                cy="11"
                r="8"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M21 21L16.65 16.65"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 className="empty-state-title">No videos found</h3>
          <p className="empty-state-description">
            {searchQuery
              ? `No videos match "${searchQuery}". Try adjusting your search terms.`
              : "No videos available in the library."}
          </p>
          {searchQuery && (
            <button
              className="empty-state-button"
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoLibrary;
