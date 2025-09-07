import React, { useState, useEffect } from "react";
import { apiClient } from "../../utils/apiClient";
import "./AdminDashboard.css";

interface AdminStats {
  totalVideos: number;
  totalVocabulary: number;
  recentVideos: number;
  recentVocabulary: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalVideos: 0,
    totalVocabulary: 0,
    recentVideos: 0,
    recentVocabulary: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [videos, vocabularies] = await Promise.all([
        apiClient.getVideos(),
        apiClient.getVocabularies(),
      ]);

      setStats({
        totalVideos: videos.length,
        totalVocabulary: vocabularies.length,
        recentVideos: videos.filter((v) => {
          const createdDate = new Date(v.created_at || v.updated_at || "");
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return createdDate > weekAgo;
        }).length,
        recentVocabulary: vocabularies.filter((v) => {
          const createdDate = new Date(v.created_at || v.updated_at || "");
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return createdDate > weekAgo;
        }).length,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load statistics"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="admin-error">
          <p>Error: {error}</p>
          <button onClick={loadStats} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage your video content and vocabulary</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">▶</div>
          <div className="stat-content">
            <h3>{stats.totalVideos}</h3>
            <p>Total Videos</p>
            <small>{stats.recentVideos} added this week</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">◊</div>
          <div className="stat-content">
            <h3>{stats.totalVocabulary}</h3>
            <p>Vocabulary Items</p>
            <small>{stats.recentVocabulary} added this week</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <h3>{stats.totalVideos + stats.totalVocabulary}</h3>
            <p>Total Content</p>
            <small>All items combined</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">◈</div>
          <div className="stat-content">
            <h3>{stats.recentVideos + stats.recentVocabulary}</h3>
            <p>Recent Activity</p>
            <small>Items added this week</small>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <div className="action-card">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <a href="/admin/videos" className="btn btn-primary">
              ▶ Manage Videos
            </a>
            <a href="/admin/vocabulary" className="btn btn-primary">
              ◊ Manage Vocabulary
            </a>
            <a href="/admin/vtt" className="btn btn-primary">
              📄 Manage VTT Files
            </a>
          </div>
        </div>

        <div className="action-card">
          <h3>System Status</h3>
          <div className="status-list">
            <div className="status-item">
              <span className="status-indicator success"></span>
              <span>Backend API</span>
            </div>
            <div className="status-item">
              <span className="status-indicator success"></span>
              <span>Database</span>
            </div>
            <div className="status-item">
              <span className="status-indicator success"></span>
              <span>Frontend</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
