import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { environment } from "./config";
import type {
  AuthResponse,
  User,
  VideoData,
  Vocabulary,
  WatchHistory,
  LearningListItem,
  LearningListStats,
  VTTFile,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  CreateVideoRequest,
  UpdateVideoRequest,
  CreateVocabularyRequest,
  UpdateVocabularyRequest,
  CreateWatchHistoryRequest,
  CreateLearningListItemRequest,
  UpdateLearningListItemRequest,
  LearningListParams,
} from "./types";

// Helper function to get auth headers
const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

// Create the API slice
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: environment.apiBaseUrl,
    prepareHeaders: (headers, { endpoint }) => {
      // Only set Content-Type for non-file upload endpoints
      if (endpoint !== "uploadVTTFile") {
        headers.set("Content-Type", "application/json");
      }
      return headers;
    },
  }),
  tagTypes: [
    "User",
    "Video",
    "Vocabulary",
    "WatchHistory",
    "LearningList",
    "VTT",
  ],
  endpoints: (builder) => ({
    // Health check
    healthCheck: builder.query<{ status: string; service: string }, void>({
      query: () => "/health",
    }),

    // Authentication endpoints
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/api/v1/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),

    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: "/api/v1/auth/register",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),

    getProfile: builder.query<User, string>({
      query: (token) => ({
        url: "/api/v1/auth/profile",
        headers: getAuthHeaders(token),
      }),
      providesTags: ["User"],
    }),

    updateProfile: builder.mutation<
      User,
      { token: string; data: UpdateProfileRequest }
    >({
      query: ({ token, data }) => ({
        url: "/api/v1/auth/profile",
        method: "PUT",
        body: data,
        headers: getAuthHeaders(token),
      }),
      invalidatesTags: ["User"],
    }),

    // Video endpoints
    getVideos: builder.query<VideoData[], void>({
      query: () => "/api/v1/videos",
      providesTags: ["Video"],
    }),

    getVideo: builder.query<VideoData, string>({
      query: (id) => `/api/v1/videos/${id}`,
      providesTags: (result, error, id) => [{ type: "Video", id }],
    }),

    createVideo: builder.mutation<
      VideoData,
      { token: string; data: CreateVideoRequest }
    >({
      query: ({ token, data }) => ({
        url: "/api/v1/videos",
        method: "POST",
        body: data,
        headers: getAuthHeaders(token),
      }),
      invalidatesTags: ["Video"],
    }),

    updateVideo: builder.mutation<
      VideoData,
      { token: string; id: string; data: UpdateVideoRequest }
    >({
      query: ({ token, id, data }) => ({
        url: `/api/v1/videos/${id}`,
        method: "PUT",
        body: data,
        headers: getAuthHeaders(token),
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Video", id }],
    }),

    deleteVideo: builder.mutation<void, { token: string; id: string }>({
      query: ({ token, id }) => ({
        url: `/api/v1/videos/${id}`,
        method: "DELETE",
        headers: getAuthHeaders(token),
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Video", id }],
    }),

    // Vocabulary endpoints
    getVocabularies: builder.query<Vocabulary[], void>({
      query: () => "/api/v1/vocabulary",
      providesTags: ["Vocabulary"],
    }),

    getVocabulary: builder.query<Vocabulary, string>({
      query: (id) => `/api/v1/vocabulary/${id}`,
      providesTags: (result, error, id) => [{ type: "Vocabulary", id }],
    }),

    createVocabulary: builder.mutation<
      Vocabulary,
      { token: string; data: CreateVocabularyRequest }
    >({
      query: ({ token, data }) => ({
        url: "/api/v1/vocabulary",
        method: "POST",
        body: data,
        headers: getAuthHeaders(token),
      }),
      invalidatesTags: ["Vocabulary"],
    }),

    updateVocabulary: builder.mutation<
      Vocabulary,
      { token: string; id: string; data: UpdateVocabularyRequest }
    >({
      query: ({ token, id, data }) => ({
        url: `/api/v1/vocabulary/${id}`,
        method: "PUT",
        body: data,
        headers: getAuthHeaders(token),
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Vocabulary", id }],
    }),

    deleteVocabulary: builder.mutation<void, { token: string; id: string }>({
      query: ({ token, id }) => ({
        url: `/api/v1/vocabulary/${id}`,
        method: "DELETE",
        headers: getAuthHeaders(token),
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Vocabulary", id }],
    }),

    searchVocabularies: builder.query<Vocabulary[], string>({
      query: (query) =>
        `/api/v1/vocabulary/search?q=${encodeURIComponent(query)}`,
      providesTags: ["Vocabulary"],
    }),

    // Watch history endpoints
    getWatchHistory: builder.query<{ data: WatchHistory[] }, string>({
      query: (token) => ({
        url: "/api/v1/watch-history",
        headers: getAuthHeaders(token),
      }),
      providesTags: ["WatchHistory"],
    }),

    getWatchHistoryByVideo: builder.query<
      { data: WatchHistory },
      { token: string; videoId: string }
    >({
      query: ({ token, videoId }) => ({
        url: `/api/v1/watch-history/video?video_id=${encodeURIComponent(
          videoId
        )}`,
        headers: getAuthHeaders(token),
      }),
      providesTags: ["WatchHistory"],
    }),

    createOrUpdateWatchHistory: builder.mutation<
      { data: WatchHistory },
      { token: string; data: CreateWatchHistoryRequest }
    >({
      query: ({ token, data }) => ({
        url: "/api/v1/watch-history",
        method: "POST",
        body: data,
        headers: getAuthHeaders(token),
      }),
      invalidatesTags: ["WatchHistory"],
    }),

    deleteWatchHistory: builder.mutation<
      void,
      { token: string; videoId: string }
    >({
      query: ({ token, videoId }) => ({
        url: `/api/v1/watch-history?video_id=${encodeURIComponent(videoId)}`,
        method: "DELETE",
        headers: getAuthHeaders(token),
      }),
      invalidatesTags: ["WatchHistory"],
    }),

    getRecentWatched: builder.query<
      { data: WatchHistory[] },
      { token: string; limit?: number }
    >({
      query: ({ token, limit }) => ({
        url: `/api/v1/watch-history/recent${limit ? `?limit=${limit}` : ""}`,
        headers: getAuthHeaders(token),
      }),
      providesTags: ["WatchHistory"],
    }),

    getCompletedVideos: builder.query<{ data: WatchHistory[] }, string>({
      query: (token) => ({
        url: "/api/v1/watch-history",
        headers: getAuthHeaders(token),
      }),
      providesTags: ["WatchHistory"],
    }),

    // VTT file endpoints
    uploadVTTFile: builder.mutation<
      { data: VTTFile },
      { token: string; file: File }
    >({
      query: ({ token, file }) => {
        const formData = new FormData();
        formData.append("vtt_file", file);
        return {
          url: "/api/v1/vtt/upload",
          method: "POST",
          body: formData,
          headers: getAuthHeaders(token),
        };
      },
      invalidatesTags: ["VTT"],
    }),

    getVTTFiles: builder.query<{ data: VTTFile[] }, string>({
      query: (token) => ({
        url: "/api/v1/vtt/list",
        headers: getAuthHeaders(token),
      }),
      providesTags: ["VTT"],
    }),

    deleteVTTFile: builder.mutation<void, { token: string; filename: string }>({
      query: ({ token, filename }) => ({
        url: `/api/v1/vtt/delete?filename=${encodeURIComponent(filename)}`,
        method: "DELETE",
        headers: getAuthHeaders(token),
      }),
      invalidatesTags: ["VTT"],
    }),

    // Learning list endpoints
    getLearningList: builder.query<
      { data: LearningListItem[] },
      { token: string; params?: LearningListParams }
    >({
      query: ({ token, params }) => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append("status", params.status);
        if (params?.video_id) queryParams.append("video_id", params.video_id);

        return {
          url: `/api/v1/learning-list${
            queryParams.toString() ? `?${queryParams.toString()}` : ""
          }`,
          headers: getAuthHeaders(token),
        };
      },
      providesTags: ["LearningList"],
    }),

    createLearningListItem: builder.mutation<
      { data: LearningListItem },
      { token: string; data: CreateLearningListItemRequest }
    >({
      query: ({ token, data }) => ({
        url: "/api/v1/learning-list",
        method: "POST",
        body: data,
        headers: getAuthHeaders(token),
      }),
      invalidatesTags: ["LearningList"],
    }),

    getLearningListItem: builder.query<
      { data: LearningListItem },
      { token: string; id: string }
    >({
      query: ({ token, id }) => ({
        url: `/api/v1/learning-list/${id}`,
        headers: getAuthHeaders(token),
      }),
      providesTags: (result, error, { id }) => [{ type: "LearningList", id }],
    }),

    updateLearningListItem: builder.mutation<
      { data: LearningListItem },
      { token: string; id: string; data: UpdateLearningListItemRequest }
    >({
      query: ({ token, id, data }) => ({
        url: `/api/v1/learning-list/${id}`,
        method: "PUT",
        body: data,
        headers: getAuthHeaders(token),
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "LearningList", id },
      ],
    }),

    deleteLearningListItem: builder.mutation<
      { message: string },
      { token: string; id: string }
    >({
      query: ({ token, id }) => ({
        url: `/api/v1/learning-list/${id}`,
        method: "DELETE",
        headers: getAuthHeaders(token),
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "LearningList", id },
      ],
    }),

    getLearningListStats: builder.query<{ data: LearningListStats }, string>({
      query: (token) => ({
        url: "/api/v1/learning-list/stats",
        headers: getAuthHeaders(token),
      }),
      providesTags: ["LearningList"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  // Health check
  useHealthCheckQuery,

  // Authentication
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,

  // Videos
  useGetVideosQuery,
  useGetVideoQuery,
  useCreateVideoMutation,
  useUpdateVideoMutation,
  useDeleteVideoMutation,

  // Vocabulary
  useGetVocabulariesQuery,
  useGetVocabularyQuery,
  useCreateVocabularyMutation,
  useUpdateVocabularyMutation,
  useDeleteVocabularyMutation,
  useSearchVocabulariesQuery,

  // Watch history
  useGetWatchHistoryQuery,
  useGetWatchHistoryByVideoQuery,
  useCreateOrUpdateWatchHistoryMutation,
  useDeleteWatchHistoryMutation,
  useGetRecentWatchedQuery,
  useGetCompletedVideosQuery,

  // VTT files
  useUploadVTTFileMutation,
  useGetVTTFilesQuery,
  useDeleteVTTFileMutation,

  // Learning list
  useGetLearningListQuery,
  useCreateLearningListItemMutation,
  useGetLearningListItemQuery,
  useUpdateLearningListItemMutation,
  useDeleteLearningListItemMutation,
  useGetLearningListStatsQuery,
} = apiSlice;
