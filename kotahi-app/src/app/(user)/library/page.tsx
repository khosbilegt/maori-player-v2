import React from "react";
import { VideoLibrary } from "@/components/VideoLibrary";

function LibraryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Video Library</h1>
        <p className="text-muted-foreground mt-2">
          Explore our collection of Māori language learning videos
        </p>
      </div>

      <VideoLibrary />
    </div>
  );
}

export default LibraryPage;
