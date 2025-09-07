// Environment configuration
export interface EnvironmentConfig {
  apiBaseUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

// Get environment variables with fallbacks
const getEnvVar = (key: string, fallback: string): string => {
  // In Vite, environment variables are available via import.meta.env
  return import.meta.env[key] || fallback;
};

// Environment configuration
export const environment: EnvironmentConfig = {
  apiBaseUrl: getEnvVar("VITE_API_BASE_URL", "http://localhost:8080"),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

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

  // Health check
  HEALTH: `${environment.apiBaseUrl}/health`,

  // Seed endpoint (development only)
  SEED: `${environment.apiBaseUrl}/seed`,
} as const;

// Log configuration in development
if (environment.isDevelopment) {
  console.log("Environment Configuration:", {
    apiBaseUrl: environment.apiBaseUrl,
    isDevelopment: environment.isDevelopment,
    isProduction: environment.isProduction,
  });
}
