import { API_ENDPOINTS, environment } from "../config/environment";
import type { AuthResponse, User } from "../contexts/AuthContext";
import type { VideoData } from "../components/VideoCard";

// API Client utility for making HTTP requests
export class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = environment.apiBaseUrl;
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
    data?: Record<string, string>,
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
    data?: Record<string, string>,
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

  // Health check
  async healthCheck(): Promise<{ status: string; service: string }> {
    return this.get(API_ENDPOINTS.HEALTH);
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();
