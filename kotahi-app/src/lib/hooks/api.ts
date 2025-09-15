import { useCallback } from "react";
import {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetVideosQuery,
  useGetVideoQuery,
  useCreateVideoMutation,
  useUpdateVideoMutation,
  useDeleteVideoMutation,
  useGetVocabulariesQuery,
  useGetVocabularyQuery,
  useCreateVocabularyMutation,
  useUpdateVocabularyMutation,
  useDeleteVocabularyMutation,
  useSearchVocabulariesQuery,
  useGetWatchHistoryQuery,
  useGetWatchHistoryByVideoQuery,
  useCreateOrUpdateWatchHistoryMutation,
  useDeleteWatchHistoryMutation,
  useGetRecentWatchedQuery,
  useGetCompletedVideosQuery,
  useUploadVTTFileMutation,
  useGetVTTFilesQuery,
  useDeleteVTTFileMutation,
  useGetLearningListQuery,
  useCreateLearningListItemMutation,
  useGetLearningListItemQuery,
  useUpdateLearningListItemMutation,
  useDeleteLearningListItemMutation,
  useGetLearningListStatsQuery,
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
} from "../api";
import type {
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
} from "../types";

// Authentication hooks
export const useAuth = () => {
  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();
  const [updateProfileMutation] = useUpdateProfileMutation();

  const login = useCallback(
    (credentials: LoginRequest) => {
      return loginMutation(credentials);
    },
    [loginMutation]
  );

  const register = useCallback(
    (userData: RegisterRequest) => {
      return registerMutation(userData);
    },
    [registerMutation]
  );

  const updateProfile = useCallback(
    (data: UpdateProfileRequest) => {
      return updateProfileMutation(data);
    },
    [updateProfileMutation]
  );

  return {
    login,
    register,
    updateProfile,
  };
};

export const useProfile = () => {
  return useGetProfileQuery();
};

