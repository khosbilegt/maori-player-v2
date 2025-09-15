"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useGetVideosQuery,
  useGetVocabulariesQuery,
  useGetVTTFilesQuery,
} from "@/lib/api";
import { FileText, Play, WholeWord } from "lucide-react";

export default function AdminDashboard() {
  const token = localStorage.getItem("token");
  const { data: videos, isLoading: videosLoading } = useGetVideosQuery();
  const { data: vocabularies, isLoading: vocabLoading } =
    useGetVocabulariesQuery();
  const { data: vttFiles, isLoading: vttLoading } = useGetVTTFilesQuery(
    token || ""
  );

  const stats = [
    {
      title: "Total Videos",
      value: videos?.length || 0,
      description: "Videos in the library",
      icon: <Play />,
    },
    {
      title: "Vocabulary Items",
      value: vocabularies?.length || 0,
      description: "Maori vocabulary entries",
      icon: <WholeWord />,
    },
    {
      title: "Subtitle Files",
      value: vttFiles?.data?.length || 0,
      description: "VTT subtitle files",
      icon: <FileText />,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your Kotahi platform content and settings
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <span className="text-2xl">{stat.icon}</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Video Management</CardTitle>
            <CardDescription>
              Add, edit, and manage video content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                • Upload new videos
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                • Edit video metadata
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                • Manage video thumbnails
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vocabulary Management</CardTitle>
            <CardDescription>Manage Maori vocabulary database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                • Add new vocabulary
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                • Edit translations
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                • Manage categories
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subtitle Management</CardTitle>
            <CardDescription>
              Upload and manage VTT subtitle files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                • Upload VTT files
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                • Manage subtitle files
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                • Delete old files
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
