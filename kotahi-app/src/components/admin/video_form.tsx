"use client";

import { useState, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetVTTFilesQuery } from "@/lib/api";
import type { VideoData } from "@/lib/types";
import { Textarea } from "../ui/textarea";

interface VideoFormData {
  title: string;
  description: string;
  video: string;
  thumbnail: string;
  duration: string;
  subtitle: string;
}

interface VideoFormProps {
  video?: VideoData | null;
  onSubmit: (data: VideoFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function VideoForm({
  video,
  onSubmit,
  onCancel,
  isLoading = false,
}: VideoFormProps) {
  const { data: vttFiles, isLoading: vttLoading } = useGetVTTFilesQuery();

  const [formData, setFormData] = useState<VideoFormData>({
    title: "",
    description: "",
    video: "",
    thumbnail: "",
    duration: "",
    subtitle: "",
  });

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title || "",
        description: video.description || "",
        video: video.video || "",
        thumbnail: video.thumbnail || "",
        duration: video.duration || "",
        subtitle: video.subtitle || "",
      });
    } else {
      // Reset form when creating new video
      setFormData({
        title: "",
        description: "",
        video: "",
        thumbnail: "",
        duration: "",
        subtitle: "",
      });
    }
  }, [video]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    console.log(formData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{video ? "Edit Video" : "Create New Video"}</CardTitle>
        <CardDescription>
          {video
            ? "Update video information"
            : "Add a new video to the library"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter video title"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Duration (MM:SS) *
              </label>
              <Input
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="05:30"
                pattern="^([0-5]?[0-9]):([0-5][0-9])$"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter duration in MM:SS format (e.g., 05:30 for 5 minutes 30
                seconds)
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description *
            </label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter video description"
              required
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Video URL *
            </label>
            <Input
              name="video"
              type="url"
              value={formData.video}
              onChange={handleInputChange}
              placeholder="https://example.com/video.mp4"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Thumbnail URL
            </label>
            <Input
              name="thumbnail"
              type="url"
              value={formData.thumbnail}
              onChange={handleInputChange}
              placeholder="https://example.com/thumbnail.jpg"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Subtitle File
            </label>
            <div className="space-y-2">
              <Select
                value={formData.subtitle}
                onValueChange={(value) => {
                  if (value?.length > 0) {
                    setFormData({ ...formData, subtitle: value });
                  }
                }}
                disabled={isLoading || vttLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder="Select a subtitle file"
                    className="w-full"
                  />
                </SelectTrigger>
                <SelectContent>
                  {vttFiles?.data?.map((file) => (
                    <SelectItem key={file.filename} value={file.url}>
                      {file.filename}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {vttLoading && (
                <p className="text-sm text-muted-foreground">
                  Loading subtitle files...
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : video
                ? "Update Video"
                : "Create Video"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
