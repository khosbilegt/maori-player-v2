import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiClient } from "../../utils/apiClient";
import "./AdminTable.css";
import "./VTTManager.css";

interface VTTFile {
  filename: string;
  size: number;
  modified_at: string;
  url: string;
}

const VTTManager: React.FC = () => {
  const { token } = useAuth();
  const [vttFiles, setVttFiles] = useState<VTTFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadVTTFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getVTTFiles(token!);
      setVttFiles(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load VTT files");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadVTTFiles();
    }
  }, [token, loadVTTFiles]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".vtt")) {
      setError("Please select a .vtt file");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      await apiClient.uploadVTTFile(token!, file);
      setSuccess(`File "${file.name}" uploaded successfully!`);

      // Reload the file list
      await loadVTTFiles();

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }

    try {
      setError(null);
      await apiClient.deleteVTTFile(token!, filename);
      setSuccess(`File "${filename}" deleted successfully!`);
      await loadVTTFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete file");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading VTT files...</p>
      </div>
    );
  }

  return (
    <div className="admin-vtt-manager">
      {/* Upload Section */}
      <div className="upload-section">
        <div className="upload-card">
          <h3>Upload VTT File</h3>
          <div className="upload-area">
            <input
              ref={fileInputRef}
              type="file"
              accept=".vtt"
              onChange={handleFileUpload}
              disabled={uploading}
              style={{ display: "none" }}
            />
            <button
              className="btn btn-primary upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <div className="loading-spinner small"></div>
                  Uploading...
                </>
              ) : (
                <>📁 Choose VTT File</>
              )}
            </button>
            <p className="upload-hint">
              Select a .vtt subtitle file (max 10MB)
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="admin-message error">
          <span>❌ {error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success && (
        <div className="admin-message success">
          <span>✅ {success}</span>
          <button onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      {/* Files List */}
      <div className="files-section">
        <div className="section-header">
          <h3>Uploaded VTT Files ({vttFiles.length})</h3>
          <button
            className="btn btn-secondary"
            onClick={loadVTTFiles}
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>

        {vttFiles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h4>No VTT files uploaded yet</h4>
            <p>
              Upload your first subtitle file using the upload section above.
            </p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>Size</th>
                  <th>Modified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vttFiles.map((file) => (
                  <tr key={file.filename}>
                    <td>
                      <div className="file-info">
                        <span className="file-icon">📄</span>
                        <span className="file-name">{file.filename}</span>
                      </div>
                    </td>
                    <td>{formatFileSize(file.size)}</td>
                    <td>{formatDate(file.modified_at)}</td>
                    <td>
                      <div className="action-buttons">
                        <a
                          href={`${
                            import.meta.env.VITE_API_BASE_URL ||
                            "http://localhost:8080"
                          }${file.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-secondary"
                        >
                          👁️ View
                        </a>
                        <button
                          onClick={() => handleDeleteFile(file.filename)}
                          className="btn btn-sm btn-danger"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VTTManager;
