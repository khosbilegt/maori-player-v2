"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { VideoData, WatchHistory } from "@/lib/types";
import { Check, Bookmark, BookmarkCheck, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { useRouter } from "next/navigation";
import { useWatchHistoryMutations } from "@/lib/hooks/api";
import { toast } from "sonner";

function VideoCard({
  video,
  watchHistory,
}: {
  video: VideoData;
  watchHistory?: WatchHistory;
}) {
  const router = useRouter();
  const [token] = useState(() => localStorage.getItem("token"));
  const [isInWatchList, setIsInWatchList] = useState(false);

  const { createOrUpdate } = useWatchHistoryMutations();

  useEffect(() => {
    if (watchHistory) {
      setIsInWatchList(true);
    } else {
      setIsInWatchList(false);
    }
  }, [watchHistory]);

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
              {watchHistory?.completed && (
                <div className="flex gap-1 items-center">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <p className="text-green-500 text-sm">Completed</p>
                </div>
              )}
            </div>
            <Progress
              value={watchHistory ? Math.round(watchHistory.progress * 100) : 0}
              className="w-full"
            />
            <p className="text-gray-500">
              Progress:{" "}
              {watchHistory ? Math.round(watchHistory.progress * 100) : 0}%
            </p>
            {watchHistory && (
              <p className="text-xs text-gray-400">
                Watched: {Math.floor(watchHistory.current_time / 60)}:
                {(watchHistory.current_time % 60).toFixed(0).padStart(2, "0")} /{" "}
                {Math.floor(watchHistory.duration / 60)}:
                {(watchHistory.duration % 60).toFixed(0).padStart(2, "0")}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              className="w-3/4"
              onClick={() => {
                const hasWatchHistory = watchHistory;
                const currentTime = hasWatchHistory
                  ? watchHistory.current_time
                  : 0;
                const isCompleted = hasWatchHistory
                  ? watchHistory.completed
                  : false;

                // If there's watch history and it's not completed, resume from current time
                if (hasWatchHistory && !isCompleted && currentTime > 0) {
                  router.push(
                    `/watch/${video.id}?t=${Math.round(currentTime)}`
                  );
                } else {
                  router.push(`/watch/${video.id}`);
                }
              }}
            >
              {watchHistory
                ? watchHistory.completed
                  ? "Rewatch"
                  : "Continue"
                : "Play"}
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
