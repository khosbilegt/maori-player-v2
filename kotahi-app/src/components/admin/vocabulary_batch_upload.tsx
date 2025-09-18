"use client";

import { useState, useRef } from "react";
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
import { Progress } from "@/components/ui/progress";
import { useBatchUploadVocabularyMutation } from "@/lib/api";
import { toast } from "sonner";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";

interface BatchUploadResult {
  message: string;
  created: number;
  updated: number;
  total: number;
  created_items?: any[];
  updated_items?: any[];
}

export default function VocabularyBatchUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [duplicateMode, setDuplicateMode] = useState<
    "update" | "skip" | "error"
  >("update");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BatchUploadResult | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [batchUploadVocabulary] = useBatchUploadVocabularyMutation();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.toLowerCase().endsWith(".csv")) {
        toast.error("Please select a CSV file");
        return;
      }

      // Validate file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        toast.error("File size must be less than 100MB");
        return;
      }

      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const result = await batchUploadVocabulary({
        file: selectedFile,
        duplicates: duplicateMode,
      }).unwrap();

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadResult(result);

      toast.success(result.message);
    } catch (error: any) {
      toast.error(error?.data?.message || "Upload failed");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = `maori,english,description
Kia ora,Hello,"A traditional Māori greeting meaning hello or goodbye"
Whānau,Family,"Extended family including grandparents, aunts, uncles, and cousins"
Aroha,Love,"Love, compassion, and empathy"`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sample_vocabulary.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Batch Upload Vocabulary
        </CardTitle>
        <CardDescription>
          Upload vocabulary items in bulk using a CSV file. The CSV should have
          3 columns: maori, english, description.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select CSV File
            </label>
            <div className="flex items-center gap-4">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={downloadSampleCSV}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Sample CSV
              </Button>
            </div>
            {selectedFile && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Selected: {selectedFile.name} (
                {(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Duplicate Handling */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Duplicate Handling
            </label>
            <Select
              value={duplicateMode}
              onValueChange={(value: "update" | "skip" | "error") =>
                setDuplicateMode(value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="update">
                  Update existing items (default)
                </SelectItem>
                <SelectItem value="skip">Skip existing items</SelectItem>
                <SelectItem value="error">Error on duplicates</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {duplicateMode === "update" &&
                "Existing vocabulary will be updated with new data"}
              {duplicateMode === "skip" &&
                "Existing vocabulary will be skipped, only new items added"}
              {duplicateMode === "error" &&
                "Upload will fail if any duplicates are found"}
            </p>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Upload Result */}
        {uploadResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Upload Complete!</span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="font-semibold text-blue-600 dark:text-blue-400">
                  {uploadResult.total}
                </div>
                <div className="text-blue-500 dark:text-blue-300">
                  Total Processed
                </div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="font-semibold text-green-600 dark:text-green-400">
                  {uploadResult.created}
                </div>
                <div className="text-green-500 dark:text-green-300">
                  Created
                </div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="font-semibold text-orange-600 dark:text-orange-400">
                  {uploadResult.updated}
                </div>
                <div className="text-orange-500 dark:text-orange-300">
                  Updated
                </div>
              </div>
            </div>

            {uploadResult.created_items &&
              uploadResult.created_items.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Newly Created Items:</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {uploadResult.created_items.map((item, index) => (
                      <div
                        key={index}
                        className="text-sm p-2 bg-green-50 dark:bg-green-900/20 rounded"
                      >
                        <span className="font-medium">{item.maori}</span> -{" "}
                        {item.english}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {uploadResult.updated_items &&
              uploadResult.updated_items.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Updated Items:</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {uploadResult.updated_items.map((item, index) => (
                      <div
                        key={index}
                        className="text-sm p-2 bg-orange-50 dark:bg-orange-900/20 rounded"
                      >
                        <span className="font-medium">{item.maori}</span> -{" "}
                        {item.english}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Upload CSV"}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isUploading}
          >
            Reset
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>
            <strong>CSV Format:</strong> maori,english,description
          </p>
          <p>
            <strong>Requirements:</strong> All fields are required. Fields
            containing commas must be quoted.
          </p>
          <p>
            <strong>File Size:</strong> Maximum 100MB
          </p>
          <p>
            <strong>Example:</strong> Kia ora,Hello,"A traditional Māori
            greeting"
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
