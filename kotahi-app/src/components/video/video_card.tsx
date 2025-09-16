"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { VideoData } from "@/lib/types";
import { Check, Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { useRouter } from "next/navigation";
import {
  useWatchHistoryByVideo,
  useWatchHistoryMutations,
} from "@/lib/hooks/api";
import { toast } from "sonner";

function VideoCard({ video }: { video: VideoData }) {
  const router = useRouter();
  const [token] = useState(() => localStorage.getItem("token"));
  const [isInWatchList, setIsInWatchList] = useState(false);

  const { data: watchHistoryData } = useWatchHistoryByVideo(token, video.id);
  const { createOrUpdate } = useWatchHistoryMutations();

  useEffect(() => {
    if (watchHistoryData?.data) {
      setIsInWatchList(true);
    } else {
      setIsInWatchList(false);
    }
  }, [watchHistoryData]);

  const handleAddToWatchList = async () => {
    if (!token) {
      toast.error("Please log in to add videos to your watch list");
      return;
    }

    try {
      await createOrUpdate(token, {
        video_id: video.id,
        progress: 0,
        current_time: 0,
        duration: 0, // Will be updated when video is actually played
        completed: false,
      });
      setIsInWatchList(true);
      toast.success("Added to watch list!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add to watch list");
    }
  };

  return (
    <Card key={video.id} className="p-0 h-full">
      <CardContent className="flex flex-col p-0 h-full">
        <img
          src={video.thumbnail || ""}
          alt={video.title}
          className="w-full object-cover rounded-t-xl"
        />
        <div className="flex flex-col p-4 gap-2 justify-between flex-grow">
          <div className="flex flex-col gap-2 h-full flex-grow">
            <p className="font-semibold">
              {video.title?.length > 20
                ? video.title.substring(0, 35) + "..."
                : video.title}
            </p>
            <div className="flex gap-4 items-center">
              <p>{video.duration ? video.duration : "00:00"}</p>
              <div className="flex gap-1 items-center">
                <Check className="w-4 h-4 text-gray-500" />
                <p className="text-gray-500">Transcript</p>
              </div>
            </div>
            <Progress value={50} className="w-full" />
            <p className="text-gray-500">Familiarity: 50%</p>
          </div>
          <div className="flex gap-2">
            <Button
              className="w-3/4"
              onClick={() => {
                router.push(`/watch/${video.id}`);
              }}
            >
              Play
            </Button>
            <Button
              className="w-1/4"
              variant={isInWatchList ? "default" : "outline"}
              onClick={handleAddToWatchList}
              disabled={isInWatchList}
            >
              {isInWatchList ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default VideoCard;
