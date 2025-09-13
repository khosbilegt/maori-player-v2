"use client";
import VideoPlayer from "@/components/video/video_player";
import TextSelectionPopover from "@/components/video/text_selection_popover";
import { useVideo } from "@/lib/hooks/api";
import { useTextSelection } from "@/hooks/use-text-selection";
import { useParams } from "next/navigation";
import React, { useState } from "react";

function WatchPage() {
  const { videoId } = useParams();
  const { data: video } = useVideo(videoId as string);
  const { selectedText, position, isVisible, clearSelection } =
    useTextSelection();
  const [currentTime, setCurrentTime] = useState(0);

  // Mock transcript data - in real app this would come from API
  const mockTranscript = [
    {
      id: "1",
      startTime: 0,
      endTime: 3,
      text: "Kia ora, welcome to learning Māori language.",
    },
    {
      id: "2",
      startTime: 3,
      endTime: 6,
      text: "Today we will learn basic greetings and introductions.",
    },
    {
      id: "3",
      startTime: 6,
      endTime: 9,
      text: "Let's start with 'Kia ora' which means hello.",
    },
    {
      id: "4",
      startTime: 9,
      endTime: 12,
      text: "You can use 'Kia ora' in many different situations.",
    },
    {
      id: "5",
      startTime: 12,
      endTime: 15,
      text: "It's a versatile greeting in Māori culture.",
    },
  ];

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
          transcript={mockTranscript}
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
            {mockTranscript.map((item, index) => (
              <div
                key={index}
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WatchPage;
