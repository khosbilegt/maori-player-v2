"use client";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Funnel, ListVideo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVideos } from "@/lib/hooks/api";
import VideoCard from "@/components/video/video_card";
import StreakBar from "@/components/user/streak_bar";

function LibraryPage() {
  const { videos, isLoading, error } = useVideos();

  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);

  const playlists = [
    {
      id: 1,
      name: "Korero Hauora",
      description:
        "Korero Hauora is a collection of videos that are about health and wellbeing.",
      videos: [
        {
          id: 1,
          title: "Video 1",
          description: "Video 1 description",
        },
      ],
    },
    {
      id: 2,
      name: "Playlist 2",
      description:
        "Korero Hauora is a collection of videos that are about health and wellbeing.",
      videos: [
        {
          id: 2,
          title: "Video 2",
          description: "Video 2 description",
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-4">
      <StreakBar />
      <div className="flex w-full justify-between">
        <Input
          className="w-1/2"
          placeholder="Search titles or kupu (e.g, 'pakihi', 'hauora')"
        />
        <div className="flex gap-4">
          <Button>
            <p className="text-sm">Filter</p>
            <Funnel />
          </Button>
          <Button>
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
              {playlists.map((playlist) => (
                <Card key={playlist.id}>
                  <CardContent className="flex gap-4 justify-between items-center">
                    <div className="flex gap-4 items-center">
                      <ListVideo className="w-8 h-8" />
                      <div className="flex flex-col gap-2">
                        <p className="font-semibold">{playlist.name}</p>
                        <p>{playlist.videos?.length} videos</p>
                      </div>
                    </div>
                    <Button
                      className="w-flex gap-2"
                      onClick={() =>
                        setSelectedPlaylist(playlist.id.toString())
                      }
                      variant={
                        selectedPlaylist === playlist.id.toString()
                          ? "default"
                          : "outline"
                      }
                    >
                      <p>Open</p>
                      <ChevronRight />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            {selectedPlaylist && (
              <div className="w-full lg:w-2/3 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 px-4 lg:px-0">
                {videos?.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="recent">
          <div className="w-full lg:w-2/3 grid grid-cols-3 gap-4">
            {videos?.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default LibraryPage;
