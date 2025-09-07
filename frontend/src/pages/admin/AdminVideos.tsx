import React from "react";
import VideoList from "../../components/admin/VideoList";
import type { VideoData } from "../../components/VideoCard";
import "./AdminPage.css";

const AdminVideos: React.FC = () => {
  const handleEdit = (video: VideoData) => {
    console.log("Edit video:", video);
  };

  const handleDelete = (id: string) => {
    console.log("Delete video:", id);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Video Management</h1>
        <p>Create, edit, and manage your video content</p>
      </div>

      <VideoList onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
};

export default AdminVideos;
