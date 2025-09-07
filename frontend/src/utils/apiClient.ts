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

  // Health check
  async healthCheck(): Promise<{ status: string; service: string }> {
    return this.get(API_ENDPOINTS.HEALTH);
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();
