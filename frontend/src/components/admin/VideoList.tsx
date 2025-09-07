import React, { useState, useEffect } from "react";
import { apiClient } from "../../utils/apiClient";
import type { VideoData } from "../VideoCard";
import type { VideoFormData } from "../../types/admin";
import VideoForm from "./VideoForm";
import "./AdminTable.css";

interface VideoListProps {
  onEdit?: (video: VideoData) => void;
  onDelete?: (id: string) => void;
}

const VideoList: React.FC<VideoListProps> = ({ onDelete }) => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoData | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getVideos();
      setVideos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingVideo(null);
    setShowForm(true);
  };

  const handleEdit = (video: VideoData) => {
    setEditingVideo(video);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData: VideoFormData) => {
    try {
      if (editingVideo) {
        await apiClient.updateVideo(editingVideo.id, formData);
      } else {
        await apiClient.createVideo(formData);
      }
      setShowForm(false);
      setEditingVideo(null);
      await loadVideos();
    } catch (err) {
      console.error("Failed to save video:", err);
      throw err;
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingVideo(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        await apiClient.deleteVideo(id);
        await loadVideos();
        onDelete?.(id);
      } catch (err) {
        console.error("Failed to delete video:", err);
        setError(err instanceof Error ? err.message : "Failed to delete video");
      }
    }
  };

  const formatDuration = (duration: string | number | undefined) => {
    if (typeof duration === "string") {
      return duration;
    }
    if (typeof duration === "number") {
      const mins = Math.floor(duration / 60);
      const secs = duration % 60;
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }
    return "Unknown";
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading videos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <p>Error: {error}</p>
        <button onClick={loadVideos} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="admin-table-container">
      <div className="admin-table-header">
        <h2>Videos ({videos.length})</h2>
        <button onClick={handleCreate} className="btn btn-primary">
          + Add Video
        </button>
      </div>

      {videos.length === 0 ? (
        <div className="admin-empty-state">
          <p>No videos found. Create your first video to get started.</p>
          <button onClick={handleCreate} className="btn btn-primary">
            + Add Video
          </button>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Duration</th>
                <th>Language</th>
                <th>Difficulty</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr key={video.id}>
                  <td>
                    <div className="video-title-cell">
                      {(video.thumbnail_url || video.thumbnail) && (
                        <img
                          src={video.thumbnail_url || video.thumbnail}
                          alt={video.title}
                          className="video-thumbnail"
                        />
                      )}
                      <div>
                        <div className="video-title">{video.title}</div>
                        <div className="video-description">
                          {video.description?.substring(0, 100)}
                          {video.description &&
                            video.description.length > 100 &&
                            "..."}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-secondary">
                      {video.category || "Uncategorized"}
                    </span>
                  </td>
                  <td>{formatDuration(video.duration)}</td>
                  <td>
                    <span className="badge badge-info">
                      {video.language || "Unknown"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge badge-${(
                        video.difficulty_level || "beginner"
                      ).toLowerCase()}`}
                    >
                      {video.difficulty_level || "Beginner"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button
                        onClick={() => handleEdit(video)}
                        className="btn btn-sm btn-secondary"
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
                        className="btn btn-sm btn-danger"
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <VideoForm
          video={editingVideo}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};

export default VideoList;
