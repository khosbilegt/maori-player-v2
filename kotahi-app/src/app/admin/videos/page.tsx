"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useGetVideosQuery,
  useCreateVideoMutation,
  useUpdateVideoMutation,
  useDeleteVideoMutation,
} from "@/lib/api";
import { toast } from "sonner";
import VideoForm from "@/components/admin/VideoForm";
import type {
  VideoData,
  CreateVideoRequest,
  UpdateVideoRequest,
} from "@/lib/types";

export default function VideoManagement() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem("token");
  const { data: videos, isLoading } = useGetVideosQuery();
  const [createVideo] = useCreateVideoMutation();
  const [updateVideo] = useUpdateVideoMutation();
  const [deleteVideo] = useDeleteVideoMutation();

  const handleFormSubmit = async (formData: any) => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingVideo) {
        const updateData: UpdateVideoRequest = {
          title: formData.title,
          description: formData.description || undefined,
          video: formData.video,
          thumbnail: formData.thumbnail || undefined,
          duration: formData.duration || undefined,
          subtitle: formData.subtitle || undefined,
        };
        await updateVideo({ token, id: editingVideo.id, data: updateData });
        toast.success("Video updated successfully!");
      } else {
        const createData: CreateVideoRequest = {
          title: formData.title,
          description: formData.description || undefined,
          video: formData.video,
          thumbnail: formData.thumbnail || undefined,
          duration: formData.duration || undefined,
          subtitle: formData.subtitle || undefined,
        };
        await createVideo({ token, data: createData });
        toast.success("Video created successfully!");
      }

      resetForm();
    } catch (error: any) {
      toast.error(error?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (video: VideoData) => {
    setEditingVideo(video);
    setIsCreating(true);
  };

  const handleDelete = async (videoId: string) => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    if (!confirm("Are you sure you want to delete this video?")) {
      return;
    }

    try {
      await deleteVideo({ token, id: videoId });
      toast.success("Video deleted successfully!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Delete failed");
    }
  };

  const resetForm = () => {
    setEditingVideo(null);
    setIsCreating(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Video Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage video content in your library
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>Add New Video</Button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingVideo ? "Edit Video" : "Add New Video"}
            </CardTitle>
            <CardDescription>
              {editingVideo
                ? "Update video information"
                : "Add a new video to the library"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VideoForm
              video={editingVideo}
              onSubmit={handleFormSubmit}
              onCancel={resetForm}
              isLoading={isSubmitting}
            />
          </CardContent>
        </Card>
      )}

      {/* Videos List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos?.map((video: VideoData) => (
          <Card key={video.id}>
            <CardHeader>
              <CardTitle className="text-lg">{video.title}</CardTitle>
              <CardDescription>
                {video.description || "No description"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  <strong>Duration:</strong>{" "}
                  {video.duration ? `${video.duration}s` : "Unknown"}
                </p>
                <p>
                  <strong>Subtitle:</strong>{" "}
                  {video.subtitle ? (
                    <span className="text-green-600 dark:text-green-400">
                      {video.subtitle}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" onClick={() => handleEdit(video)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(video.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {videos?.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              No videos found. Add your first video to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
