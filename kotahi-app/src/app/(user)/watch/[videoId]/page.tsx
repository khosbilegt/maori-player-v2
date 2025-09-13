"use client";
import VideoPlayer from "@/components/video/video_player";
import TextSelectionPopover from "@/components/video/text_selection_popover";
import { useVideo, useVTTFiles } from "@/lib/hooks/api";
import { useTextSelection } from "@/hooks/use-text-selection";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { environment } from "@/lib/config";
import { TranscriptItem } from "@/lib/types";
import { loadVTTTranscript } from "@/lib/vtt-parser";

function WatchPage() {
  const { videoId } = useParams();
  const { data: video } = useVideo(videoId as string);
  const { selectedText, position, isVisible, clearSelection } =
    useTextSelection();
  const [currentTime, setCurrentTime] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);

  // Load transcript when video data is available
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

  const handleAddToLearningList = (text: string) => {
    console.log("Adding to learning list:", text);
    // TODO: Implement API call to add to learning list
  };

  const handleAddToVocabulary = (text: string) => {
    console.log("Adding to vocabulary:", text);
    // TODO: Implement API call to add to vocabulary
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">{video?.title}</h1>
        <p className="text-muted-foreground">{video?.description}</p>

        <VideoPlayer
          src={video?.video}
          onTimeUpdate={handleTimeUpdate}
          transcript={transcript}
          currentTime={currentTime}
        />

        {/* Text Selection Popover */}
        {isVisible && selectedText && (
          <TextSelectionPopover
            selectedText={selectedText}
            position={position}
            onAddToLearningList={handleAddToLearningList}
            onAddToVocabulary={handleAddToVocabulary}
            onClose={clearSelection}
          />
        )}

        {/* Transcript Display */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Transcript</h2>
          <div className="bg-card border rounded-lg p-4 space-y-2">
            {isLoadingTranscript ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading transcript...
              </div>
            ) : transcript.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transcript available
              </div>
            ) : (
              transcript.map((item: TranscriptItem, index: number) => (
                <div
                  key={item.id || index}
                  className={`p-2 rounded transition-colors cursor-pointer ${
                    currentTime >= item.startTime && currentTime <= item.endTime
                      ? "bg-primary/10 border-l-4 border-primary"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <span className="text-sm text-muted-foreground mr-2">
                    {Math.floor(item.startTime / 60)}:
                    {(item.startTime % 60).toFixed(0).padStart(2, "0")}
                  </span>
                  <span className="text-foreground">{item.text}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WatchPage;
