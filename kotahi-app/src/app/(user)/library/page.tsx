"use client";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Funnel, ListVideo } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useVideos,
  usePlaylists,
  usePlaylist,
  useWatchHistory,
} from "@/lib/hooks/api";
import VideoCard from "@/components/video/video_card";
import StreakBar from "@/components/user/streak_bar";
import type { Playlist } from "@/lib/types";

function LibraryPage() {
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [token] = useState(() => localStorage.getItem("token"));

  const { videos, isLoading: videosLoading, error: videosError } = useVideos();
  const {
    playlists,
    isLoading: playlistsLoading,
    error: playlistsError,
  } = usePlaylists();
  const { data: selectedPlaylistData, isLoading: playlistLoading } =
    usePlaylist(selectedPlaylist || "", {
      skip: !selectedPlaylist,
    });
  const { data: watchHistoryData } = useWatchHistory(token);

  // Create a map of video IDs to watch history data for efficient lookup
  const watchHistoryMap = new Map();
  if (watchHistoryData?.data) {
    watchHistoryData.data.forEach((history) => {
      watchHistoryMap.set(history.video_id, history);
    });
  }

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-4">
      <StreakBar />
      <div className="flex w-full justify-between">
        <Input
          className="w-1/2"
          placeholder="Search titles or kupu (e.g, 'pakihi', 'hauora')"
        />
        <div className="flex gap-4">
          <Button variant="outline">
            <p className="text-sm">Filter</p>
            <Funnel />
          </Button>
          <Button variant="outline">
            <p className="text-sm">My library</p>
            <ListVideo />
          </Button>
        </div>
      </div>
      <Tabs defaultValue="playlists">
        <TabsList>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
          <TabsTrigger value="recent">Recently added</TabsTrigger>
        </TabsList>
        <TabsContent value="playlists">
          <div className="w-full flex gap-4 mt-2 flex-wrap">
            <div className="w-full lg:w-1/4 flex flex-col gap-4">
              {playlistsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : playlistsError ? (
                <div className="text-center py-8">
                  <p className="text-red-600">Failed to load playlists</p>
                </div>
              ) : playlists?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    No playlists available
                  </p>
                </div>
              ) : (
                playlists?.map((playlist: Playlist) => (
                  <Card key={playlist.id}>
                    <CardContent className="flex gap-4 justify-between items-center">
                      <div className="flex gap-4 items-center">
                        <ListVideo className="w-8 h-8" />
                        <div className="flex flex-col gap-2">
                          <p className="font-semibold">{playlist.name}</p>
                          <p>{playlist.video_ids?.length || 0} videos</p>
                          {playlist.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-32">
                              {playlist.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        className="w-flex gap-2"
                        onClick={() => setSelectedPlaylist(playlist.id)}
                        variant={
                          selectedPlaylist === playlist.id
                            ? "default"
                            : "outline"
                        }
                      >
                        <p>Open</p>
                        <ChevronRight />
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            <div className="w-full lg:w-2/3">
              {!selectedPlaylist ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    Select a playlist to view its videos
                  </p>
                </div>
              ) : playlistLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : selectedPlaylistData?.videos?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    This playlist is empty
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 px-4 lg:px-0">
                  {selectedPlaylistData?.videos?.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      watchHistory={watchHistoryMap.get(video.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="recent">
          <div className="w-full">
            {videosLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : videosError ? (
              <div className="text-center py-8">
                <p className="text-red-600">Failed to load videos</p>
              </div>
            ) : videos?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No videos available
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {videos?.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    watchHistory={watchHistoryMap.get(video.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default LibraryPage;
