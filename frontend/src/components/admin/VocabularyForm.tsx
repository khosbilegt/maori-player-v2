import React, { useState, useEffect } from "react";
import type { VocabularyFormData } from "../../types/admin";
import "./AdminForm.css";

interface Vocabulary {
  id: string;
  maori: string;
  english: string;
  pronunciation: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface VocabularyFormProps {
  vocabulary?: Vocabulary | null;
  onSubmit: (data: VocabularyFormData) => Promise<void>;
  onCancel: () => void;
}

const VocabularyForm: React.FC<VocabularyFormProps> = ({
  vocabulary,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<VocabularyFormData>({
    maori: "",
    english: "",
    pronunciation: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (vocabulary) {
      setFormData({
        maori: vocabulary.maori || "",
        english: vocabulary.english || "",
        pronunciation: vocabulary.pronunciation || "",
        description: vocabulary.description || "",
      });
    }
  }, [vocabulary]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      await onSubmit(formData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save vocabulary"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <div className="admin-modal-header">
          <h3>{vocabulary ? "Edit Vocabulary" : "Create New Vocabulary"}</h3>
          <button onClick={onCancel} className="modal-close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="maori">Māori Text *</label>
            <input
              type="text"
              id="maori"
              name="maori"
              value={formData.maori}
              onChange={handleInputChange}
              required
              placeholder="Enter Māori text"
              maxLength={200}
            />
            <small className="form-help">
              The Māori word or phrase (max 200 characters)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="english">English Translation *</label>
            <input
              type="text"
              id="english"
              name="english"
              value={formData.english}
              onChange={handleInputChange}
              required
              placeholder="Enter English translation"
              maxLength={200}
            />
            <small className="form-help">
              The English translation (max 200 characters)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="pronunciation">Pronunciation Guide *</label>
            <input
              type="text"
              id="pronunciation"
              name="pronunciation"
              value={formData.pronunciation}
              onChange={handleInputChange}
              required
              placeholder="Enter pronunciation guide"
              maxLength={200}
            />
            <small className="form-help">
              Phonetic pronunciation guide (max 200 characters)
            </small>
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
              placeholder="Enter description or context"
              maxLength={1000}
            />
            <small className="form-help">
              Description, context, or usage notes (max 1000 characters)
            </small>
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
              {loading
                ? "Saving..."
                : vocabulary
                ? "Update Vocabulary"
                : "Create Vocabulary"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VocabularyForm;
