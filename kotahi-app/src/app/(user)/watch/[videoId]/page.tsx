"use client";
import VideoPlayer from "@/components/video/video_player";
import { useVideo } from "@/lib/hooks/api";
import { useParams } from "next/navigation";
import React from "react";

function WatchPage() {
  const { videoId } = useParams();
  const { data: video } = useVideo(videoId as string);

  console.log(video);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">{video?.title}</h1>
        <p className="text-sm text-gray-500">{video?.description}</p>
        <VideoPlayer
          className="overflow-hidden rounded-lg border"
          src={video?.video}
        />
      </div>
    </div>
  );
}

export default WatchPage;
