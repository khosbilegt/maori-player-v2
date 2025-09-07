import React, { useState, useEffect } from "react";
import type { VideoData } from "../VideoCard";
import type { VideoFormData } from "../../types/admin";
import "./AdminForm.css";

interface VideoFormProps {
  video?: VideoData | null;
  onSubmit: (data: VideoFormData) => Promise<void>;
  onCancel: () => void;
}

const VideoForm: React.FC<VideoFormProps> = ({ video, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<VideoFormData>({
    title: "",
    description: "",
    video: "",
    thumbnail: "",
    duration: "",
    subtitle: "",
  });

  // Helper functions to convert between seconds and MM:SS format
  const secondsToMMSS = (seconds: number | string): string => {
    const totalSeconds =
      typeof seconds === "string" ? parseInt(seconds) || 0 : seconds;
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Helper function to check if a string is already in MM:SS format
  const isMMSSFormat = (value: string): boolean => {
    return /^([0-5]?[0-9]):([0-5][0-9])$/.test(value);
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (video) {
      // Handle duration - convert from seconds to MM:SS if needed
      let durationValue = video.duration || "";
      if (durationValue && !isMMSSFormat(durationValue)) {
        // If it's not already in MM:SS format, assume it's seconds and convert
        durationValue = secondsToMMSS(durationValue);
      }

      setFormData({
        title: video.title || "",
        description: video.description || "",
        video: video.video || video.video || "",
        thumbnail: video.thumbnail || video.thumbnail || "",
        duration: durationValue,
        subtitle: video.subtitle || video.subtitles_url || "",
      });
    }
  }, [video]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Send duration in MM:SS format
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <div className="admin-modal-header">
          <h3>{video ? "Edit Video" : "Create New Video"}</h3>
          <button onClick={onCancel} className="modal-close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Enter video title"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                placeholder="Enter video description"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="video">Video URL *</label>
              <input
                type="url"
                id="video"
                name="video"
                value={formData.video}
                onChange={handleInputChange}
                required
                placeholder="https://example.com/video.mp4"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="thumbnail">Thumbnail URL</label>
              <input
                type="url"
                id="thumbnail"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleInputChange}
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration">Duration (MM:SS) *</label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                required
                pattern="^([0-5]?[0-9]):([0-5][0-9])$"
                placeholder="05:30"
              />
              <div className="form-help">
                Enter duration in MM:SS format (e.g., 05:30 for 5 minutes 30
                seconds)
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="subtitles_url">Transcript URL</label>
              <input
                type="url"
                id="subtitle"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                placeholder="https://example.com/subtitles.vtt"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : video ? "Update Video" : "Create Video"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoForm;
