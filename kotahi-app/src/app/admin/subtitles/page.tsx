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
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: vttFiles, isLoading } = useGetVTTFilesQuery();
  const [uploadVTTFile] = useUploadVTTFileMutation();
  const [deleteVTTFile] = useDeleteVTTFileMutation();

  const handleFileUpload = async (file: File) => {
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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const vttFile = files.find((file) => file.name.endsWith(".vtt"));

    if (vttFile) {
      handleFileUpload(vttFile);
    } else {
      toast.error("Please drop a .vtt file");
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
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload VTT File"}
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
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 cursor-pointer ${
                isDragOver
                  ? "border-primary bg-primary/5 dark:bg-primary/10"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <div className="space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Uploading file...
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      {isDragOver
                        ? "Drop your VTT file here"
                        : "Drag and drop your VTT file here, or click to browse"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Supported format: .vtt (WebVTT)
                    </p>
                  </div>
                </div>
              )}
            </div>
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
