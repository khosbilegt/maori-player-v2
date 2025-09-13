import React, { useEffect, useRef } from "react";
import { TranscriptItem } from "./types";

function VideoTranscription({
  isLoadingTranscript,
  transcript,
  currentTime,
  onSeek,
}: {
  isLoadingTranscript: boolean;
  transcript: TranscriptItem[];
  currentTime: number;
  onSeek: (time: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Auto-scroll to current transcript item
  useEffect(() => {
    if (!transcript.length || !containerRef.current) return;

    const currentItem = transcript.find(
      (item) => currentTime >= item.startTime && currentTime <= item.endTime
    );

    if (currentItem) {
      const itemIndex = transcript.findIndex(
        (item) => item.id === currentItem.id
      );
      const itemElement = itemRefs.current.get(itemIndex);

      if (itemElement && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const itemRect = itemElement.getBoundingClientRect();

        // Check if item is not visible in the container
        const isVisible =
          itemRect.top >= containerRect.top &&
          itemRect.bottom <= containerRect.bottom;

        if (!isVisible) {
          itemElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
    }
  }, [currentTime, transcript]);
  return (
    <div ref={containerRef} className="overflow-y-scroll">
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
              ref={(el) => {
                if (el) {
                  itemRefs.current.set(index, el);
                } else {
                  itemRefs.current.delete(index);
                }
              }}
              onClick={() => {
                onSeek(item.startTime + 1);
              }}
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
  );
}

export default VideoTranscription;
