import React, { useState, useEffect } from "react";
import VideoLibrary from "../components/VideoLibrary";
import { getLibraryData } from "../utils/libraryLoader";
import type { VideoData } from "../components/VideoCard";
import "./LibraryPage.css";

const LibraryPage: React.FC = () => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getLibraryData()
      .then((data) => {
        setVideos(data.videos);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load library data:", error);
        setVideos([]);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="library-page">
        <div className="library-loading">
          <div className="loading-spinner"></div>
          <p>Loading video library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="library-page">
      <VideoLibrary videos={videos} />
    </div>
  );
};

export default LibraryPage;
