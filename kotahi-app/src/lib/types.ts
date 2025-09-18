// Base API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// User types
export interface User {
  id: string;
  email: string;
  username: string;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Video types
export interface VideoData {
  id: string;
  title: string;
  description?: string;
  video: string;
  subtitle?: string;
  thumbnail?: string;
  duration?: string;
  created_at: string;
  updated_at: string;
}

// Vocabulary types
export interface Vocabulary {
  id: string;
  maori: string;
  english: string;
  description: string;
}

// Watch history types
export interface WatchHistory {
  id: string;
  user_id: string;
  video_id: string;
  progress: number; // percentage (0-100)
  current_time: number; // seconds
  duration: number; // seconds
  completed: boolean;
  created_at: string;
  updated_at: string;
}

// Learning list types
export interface LearningListItem {
  id: string;
  user_id: string;
  text: string;
  status: "new" | "learning" | "learned";
  notes?: string;
  video_id?: string;
  created_at: string;
  updated_at: string;
}

export interface LearningListStats {
  total: number;
  new: number;
  learning: number;
  learned: number;
  this_week: number;
}

// VTT file types
export interface VTTFile {
  id: string;
  filename: string;
  size: number;
  url: string;
}

// Playlist types
export interface Playlist {
  id: string;
  name: string;
  description: string;
  user_id: string;
  video_ids: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlaylistWithVideos {
  id: string;
  name: string;
  description: string;
  user_id: string;
  videos: VideoData[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// Request types for API calls
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface UpdateProfileRequest {
  email: string;
  username: string;
  password?: string;
}

export interface CreateVideoRequest {
  title: string;
  description?: string;
  video: string;
  subtitle?: string;
  thumbnail?: string;
  duration?: string;
}

export type UpdateVideoRequest = Partial<CreateVideoRequest>;

export interface CreateVocabularyRequest {
  maori: string;
  english: string;
  description?: string;
}

export type UpdateVocabularyRequest = Partial<CreateVocabularyRequest>;

// Batch upload types
export interface BatchVocabularyUploadResponse {
  message: string;
  created: number;
  updated: number;
  total: number;
  created_items?: Vocabulary[];
  updated_items?: Vocabulary[];
}

export interface BatchVocabularyUploadRequest {
  file: File;
  duplicates?: "update" | "skip" | "error";
}

export interface CreatePlaylistRequest {
  name: string;
  description?: string;
  video_ids: string[];
  is_public?: boolean;
}

export type UpdatePlaylistRequest = Partial<CreatePlaylistRequest>;

export interface CreateWatchHistoryRequest {
  video_id: string;
  progress: number;
  current_time: number;
  duration: number;
  completed: boolean;
}

export interface CreateLearningListItemRequest {
  text: string;
  video_id?: string;
  notes?: string;
}

export interface UpdateLearningListItemRequest {
  text?: string;
  status?: string;
  notes?: string;
}

// Query parameter types
export interface WatchHistoryParams {
  video_id?: string;
}

export interface LearningListParams {
  status?: string;
  video_id?: string;
}

export interface VocabularySearchParams {
  q: string;
}

export interface RecentWatchedParams {
  limit?: number;
}

export interface DeleteVTTParams {
  filename: string;
}

// Transcript types
export interface TranscriptItem {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}
