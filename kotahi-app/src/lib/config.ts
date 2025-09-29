// Environment configuration for Next.js
export interface EnvironmentConfig {
  apiBaseUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

// Get environment variables with fallbacks for Next.js
const getEnvVar = (key: string, fallback: string): string => {
  // In Next.js, environment variables are available via process.env
  return process.env[key] || fallback;
};

// Environment configuration
export const environment: EnvironmentConfig = {
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    "https://tokotoko.app",
  // "https://kotahi.app",
  // "http://localhost:8080",
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
};

// Debug logging

// API endpoints
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: `${environment.apiBaseUrl}/api/v1/auth/login`,
    REGISTER: `${environment.apiBaseUrl}/api/v1/auth/register`,
    PROFILE: `${environment.apiBaseUrl}/api/v1/auth/profile`,
  },

  // Video endpoints
  VIDEOS: {
    BASE: `${environment.apiBaseUrl}/api/v1/videos`,
    BY_ID: (id: string) => `${environment.apiBaseUrl}/api/v1/videos/${id}`,
  },

  // Watch history endpoints
  WATCH_HISTORY: {
    BASE: `${environment.apiBaseUrl}/api/v1/watch-history`,
    BY_VIDEO: `${environment.apiBaseUrl}/api/v1/watch-history/video`,
    RECENT: `${environment.apiBaseUrl}/api/v1/watch-history/recent`,
    COMPLETED: `${environment.apiBaseUrl}/api/v1/watch-history`,
  },

  // Vocabulary endpoints
  VOCABULARY: {
    BASE: `${environment.apiBaseUrl}/api/v1/vocabulary`,
    BY_ID: (id: string) => `${environment.apiBaseUrl}/api/v1/vocabulary/${id}`,
    SEARCH: `${environment.apiBaseUrl}/api/v1/vocabulary/search`,
  },

  // VTT file endpoints
  VTT: {
    UPLOAD: `${environment.apiBaseUrl}/api/v1/vtt/upload`,
    LIST: `${environment.apiBaseUrl}/api/v1/vtt/list`,
    DELETE: `${environment.apiBaseUrl}/api/v1/vtt/delete`,
  },

  // Learning list endpoints
  LEARNING_LIST: {
    BASE: `${environment.apiBaseUrl}/api/v1/learning-list`,
    BY_ID: (id: string) =>
      `${environment.apiBaseUrl}/api/v1/learning-list/${id}`,
    STATS: `${environment.apiBaseUrl}/api/v1/learning-list/stats`,
    EXPORT: `${environment.apiBaseUrl}/api/v1/learning-list/export`,
  },

  // Search endpoints
  SEARCH: {
    GENERAL: `${environment.apiBaseUrl}/api/v1/search`,
  },

  // Health check
  HEALTH: `${environment.apiBaseUrl}/health`,

  // Seed endpoint (development only)
  SEED: `${environment.apiBaseUrl}/seed`,
} as const;
