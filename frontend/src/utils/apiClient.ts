import { API_ENDPOINTS, environment } from "../config/environment";
import type { AuthResponse, User } from "../contexts/AuthContext";
import type { VideoData } from "../components/VideoCard";

// API Client utility for making HTTP requests
export class ApiClient {
  constructor() {
    // baseUrl is available via environment.apiBaseUrl
  }

  // Generic fetch method with error handling
  private async fetchWithErrorHandling(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred");
    }
  }

  // GET request
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    const response = await this.fetchWithErrorHandling(endpoint, {
      method: "GET",
      headers,
    });
    return response.json();
  }

  // POST request
  async post<T>(
    endpoint: string,
    data?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<T> {
    const response = await this.fetchWithErrorHandling(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
    return response.json();
  }

  // PUT request
  async put<T>(
    endpoint: string,
    data?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<T> {
    const response = await this.fetchWithErrorHandling(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
    return response.json();
  }

  // DELETE request
  async delete<T>(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<T> {
    const response = await this.fetchWithErrorHandling(endpoint, {
      method: "DELETE",
      headers,
    });
    return response.json();
  }

  // Authentication methods
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
  }

  async register(
    email: string,
    username: string,
    password: string
  ): Promise<AuthResponse> {
    return this.post(API_ENDPOINTS.AUTH.REGISTER, {
      email,
      username,
      password,
    });
  }

  async getProfile(token: string): Promise<User> {
    return this.get(API_ENDPOINTS.AUTH.PROFILE, {
      Authorization: `Bearer ${token}`,
    });
  }

  async updateProfile(
    token: string,
    email: string,
    username: string,
    password?: string
  ): Promise<User> {
    const data: Record<string, string> = { email, username };
    if (password) {
      data.password = password;
    }
    return this.put(API_ENDPOINTS.AUTH.PROFILE, data, {
      Authorization: `Bearer ${token}`,
    });
  }

  // Video methods
  async getVideos(): Promise<VideoData[]> {
    return this.get(API_ENDPOINTS.VIDEOS.BASE);
  }

  async getVideo(id: string): Promise<VideoData> {
    return this.get(API_ENDPOINTS.VIDEOS.BY_ID(id));
  }

  // Admin Video methods
  async createVideo(videoData: any): Promise<VideoData> {
    return this.post(API_ENDPOINTS.VIDEOS.BASE, videoData);
  }

  async updateVideo(id: string, videoData: any): Promise<VideoData> {
    return this.put(API_ENDPOINTS.VIDEOS.BY_ID(id), videoData);
  }

  async deleteVideo(id: string): Promise<void> {
    return this.delete(API_ENDPOINTS.VIDEOS.BY_ID(id));
  }

  // Vocabulary methods
  async getVocabularies(): Promise<any[]> {
    return this.get(`${environment.apiBaseUrl}/api/v1/vocabulary`);
  }

  async getVocabulary(id: string): Promise<any> {
    return this.get(`${environment.apiBaseUrl}/api/v1/vocabulary/${id}`);
  }

  async createVocabulary(vocabData: any): Promise<any> {
    return this.post(`${environment.apiBaseUrl}/api/v1/vocabulary`, vocabData);
  }

  async updateVocabulary(id: string, vocabData: any): Promise<any> {
    return this.put(
      `${environment.apiBaseUrl}/api/v1/vocabulary/${id}`,
      vocabData
    );
  }

  async deleteVocabulary(id: string): Promise<void> {
    return this.delete(`${environment.apiBaseUrl}/api/v1/vocabulary/${id}`);
  }

  async searchVocabularies(query: string): Promise<any[]> {
    return this.get(
      `${
        environment.apiBaseUrl
      }/api/v1/vocabulary/search?q=${encodeURIComponent(query)}`
    );
  }

  // Watch history methods
  async getWatchHistory(token: string): Promise<{ data: any[] }> {
    return this.get(API_ENDPOINTS.WATCH_HISTORY.BASE, {
      Authorization: `Bearer ${token}`,
    });
  }

  async getWatchHistoryByVideo(
    token: string,
    videoId: string
  ): Promise<{ data: any }> {
    return this.get(
      `${API_ENDPOINTS.WATCH_HISTORY.BY_VIDEO}?video_id=${encodeURIComponent(
        videoId
      )}`,
      {
        Authorization: `Bearer ${token}`,
      }
    );
  }

  async createOrUpdateWatchHistory(
    token: string,
    watchHistoryData: {
      video_id: string;
      progress: number;
      current_time: number;
      duration: number;
      completed: boolean;
    }
  ): Promise<{ data: any }> {
    return this.post(API_ENDPOINTS.WATCH_HISTORY.BASE, watchHistoryData, {
      Authorization: `Bearer ${token}`,
    });
  }

  async deleteWatchHistory(token: string, videoId: string): Promise<void> {
    return this.delete(
      `${API_ENDPOINTS.WATCH_HISTORY.BASE}?video_id=${encodeURIComponent(
        videoId
      )}`,
      {
        Authorization: `Bearer ${token}`,
      }
    );
  }

  async getRecentWatched(
    token: string,
    limit?: number
  ): Promise<{ data: any[] }> {
    const url = limit
      ? `${API_ENDPOINTS.WATCH_HISTORY.RECENT}?limit=${limit}`
      : API_ENDPOINTS.WATCH_HISTORY.RECENT;
    return this.get(url, {
      Authorization: `Bearer ${token}`,
    });
  }

  async getCompletedVideos(token: string): Promise<{ data: any[] }> {
    return this.get(API_ENDPOINTS.WATCH_HISTORY.COMPLETED, {
      Authorization: `Bearer ${token}`,
    });
  }

  // VTT file management
  async uploadVTTFile(token: string, file: File): Promise<{ data: any }> {
    const formData = new FormData();
    formData.append("vtt_file", file);

    const response = await fetch(
      `${environment.apiBaseUrl}/api/v1/vtt/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to upload VTT file");
    }

    return response.json();
  }

  async getVTTFiles(token: string): Promise<{ data: any[] }> {
    return this.get(`${environment.apiBaseUrl}/api/v1/vtt/list`, {
      Authorization: `Bearer ${token}`,
    });
  }

  async deleteVTTFile(token: string, filename: string): Promise<void> {
    const response = await fetch(
      `${
        environment.apiBaseUrl
      }/api/v1/vtt/delete?filename=${encodeURIComponent(filename)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete VTT file");
    }
  }

  // Learning List Methods
  async getLearningList(
    token: string,
    params?: { status?: string; video_id?: string }
  ): Promise<{ data: any[] }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.video_id) queryParams.append("video_id", params.video_id);

    const url = `${environment.apiBaseUrl}/api/v1/learning-list${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return this.get(url, {
      Authorization: `Bearer ${token}`,
    });
  }

  async createLearningListItem(
    token: string,
    data: { text: string; video_id?: string; notes?: string }
  ): Promise<{ data: any }> {
    console.log(token);
    return this.post(`${environment.apiBaseUrl}/api/v1/learning-list`, data, {
      Authorization: `Bearer ${token}`,
    });
  }

  async getLearningListItem(token: string, id: string): Promise<{ data: any }> {
    return this.get(`${environment.apiBaseUrl}/api/v1/learning-list/${id}`, {
      Authorization: `Bearer ${token}`,
    });
  }

  async updateLearningListItem(
    token: string,
    id: string,
    data: { text?: string; status?: string; notes?: string }
  ): Promise<{ data: any }> {
    return this.put(
      `${environment.apiBaseUrl}/api/v1/learning-list/${id}`,
      data,
      {
        Authorization: `Bearer ${token}`,
      }
    );
  }

  async deleteLearningListItem(
    token: string,
    id: string
  ): Promise<{ message: string }> {
    return this.delete(`${environment.apiBaseUrl}/api/v1/learning-list/${id}`, {
      Authorization: `Bearer ${token}`,
    });
  }

  async getLearningListStats(token: string): Promise<{
    data: {
      total: number;
      new: number;
      learning: number;
      learned: number;
      this_week: number;
    };
  }> {
    return this.get(`${environment.apiBaseUrl}/api/v1/learning-list/stats`, {
      Authorization: `Bearer ${token}`,
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; service: string }> {
    return this.get(API_ENDPOINTS.HEALTH);
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();
