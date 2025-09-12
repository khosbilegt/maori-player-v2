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
} from "../api";
import type {
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
    (token: string, data: UpdateProfileRequest) => {
      return updateProfileMutation({ token, data });
    },
    [updateProfileMutation]
  );

  return {
    login,
    register,
    updateProfile,
  };
};

export const useProfile = (token: string | null) => {
  return useGetProfileQuery(token || "", {
    skip: !token,
  });
};

// Video hooks
export const useVideos = () => {
  const { data: videos, isLoading, error, refetch } = useGetVideosQuery();
  const [createVideoMutation] = useCreateVideoMutation();
  const [updateVideoMutation] = useUpdateVideoMutation();
  const [deleteVideoMutation] = useDeleteVideoMutation();

  const createVideo = useCallback(
    (token: string, data: CreateVideoRequest) => {
      return createVideoMutation({ token, data });
    },
    [createVideoMutation]
  );

  const updateVideo = useCallback(
    (token: string, id: string, data: UpdateVideoRequest) => {
      return updateVideoMutation({ token, id, data });
    },
    [updateVideoMutation]
  );

  const deleteVideo = useCallback(
    (token: string, id: string) => {
      return deleteVideoMutation({ token, id });
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
  const [createVocabularyMutation] = useCreateVocabularyMutation();
  const [updateVocabularyMutation] = useUpdateVocabularyMutation();
  const [deleteVocabularyMutation] = useDeleteVocabularyMutation();

  const createVocabulary = useCallback(
    (token: string, data: CreateVocabularyRequest) => {
      return createVocabularyMutation({ token, data });
    },
    [createVocabularyMutation]
  );

  const updateVocabulary = useCallback(
    (token: string, id: string, data: UpdateVocabularyRequest) => {
      return updateVocabularyMutation({ token, id, data });
    },
    [updateVocabularyMutation]
  );

  const deleteVocabulary = useCallback(
    (token: string, id: string) => {
      return deleteVocabularyMutation({ token, id });
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
  };
};

export const useVocabulary = (id: string) => {
  return useGetVocabularyQuery(id);
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
export const useVTTFiles = (token: string | null) => {
  return useGetVTTFilesQuery(token || "", {
    skip: !token,
  });
};

export const useVTTMutations = () => {
  const [uploadMutation] = useUploadVTTFileMutation();
  const [deleteMutation] = useDeleteVTTFileMutation();

  const uploadFile = useCallback(
    (token: string, file: File) => {
      return uploadMutation({ token, file });
    },
    [uploadMutation]
  );

  const deleteFile = useCallback(
    (token: string, filename: string) => {
      return deleteMutation({ token, filename });
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
    (token: string, data: CreateLearningListItemRequest) => {
      return createMutation({ token, data });
    },
    [createMutation]
  );

  const updateItem = useCallback(
    (token: string, id: string, data: UpdateLearningListItemRequest) => {
      return updateMutation({ token, id, data });
    },
    [updateMutation]
  );

  const deleteItem = useCallback(
    (token: string, id: string) => {
      return deleteMutation({ token, id });
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
