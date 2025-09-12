import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { VideoData } from "@/lib/types";
import { Check } from "lucide-react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";

function VideoCard({ video }: { video: VideoData }) {
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
            <Button className="w-3/4">Play</Button>
            <Button className="w-1/4">Save</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default VideoCard;
