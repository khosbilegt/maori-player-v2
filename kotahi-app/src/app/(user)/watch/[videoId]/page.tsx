"use client";
import VideoPlayer from "@/components/video/video_player";
import { useVideo, useVocabularies } from "@/lib/hooks/api";
import { useParams } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { environment } from "@/lib/config";
import type { TranscriptItem } from "@/lib/types";
import { loadVTTTranscript } from "@/lib/vtt-parser";
import VideoTranscription from "@/components/video/video_transcription";
import type { VideoPlayerRef } from "@/components/video/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

function WatchPage() {
  const { videoId } = useParams();
  const { data: video } = useVideo(videoId as string);
  const { vocabularies } = useVocabularies();
  const [currentTime, setCurrentTime] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const videoPlayerRef = useRef<VideoPlayerRef>(null);

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
        <div className="flex items-center gap-2">
          <Link href="/library">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-bold">{video?.title}</h1>
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
