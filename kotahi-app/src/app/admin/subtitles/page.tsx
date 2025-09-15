"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useGetVTTFilesQuery,
  useUploadVTTFileMutation,
  useDeleteVTTFileMutation,
} from "@/lib/api";
import { toast } from "sonner";
import type { VTTFile } from "@/lib/types";

export default function SubtitleManagement() {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: vttFiles, isLoading } = useGetVTTFilesQuery();
  const [uploadVTTFile] = useUploadVTTFileMutation();
  const [deleteVTTFile] = useDeleteVTTFileMutation();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith(".vtt")) {
      toast.error("Please select a .vtt file");
      return;
    }

    setIsUploading(true);

    try {
      await uploadVTTFile(file);
      toast.success("VTT file uploaded successfully!");

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm("Are you sure you want to delete this VTT file?")) {
      return;
    }

    try {
      await deleteVTTFile(filename);
      toast.success("VTT file deleted successfully!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Delete failed");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
            Subtitle Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage VTT subtitle files for your videos
          </p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()}>
          Upload VTT File
        </Button>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Subtitle File</CardTitle>
          <CardDescription>
            Upload a .vtt subtitle file to make it available for videos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".vtt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Click the "Upload VTT File" button to select a subtitle file
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Supported format: .vtt (WebVTT)
              </p>
            </div>
            {isUploading && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Uploading file...
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* VTT Files List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Uploaded Subtitle Files</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vttFiles?.data?.map((file: VTTFile) => (
            <Card key={file.id}>
              <CardHeader>
                <CardTitle className="text-lg truncate">
                  {file.filename}
                </CardTitle>
                <CardDescription>{file.filename}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    <strong>Path:</strong> {file.url}
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(file.filename)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {vttFiles?.data?.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              No VTT files found. Upload your first subtitle file to get
              started.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>VTT File Format</CardTitle>
          <CardDescription>
            Information about WebVTT subtitle format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong>WebVTT Format:</strong> Standard format for video
              subtitles
            </p>
            <p>
              <strong>File Extension:</strong> Must end with .vtt
            </p>
            <p>
              <strong>Encoding:</strong> UTF-8 recommended
            </p>
            <p>
              <strong>Structure:</strong> Contains timing cues and text content
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
