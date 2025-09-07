import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiClient } from "../utils/apiClient";
import { type VideoData } from "../components/VideoCard";
import "./HistoryPage.css";

interface WatchHistoryItem {
  id: string;
  user_id: string;
  video_id: string;
  progress: number;
  current_time: number;
  duration: number;
  completed: boolean;
  last_watched: string;
  created_at: string;
  updated_at: string;
}

interface VideoWithHistory extends VideoData {
  watchHistory?: WatchHistoryItem;
}

function HistoryPage() {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [recentVideos, setRecentVideos] = useState<VideoWithHistory[]>([]);
  const [completedVideos, setCompletedVideos] = useState<VideoWithHistory[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"recent" | "completed">("recent");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Load watch history data
  useEffect(() => {
    const loadWatchHistory = async () => {
      if (!token) return;

      setIsLoading(true);
      setError(null);

      try {
        // Load all videos first
        const allVideos = await apiClient.getVideos();

        // Load recent watch history (last 10 videos)
        const recentHistoryResponse = await apiClient.getRecentWatched(
          token,
          10
        );
        const recentHistory = recentHistoryResponse.data || [];

        // Load completed videos
        const completedHistoryResponse = await apiClient.getCompletedVideos(
          token
        );
        const completedHistory = completedHistoryResponse.data || [];

        // Create a map of video_id to watch history
        const historyMap = new Map<string, WatchHistoryItem>();
        recentHistory.forEach((item: any) => {
          historyMap.set(item.video_id, item);
        });
        completedHistory.forEach((item: any) => {
          historyMap.set(item.video_id, item);
        });

        // Combine videos with their watch history
        const recentWithHistory = recentHistory
          .map((item: any) => {
            const video = allVideos.find((v) => v.id === item.video_id);
            return video ? { ...video, watchHistory: item } : null;
          })
          .filter(Boolean) as VideoWithHistory[];

        const completedWithHistory = completedHistory
          .map((item: any) => {
            const video = allVideos.find((v) => v.id === item.video_id);
            return video ? { ...video, watchHistory: item } : null;
          })
          .filter(Boolean) as VideoWithHistory[];

        setRecentVideos(recentWithHistory);
        setCompletedVideos(completedWithHistory);
      } catch (err) {
        console.error("Failed to load watch history:", err);
        setError("Failed to load watch history. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadWatchHistory();
  }, [token]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `Today at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (diffInHours < 48) {
      return `Yesterday at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleVideoClick = (video: VideoWithHistory) => {
    navigate("/video", { state: { selectedVideo: video } });
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="history-page">
      <header className="history-header">
        <h1>Watch History</h1>
        <p>Continue watching your videos or explore completed content</p>
      </header>

      <div className="history-tabs">
        <button
          className={`tab-button ${activeTab === "recent" ? "active" : ""}`}
          onClick={() => setActiveTab("recent")}
        >
          Recently Watched
        </button>
        <button
          className={`tab-button ${activeTab === "completed" ? "active" : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          Completed Videos
        </button>
      </div>

      <main className="history-content">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your watch history...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="videos-grid">
            {(activeTab === "recent" ? recentVideos : completedVideos).map(
              (video) => (
                <div
                  key={video.id}
                  className="history-video-card"
                  onClick={() => handleVideoClick(video)}
                >
                  <div className="video-thumbnail">
                    <img
                      src={video.thumbnail || "/maori.png"}
                      alt={video.title}
                    />
                    {video.watchHistory && (
                      <div className="progress-overlay">
                        <div
                          className="progress-bar"
                          style={{
                            width: `${video.watchHistory.progress * 100}%`,
                          }}
                        ></div>
                      </div>
                    )}
                    {video.watchHistory?.completed && (
                      <div className="completed-badge">
                        <span>✓</span>
                      </div>
                    )}
                  </div>

                  <div className="video-info">
                    <h3 className="video-title">{video.title}</h3>
                    <p className="video-description">{video.description}</p>

                    {video.watchHistory && (
                      <div className="watch-info">
                        <div className="progress-info">
                          <span className="progress-text">
                            {activeTab === "recent"
                              ? `${Math.round(
                                  video.watchHistory.progress * 100
                                )}% watched`
                              : "Completed"}
                          </span>
                          <span className="time-info">
                            {activeTab === "recent"
                              ? `${formatTime(
                                  video.watchHistory.current_time
                                )} / ${formatTime(video.watchHistory.duration)}`
                              : formatTime(video.watchHistory.duration)}
                          </span>
                        </div>
                        <div className="last-watched">
                          Last watched:{" "}
                          {formatDate(video.watchHistory.last_watched)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {!isLoading &&
          !error &&
          (activeTab === "recent" ? recentVideos : completedVideos).length ===
            0 && (
            <div className="empty-state">
              <div className="empty-icon">📺</div>
              <h3>
                No {activeTab === "recent" ? "recent" : "completed"} videos
              </h3>
              <p>
                {activeTab === "recent"
                  ? "Start watching some videos to see them here!"
                  : "Complete some videos to see them here!"}
              </p>
              <Link to="/library" className="browse-button">
                Browse Library
              </Link>
            </div>
          )}
      </main>
    </div>
  );
}

export default HistoryPage;
