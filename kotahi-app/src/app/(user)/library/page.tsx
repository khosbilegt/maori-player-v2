"use client";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, ListVideo } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useVideos,
  usePlaylists,
  usePlaylist,
  useWatchHistory,
  useThrottledGeneralSearch,
} from "@/lib/hooks/api";
import VideoCard from "@/components/video/video_card";
import StreakBar from "@/components/user/streak_bar";
import SearchResults from "@/components/search/SearchResults";
import type { Playlist } from "@/lib/types";
import Link from "next/link";

function LibraryPage() {
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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
  const {
    data: searchData,
    isLoading: searchLoading,
    error: searchError,
  } = useThrottledGeneralSearch(searchQuery);

  // Auto-select the first playlist when playlists are loaded
  React.useEffect(() => {
    if (playlists && playlists.length > 0 && !selectedPlaylist) {
      setSelectedPlaylist(playlists[0].id);
    }
  }, [playlists, selectedPlaylist]);

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
        <div className="w-1/2 relative">
          <Input
            className="w-full"
            placeholder="Search titles or kupu (e.g, 'pakihi', 'hauora')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery.length >= 2 && searchLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
        <div className="flex gap-4">
          <Button variant="outline">
            <Link href="/watch-list" className="text-sm">
              History
            </Link>
            <ListVideo />
          </Button>
        </div>
      </div>

      {/* Search Results */}
      {searchQuery.length >= 2 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-4">
            Search Results for &ldquo;{searchQuery}&rdquo;
          </h2>
          <SearchResults
            results={searchData?.results || []}
            isLoading={searchLoading}
            error={searchError}
          />
        </div>
      )}

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
