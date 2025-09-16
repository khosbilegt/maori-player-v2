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
  Playlist,
  PlaylistWithVideos,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  CreateVideoRequest,
  UpdateVideoRequest,
  CreateVocabularyRequest,
  UpdateVocabularyRequest,
  CreatePlaylistRequest,
  UpdatePlaylistRequest,
  CreateWatchHistoryRequest,
  CreateLearningListItemRequest,
  UpdateLearningListItemRequest,
  LearningListParams,
} from "./types";

// Helper function to get auth headers
const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

// Custom base query that handles token expiry
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  const result = await fetchBaseQuery({
    baseUrl: environment.apiBaseUrl,
    prepareHeaders: (headers, { endpoint }) => {
      // Only set Content-Type for non-file upload endpoints
      if (endpoint !== "uploadVTTFile") {
        headers.set("Content-Type", "application/json");
      }

      // Add token to all requests except public endpoints
      const publicEndpoints = ["healthCheck", "login", "register"];
      if (!publicEndpoints.includes(endpoint)) {
        const token = localStorage.getItem("token");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }

      return headers;
    },
  })(args, api, extraOptions);

  // If we get a 401, the token is expired - log out the user
  if (result.error && result.error.status === 401) {
    localStorage.removeItem("token");
    // Redirect to login page
    window.location.href = "/auth/login";
  }

  return result;
};

// Create the API slice
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",
    "Video",
    "Vocabulary",
    "WatchHistory",
    "LearningList",
    "VTT",
    "Playlist",
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

    getProfile: builder.query<User, void>({
      query: () => "/api/v1/auth/profile",
      providesTags: ["User"],
    }),

    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (data) => ({
        url: "/api/v1/auth/profile",
        method: "PUT",
        body: data,
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

    createVideo: builder.mutation<VideoData, CreateVideoRequest>({
      query: (data) => ({
        url: "/api/v1/videos",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Video"],
    }),

    updateVideo: builder.mutation<
      VideoData,
      { id: string; data: UpdateVideoRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/videos/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Video"],
    }),

    deleteVideo: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/videos/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Video"],
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

    createVocabulary: builder.mutation<Vocabulary, CreateVocabularyRequest>({
      query: (data) => ({
        url: "/api/v1/vocabulary",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Vocabulary"],
    }),

    updateVocabulary: builder.mutation<
      Vocabulary,
      { id: string; data: UpdateVocabularyRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/vocabulary/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Vocabulary"],
    }),

    deleteVocabulary: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/vocabulary/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Vocabulary"],
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
    uploadVTTFile: builder.mutation<{ data: VTTFile }, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("vtt_file", file);
        return {
          url: "/api/v1/vtt/upload",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["VTT"],
    }),

    getVTTFiles: builder.query<{ data: VTTFile[] }, void>({
      query: () => "/api/v1/vtt/list",
      providesTags: ["VTT"],
    }),

    deleteVTTFile: builder.mutation<void, string>({
      query: (filename) => ({
        url: `/api/v1/vtt/delete?filename=${encodeURIComponent(filename)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["VTT"],
    }),

    // Playlist endpoints
    getPlaylists: builder.query<Playlist[], void>({
      query: () => "/api/v1/playlists",
      providesTags: ["Playlist"],
    }),

    getUserPlaylists: builder.query<Playlist[], void>({
      query: () => "/api/v1/playlists/user",
      providesTags: ["Playlist"],
    }),

    getPublicPlaylists: builder.query<Playlist[], void>({
      query: () => "/api/v1/playlists/public",
      providesTags: ["Playlist"],
    }),

    getPlaylist: builder.query<PlaylistWithVideos, string>({
      query: (id) => `/api/v1/playlists/${id}?populate=true`,
      providesTags: (result, error, id) => [{ type: "Playlist", id }],
    }),

    createPlaylist: builder.mutation<Playlist, CreatePlaylistRequest>({
      query: (data) => ({
        url: "/api/v1/playlists",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Playlist"],
    }),

    updatePlaylist: builder.mutation<
      Playlist,
      { id: string; data: UpdatePlaylistRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/playlists/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Playlist"],
    }),

    deletePlaylist: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/playlists/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Playlist"],
    }),

    addVideoToPlaylist: builder.mutation<
      Playlist,
      { id: string; video_id: string }
    >({
      query: ({ id, video_id }) => ({
        url: `/api/v1/playlists/${id}/videos`,
        method: "POST",
        body: { video_id },
      }),
      invalidatesTags: ["Playlist"],
    }),

    removeVideoFromPlaylist: builder.mutation<
      Playlist,
      { id: string; video_id: string }
    >({
      query: ({ id, video_id }) => ({
        url: `/api/v1/playlists/${id}/videos`,
        method: "DELETE",
        body: { video_id },
      }),
      invalidatesTags: ["Playlist"],
    }),

    reorderPlaylistVideos: builder.mutation<
      Playlist,
      { id: string; video_ids: string[] }
    >({
      query: ({ id, video_ids }) => ({
        url: `/api/v1/playlists/${id}/reorder`,
        method: "PUT",
        body: { video_ids },
      }),
      invalidatesTags: ["Playlist"],
    }),

    // Learning list endpoints
    getLearningList: builder.query<
      { data: LearningListItem[] },
      LearningListParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append("status", params.status);
        if (params?.video_id) queryParams.append("video_id", params.video_id);

        return {
          url: `/api/v1/learning-list${
            queryParams.toString() ? `?${queryParams.toString()}` : ""
          }`,
        };
      },
      providesTags: ["LearningList"],
    }),

    createLearningListItem: builder.mutation<
      { data: LearningListItem },
      CreateLearningListItemRequest
    >({
      query: (data) => ({
        url: "/api/v1/learning-list",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["LearningList"],
    }),

    getLearningListItem: builder.query<{ data: LearningListItem }, string>({
      query: (id) => ({
        url: `/api/v1/learning-list/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: "LearningList", id }],
    }),

    updateLearningListItem: builder.mutation<
      { data: LearningListItem },
      { id: string; data: UpdateLearningListItemRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/learning-list/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["LearningList"],
    }),

    deleteLearningListItem: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/api/v1/learning-list/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LearningList"],
    }),

    getLearningListStats: builder.query<{ data: LearningListStats }, void>({
      query: () => ({
        url: "/api/v1/learning-list/stats",
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

  // Playlists
  useGetPlaylistsQuery,
  useGetUserPlaylistsQuery,
  useGetPublicPlaylistsQuery,
  useGetPlaylistQuery,
  useCreatePlaylistMutation,
  useUpdatePlaylistMutation,
  useDeletePlaylistMutation,
  useAddVideoToPlaylistMutation,
  useRemoveVideoFromPlaylistMutation,
  useReorderPlaylistVideosMutation,
} = apiSlice;
