"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlaylists, useVideos } from "@/lib/hooks/api";
import { toast } from "sonner";
import type {
  Playlist,
  CreatePlaylistRequest,
  UpdatePlaylistRequest,
  VideoData,
} from "@/lib/types";

export default function PlaylistManagement() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    video_ids: [] as string[],
    is_public: false,
  });

  const {
    playlists,
    isLoading,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
  } = usePlaylists();
  const { videos } = useVideos();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPlaylist) {
        const updateData: UpdatePlaylistRequest = {
          name: formData.name,
          description: formData.description || undefined,
          video_ids: formData.video_ids,
          is_public: formData.is_public,
        };
        await updatePlaylist(editingPlaylist.id, updateData);
        toast.success("Playlist updated successfully!");
      } else {
        const createData: CreatePlaylistRequest = {
          name: formData.name,
          description: formData.description || undefined,
          video_ids: formData.video_ids,
          is_public: formData.is_public,
        };
        await createPlaylist(createData);
        toast.success("Playlist created successfully!");
      }

      resetForm();
    } catch (error: any) {
      toast.error(error?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setFormData({
      name: playlist.name,
      description: playlist.description,
      video_ids: playlist.video_ids,
      is_public: playlist.is_public,
    });
    setIsCreating(true);
  };

  const handleDelete = async (playlistId: string) => {
    if (!confirm("Are you sure you want to delete this playlist?")) {
      return;
    }

    try {
      await deletePlaylist(playlistId);
      toast.success("Playlist deleted successfully!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Delete failed");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      video_ids: [],
      is_public: false,
    });
    setEditingPlaylist(null);
    setIsCreating(false);
  };

  const handleVideoSelection = (videoIds: string[]) => {
    setFormData({ ...formData, video_ids: videoIds });
  };

  const getVideoTitle = (videoId: string) => {
    const video = videos?.find((v) => v.id === videoId);
    return video?.title || `Video ${videoId}`;
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
            Playlist Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage video playlists for the platform
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>Create New Playlist</Button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingPlaylist ? "Edit Playlist" : "Create New Playlist"}
            </CardTitle>
            <CardDescription>
              {editingPlaylist
                ? "Update playlist information"
                : "Create a new playlist"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Playlist Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter playlist name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Visibility
                  </label>
                  <Select
                    value={formData.is_public ? "public" : "private"}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        is_public: value === "public",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter playlist description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Videos *
                </label>
                <Select
                  value=""
                  onValueChange={(videoId) => {
                    if (!formData.video_ids.includes(videoId)) {
                      setFormData({
                        ...formData,
                        video_ids: [...formData.video_ids, videoId],
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add videos to playlist" />
                  </SelectTrigger>
                  <SelectContent>
                    {videos?.map((video) => (
                      <SelectItem key={video.id} value={video.id}>
                        {video.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {formData.video_ids.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium">Selected Videos:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.video_ids.map((videoId) => (
                        <div
                          key={videoId}
                          className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm"
                        >
                          <span>{getVideoTitle(videoId)}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                video_ids: formData.video_ids.filter(
                                  (id) => id !== videoId
                                ),
                              })
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingPlaylist ? "Update Playlist" : "Create Playlist"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Playlist Table */}
      <Card>
        <CardHeader>
          <CardTitle>Playlists</CardTitle>
          <CardDescription>Manage all playlists in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Videos</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {playlists?.map((playlist: Playlist) => (
                <TableRow key={playlist.id}>
                  <TableCell className="font-medium">{playlist.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {playlist.description}
                  </TableCell>
                  <TableCell>{playlist.video_ids.length}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        playlist.is_public
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {playlist.is_public ? "Public" : "Private"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(playlist.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" onClick={() => handleEdit(playlist)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(playlist.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {playlists?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                No playlists found. Create your first playlist to get started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
