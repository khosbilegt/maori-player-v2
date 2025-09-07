import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiClient } from "../../utils/apiClient";
import type { VideoData } from "../VideoCard";
import type { VideoFormData } from "../../types/admin";
import "./AdminForm.css";

interface VideoFormProps {
  video?: VideoData | null;
  onSubmit: (data: VideoFormData) => Promise<void>;
  onCancel: () => void;
}

interface VTTFile {
  filename: string;
  size: number;
  modified_at: string;
  url: string;
}

const VideoForm: React.FC<VideoFormProps> = ({ video, onSubmit, onCancel }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState<VideoFormData>({
    title: "",
    description: "",
    video: "",
    thumbnail: "",
    duration: "",
    subtitle: "",
  });
  const [vttFiles, setVttFiles] = useState<VTTFile[]>([]);
  const [loadingVTT, setLoadingVTT] = useState(false);

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

  // Load VTT files
  const loadVTTFiles = useCallback(async () => {
    if (!token) return;

    try {
      setLoadingVTT(true);
      const response = await apiClient.getVTTFiles(token);
      setVttFiles(response.data || []);
    } catch (err) {
      console.error("Failed to load VTT files:", err);
      // Don't show error to user as this is not critical
    } finally {
      setLoadingVTT(false);
    }
  }, [token]);

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

  // Load VTT files when component mounts
  useEffect(() => {
    loadVTTFiles();
  }, [loadVTTFiles]);

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
              <label htmlFor="subtitle">Transcript URL</label>
              <div className="vtt-select-container">
                <select
                  id="subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  className="vtt-select"
                  disabled={loadingVTT}
                >
                  <option value="">
                    Select a VTT file or enter custom URL
                  </option>
                  {vttFiles.map((file) => (
                    <option key={file.filename} value={file.url}>
                      📄 {file.filename}
                    </option>
                  ))}
                </select>
                <input
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  placeholder="Or enter custom VTT URL"
                  className="vtt-url-input"
                />
                {loadingVTT && (
                  <div className="vtt-loading">
                    <div className="loading-spinner small"></div>
                    Loading VTT files...
                  </div>
                )}
              </div>
              <div className="form-help">
                Choose from uploaded VTT files or enter a custom URL
              </div>
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
