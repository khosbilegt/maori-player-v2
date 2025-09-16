"use client";
import VideoPlayer from "@/components/video/video_player";
import {
  useVideo,
  useVocabularies,
  useWatchHistoryByVideo,
  useWatchHistoryMutations,
} from "@/lib/hooks/api";
import { useParams } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { environment } from "@/lib/config";
import type { TranscriptItem } from "@/lib/types";
import { loadVTTTranscript } from "@/lib/vtt-parser";
import VideoTranscription from "@/components/video/video_transcription";
import type { VideoPlayerRef } from "@/components/video/types";
import { ArrowLeft, Bookmark, BookmarkCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function WatchPage() {
  const { videoId } = useParams();
  const { data: video } = useVideo(videoId as string);
  const { vocabularies } = useVocabularies();
  const [currentTime, setCurrentTime] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [token] = useState(() => localStorage.getItem("token"));
  const [isInWatchList, setIsInWatchList] = useState(false);
  const videoPlayerRef = useRef<VideoPlayerRef>(null);

  const { data: watchHistoryData } = useWatchHistoryByVideo(
    token,
    videoId as string
  );
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
        video_id: videoId as string,
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

  useEffect(() => {
    const loadTranscript = async () => {
      if (!video?.subtitle) {
        setTranscript([]);
        return;
      }

      setIsLoadingTranscript(true);
      try {
        const transcriptData = await loadVTTTranscript(
          video.subtitle,
          environment.apiBaseUrl
        );
        setTranscript(transcriptData);
      } catch (error) {
        console.error("Failed to load transcript:", error);
        setTranscript([]);
      } finally {
        setIsLoadingTranscript(false);
      }
    };

    loadTranscript();
  }, [video?.subtitle]);

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleSeek = (time: number) => {
    videoPlayerRef.current?.seekTo(time);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/library">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-bold">{video?.title}</h1>
          </div>
          <Button
            variant={isInWatchList ? "default" : "outline"}
            onClick={handleAddToWatchList}
            disabled={isInWatchList}
            className="flex items-center gap-2"
          >
            {isInWatchList ? (
              <>
                <BookmarkCheck className="w-4 h-4" />
                In Watch List
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                Add to Watch List
              </>
            )}
          </Button>
        </div>
        <p className="text-muted-foreground">{video?.description}</p>

        <div className="flex gap-4 h-[500px]">
          <VideoPlayer
            ref={videoPlayerRef}
            src={video?.video}
            subtitleSrc={video?.subtitle}
            onTimeUpdate={handleTimeUpdate}
            transcript={transcript}
            currentTime={currentTime}
          />

          <VideoTranscription
            isLoadingTranscript={isLoadingTranscript}
            transcript={transcript}
            currentTime={currentTime}
            onSeek={handleSeek}
            vocabularies={vocabularies || []}
          />
        </div>
      </div>
    </div>
  );
}

export default WatchPage;
