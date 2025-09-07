import React, { useState, useEffect } from "react";
import { apiClient } from "../../utils/apiClient";
import type { VocabularyFormData } from "../../types/admin";
import VocabularyForm from "./VocabularyForm";
import "./AdminTable.css";

interface Vocabulary {
  id: string;
  maori: string;
  english: string;
  pronunciation: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface VocabularyListProps {
  onEdit: (vocabulary: Vocabulary) => void;
  onDelete: (id: string) => void;
}

const VocabularyList: React.FC<VocabularyListProps> = ({
  onEdit,
  onDelete,
}) => {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVocabulary, setEditingVocabulary] = useState<Vocabulary | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadVocabularies();
  }, []);

  const loadVocabularies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getVocabularies();
      setVocabularies(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load vocabulary"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadVocabularies();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.searchVocabularies(searchQuery);
      setVocabularies(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to search vocabulary"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingVocabulary(null);
    setShowForm(true);
  };

  const handleEdit = (vocabulary: Vocabulary) => {
    setEditingVocabulary(vocabulary);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData: VocabularyFormData) => {
    try {
      if (editingVocabulary) {
        await apiClient.updateVocabulary(editingVocabulary.id, formData);
      } else {
        await apiClient.createVocabulary(formData);
      }
      setShowForm(false);
      setEditingVocabulary(null);
      await loadVocabularies();
    } catch (err) {
      console.error("Failed to save vocabulary:", err);
      throw err;
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingVocabulary(null);
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm("Are you sure you want to delete this vocabulary item?")
    ) {
      try {
        await apiClient.deleteVocabulary(id);
        await loadVocabularies();
        onDelete(id);
      } catch (err) {
        console.error("Failed to delete vocabulary:", err);
        setError(
          err instanceof Error ? err.message : "Failed to delete vocabulary"
        );
      }
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading vocabulary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <p>Error: {error}</p>
        <button onClick={loadVocabularies} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="admin-table-container">
      <div className="admin-table-header">
        <h2>Vocabulary ({vocabularies.length})</h2>
        <div className="admin-header-actions">
          <div className="search-box">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              placeholder="Search vocabulary..."
              className="search-input"
            />
            <button onClick={handleSearch} className="btn btn-secondary">
              🔍
            </button>
          </div>
          <button onClick={handleCreate} className="btn btn-primary">
            ➕ Add Vocabulary
          </button>
        </div>
      </div>

      {vocabularies.length === 0 ? (
        <div className="admin-empty-state">
          <p>
            No vocabulary found. Create your first vocabulary item to get
            started.
          </p>
          <button onClick={handleCreate} className="btn btn-primary">
            Add Vocabulary
          </button>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Māori</th>
                <th>English</th>
                <th>Pronunciation</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vocabularies.map((vocab) => (
                <tr key={vocab.id}>
                  <td>
                    <div className="vocabulary-maori">
                      <strong>{vocab.maori}</strong>
                    </div>
                  </td>
                  <td>
                    <div className="vocabulary-english">{vocab.english}</div>
                  </td>
                  <td>
                    <div className="vocabulary-pronunciation">
                      <em>{vocab.pronunciation}</em>
                    </div>
                  </td>
                  <td>
                    <div className="vocabulary-description">
                      {vocab.description?.substring(0, 100)}
                      {vocab.description &&
                        vocab.description.length > 100 &&
                        "..."}
                    </div>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button
                        onClick={() => handleEdit(vocab)}
                        className="btn btn-sm btn-secondary"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(vocab.id)}
                        className="btn btn-sm btn-danger"
                        title="Delete"
                      >
                        🗑️
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
        <VocabularyForm
          vocabulary={editingVocabulary}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};

export default VocabularyList;
