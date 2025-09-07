import type { VideoData } from "../components/VideoCard";
import { apiClient } from "./apiClient";

interface LibraryData {
  videos: VideoData[];
}

// Load library data from backend API or fallback to JSON file
export async function loadLibraryData(): Promise<LibraryData> {
  try {
    console.log("Loading library data from backend API");
    const videos = await apiClient.getVideos();
    console.log("Successfully loaded videos from backend:", videos.length);
    return { videos };
  } catch (error) {
    console.error("Failed to load library data from backend:", error);
    throw error;
  }
}

let libraryDataPromise: Promise<LibraryData> | null = null;

export function getLibraryData(): Promise<LibraryData> {
  if (!libraryDataPromise) {
    libraryDataPromise = loadLibraryData().then((data) => {
      return data;
    });
  }

  return libraryDataPromise;
}