// Video hooks
export const useVideos = () => {
  const { data: videos, isLoading, error, refetch } = useGetVideosQuery();
  const [createVideoMutation, { isLoading: isCreating }] =
    useCreateVideoMutation();
  const [updateVideoMutation, { isLoading: isUpdating }] =
    useUpdateVideoMutation();
  const [deleteVideoMutation, { isLoading: isDeleting }] =
    useDeleteVideoMutation();

  const createVideo = useCallback(
    async (data: CreateVideoRequest) => {
      try {
        const result = await createVideoMutation(data).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [createVideoMutation]
  );

  const updateVideo = useCallback(
    async (id: string, data: UpdateVideoRequest) => {
      try {
        const result = await updateVideoMutation({ id, data }).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [updateVideoMutation]
  );

  const deleteVideo = useCallback(
    async (id: string) => {
      try {
        await deleteVideoMutation(id).unwrap();
      } catch (error) {
        throw error;
      }
    },
    [deleteVideoMutation]
  );

  return {
    videos,
    isLoading,
    error,
    refetch,
    createVideo,
    updateVideo,
    deleteVideo,
    isCreating,
    isUpdating,
    isDeleting,
  };
};

export const useVideo = (id: string) => {
  return useGetVideoQuery(id);
};

// Vocabulary hooks
export const useVocabularies = () => {
  const {
    data: vocabularies,
    isLoading,
    error,
    refetch,
  } = useGetVocabulariesQuery();
  const [createVocabularyMutation, { isLoading: isCreating }] =
    useCreateVocabularyMutation();
  const [updateVocabularyMutation, { isLoading: isUpdating }] =
    useUpdateVocabularyMutation();
  const [deleteVocabularyMutation, { isLoading: isDeleting }] =
    useDeleteVocabularyMutation();

  const createVocabulary = useCallback(
    async (data: CreateVocabularyRequest) => {
      try {
        const result = await createVocabularyMutation(data).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [createVocabularyMutation]
  );

  const updateVocabulary = useCallback(
    async (id: string, data: UpdateVocabularyRequest) => {
      try {
        const result = await updateVocabularyMutation({ id, data }).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [updateVocabularyMutation]
  );

  const deleteVocabulary = useCallback(
    async (id: string) => {
      try {
        await deleteVocabularyMutation(id).unwrap();
      } catch (error) {
        throw error;
      }
    },
    [deleteVocabularyMutation]
  );

  return {
    vocabularies,
    isLoading,
    error,
    refetch,
    createVocabulary,
    updateVocabulary,
    deleteVocabulary,
    isCreating,
    isUpdating,
    isDeleting,
  };
};

export const useVocabulary = (id: string) => {
  return useGetVocabularyQuery(id);
};

// Playlist hooks
export const usePlaylists = () => {
  const { data: playlists, isLoading, error, refetch } = useGetPlaylistsQuery();
  const [createPlaylistMutation, { isLoading: isCreating }] =
    useCreatePlaylistMutation();
  const [updatePlaylistMutation, { isLoading: isUpdating }] =
    useUpdatePlaylistMutation();
  const [deletePlaylistMutation, { isLoading: isDeleting }] =
    useDeletePlaylistMutation();

  const createPlaylist = useCallback(
    async (data: CreatePlaylistRequest) => {
      try {
        const result = await createPlaylistMutation(data).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [createPlaylistMutation]
  );

  const updatePlaylist = useCallback(
    async (id: string, data: UpdatePlaylistRequest) => {
      try {
        const result = await updatePlaylistMutation({ id, data }).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [updatePlaylistMutation]
  );

  const deletePlaylist = useCallback(
    async (id: string) => {
      try {
        await deletePlaylistMutation(id).unwrap();
      } catch (error) {
        throw error;
      }
    },
    [deletePlaylistMutation]
  );

  return {
    playlists,
    isLoading,
    error,
    refetch,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    isCreating,
    isUpdating,
    isDeleting,
  };
};

export const useUserPlaylists = () => {
  return useGetUserPlaylistsQuery();
};

export const usePublicPlaylists = () => {
  return useGetPublicPlaylistsQuery();
};

export const usePlaylist = (id: string, options?: { skip?: boolean }) => {
  return useGetPlaylistQuery(id, {
    skip: options?.skip || !id,
  });
};

export const usePlaylistMutations = () => {
  const [addVideoMutation] = useAddVideoToPlaylistMutation();
  const [removeVideoMutation] = useRemoveVideoFromPlaylistMutation();
  const [reorderVideosMutation] = useReorderPlaylistVideosMutation();

  const addVideoToPlaylist = useCallback(
    async (playlistId: string, videoId: string) => {
      try {
        const result = await addVideoMutation({
          id: playlistId,
          video_id: videoId,
        }).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [addVideoMutation]
  );

  const removeVideoFromPlaylist = useCallback(
    async (playlistId: string, videoId: string) => {
      try {
        const result = await removeVideoMutation({
          id: playlistId,
          video_id: videoId,
        }).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [removeVideoMutation]
  );

  const reorderPlaylistVideos = useCallback(
    async (playlistId: string, videoIds: string[]) => {
      try {
        const result = await reorderVideosMutation({
          id: playlistId,
          video_ids: videoIds,
        }).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [reorderVideosMutation]
  );

  return {
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    reorderPlaylistVideos,
  };
};

export const useSearchVocabularies = (query: string) => {
  return useSearchVocabulariesQuery(query, {
    skip: !query || query.length < 2,
  });
};

// Watch history hooks
export const useWatchHistory = (token: string | null) => {
  return useGetWatchHistoryQuery(token || "", {
    skip: !token,
  });
};

export const useWatchHistoryByVideo = (
  token: string | null,
  videoId: string
) => {
  return useGetWatchHistoryByVideoQuery(
    { token: token || "", videoId },
    {
      skip: !token || !videoId,
    }
  );
};

export const useWatchHistoryMutations = () => {
  const [createOrUpdateMutation] = useCreateOrUpdateWatchHistoryMutation();
  const [deleteMutation] = useDeleteWatchHistoryMutation();

  const createOrUpdate = useCallback(
    (token: string, data: CreateWatchHistoryRequest) => {
      return createOrUpdateMutation({ token, data });
    },
    [createOrUpdateMutation]
  );

  const deleteWatchHistory = useCallback(
    (token: string, videoId: string) => {
      return deleteMutation({ token, videoId });
    },
    [deleteMutation]
  );

  return {
    createOrUpdate,
    deleteWatchHistory,
  };
};

export const useRecentWatched = (token: string | null, limit?: number) => {
  return useGetRecentWatchedQuery(
    { token: token || "", limit },
    {
      skip: !token,
    }
  );
};

export const useCompletedVideos = (token: string | null) => {
  return useGetCompletedVideosQuery(token || "", {
    skip: !token,
  });
};

// VTT file hooks
export const useVTTFiles = () => {
  return useGetVTTFilesQuery();
};

export const useVTTMutations = () => {
  const [uploadMutation] = useUploadVTTFileMutation();
  const [deleteMutation] = useDeleteVTTFileMutation();

  const uploadFile = useCallback(
    (file: File) => {
      return uploadMutation(file);
    },
    [uploadMutation]
  );

  const deleteFile = useCallback(
    (filename: string) => {
      return deleteMutation(filename);
    },
    [deleteMutation]
  );

  return {
    uploadFile,
    deleteFile,
  };
};

// Learning list hooks
export const useLearningList = (
  token: string | null,
  params?: LearningListParams
) => {
  return useGetLearningListQuery(
    { token: token || "", params },
    {
      skip: !token,
    }
  );
};

export const useLearningListItem = (token: string | null, id: string) => {
  return useGetLearningListItemQuery(
    { token: token || "", id },
    {
      skip: !token || !id,
    }
  );
};

export const useLearningListMutations = () => {
  const [createMutation] = useCreateLearningListItemMutation();
  const [updateMutation] = useUpdateLearningListItemMutation();
  const [deleteMutation] = useDeleteLearningListItemMutation();

  const createItem = useCallback(
    async (token: string, data: CreateLearningListItemRequest) => {
      const result = await createMutation({ token, data });
      if (result.error) {
        let errorMessage = "Failed to create learning list item";

        if ("data" in result.error && result.error.data) {
          errorMessage = (result.error.data as any)?.message || errorMessage;
        } else if ("message" in result.error) {
          errorMessage = result.error.message || errorMessage;
        }

        throw new Error(errorMessage);
      }
      return result.data;
    },
    [createMutation]
  );

  const updateItem = useCallback(
    async (token: string, id: string, data: UpdateLearningListItemRequest) => {
      const result = await updateMutation({ token, id, data });
      if (result.error) {
        let errorMessage = "Failed to update learning list item";

        if ("data" in result.error && result.error.data) {
          errorMessage = (result.error.data as any)?.message || errorMessage;
        } else if ("message" in result.error) {
          errorMessage = result.error.message || errorMessage;
        }

        throw new Error(errorMessage);
      }
      return result.data;
    },
    [updateMutation]
  );

  const deleteItem = useCallback(
    async (token: string, id: string) => {
      const result = await deleteMutation({ token, id });
      if (result.error) {
        let errorMessage = "Failed to delete learning list item";

        if ("data" in result.error && result.error.data) {
          errorMessage = (result.error.data as any)?.message || errorMessage;
        } else if ("message" in result.error) {
          errorMessage = result.error.message || errorMessage;
        }

        throw new Error(errorMessage);
      }
      return result.data;
    },
    [deleteMutation]
  );

  return {
    createItem,
    updateItem,
    deleteItem,
  };
};

export const useLearningListStats = (token: string | null) => {
  return useGetLearningListStatsQuery(token || "", {
    skip: !token,
  });
};
