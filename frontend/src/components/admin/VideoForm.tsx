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
    url: "",
    thumbnail_url: "",
    duration: 0,
    category: "",
    tags: [],
    language: "Māori",
    difficulty_level: "Beginner",
    transcript_url: "",
    subtitles_url: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title || "",
        description: video.description || "",
        url: video.url || video.video || "",
        thumbnail_url: video.thumbnail_url || video.thumbnail || "",
        duration: typeof video.duration === "number" ? video.duration : 0,
        category: video.category || "",
        tags: video.tags || [],
        language: video.language || "Māori",
        difficulty_level: video.difficulty_level || "Beginner",
        transcript_url: video.transcript_url || "",
        subtitles_url: video.subtitles_url || video.subtitle || "",
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

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTagAdd();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save video");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "Education",
    "Entertainment",
    "Documentary",
    "Tutorial",
    "News",
    "Culture",
    "Language Learning",
    "History",
    "Music",
    "Art",
  ];

  const difficultyLevels = ["Beginner", "Intermediate", "Advanced"];
  const languages = ["Māori", "English", "Bilingual"];

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

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="url">Video URL *</label>
              <input
                type="url"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                required
                placeholder="https://example.com/video.mp4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="thumbnail_url">Thumbnail URL</label>
              <input
                type="url"
                id="thumbnail_url"
                name="thumbnail_url"
                value={formData.thumbnail_url}
                onChange={handleInputChange}
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration">Duration (seconds) *</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                required
                min="0"
                placeholder="300"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="language">Language *</label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                required
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="difficulty_level">Difficulty Level *</label>
              <select
                id="difficulty_level"
                name="difficulty_level"
                value={formData.difficulty_level}
                onChange={handleInputChange}
                required
              >
                {difficultyLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <div className="tags-input">
              <div className="tags-list">
                {formData.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className="tag-remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="tag-input-group">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={handleTagAdd}
                  className="btn btn-sm btn-secondary"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="transcript_url">Transcript URL</label>
              <input
                type="url"
                id="transcript_url"
                name="transcript_url"
                value={formData.transcript_url}
                onChange={handleInputChange}
                placeholder="https://example.com/transcript.txt"
              />
            </div>

            <div className="form-group">
              <label htmlFor="subtitles_url">Subtitles URL</label>
              <input
                type="url"
                id="subtitles_url"
                name="subtitles_url"
                value={formData.subtitles_url}
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
