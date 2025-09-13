"use client";
import React, { useEffect, useRef } from "react";
import { TranscriptItem } from "./types";
import { Vocabulary } from "@/lib/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { Notebook, X } from "lucide-react";
import { useLearningListMutations } from "@/lib/hooks/api";
import { toast } from "sonner";

function VideoTranscription({
  isLoadingTranscript,
  transcript,
  currentTime,
  onSeek,
  vocabularies,
}: {
  isLoadingTranscript: boolean;
  transcript: TranscriptItem[];
  currentTime: number;
  onSeek: (time: number) => void;
  vocabularies: Vocabulary[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const { createItem } = useLearningListMutations();

  // Find vocabulary matches in text
  const findVocabularyMatches = (text: string, vocabularies: Vocabulary[]) => {
    const matches: Array<{
      start: number;
      end: number;
      vocabulary: Vocabulary;
      length: number;
    }> = [];

    vocabularies.forEach((vocab) => {
      if (!vocab.maori) return;
      const word = vocab.maori.toLowerCase();
      const textLower = text.toLowerCase();
      let index = textLower.indexOf(word);

      while (index !== -1) {
        matches.push({
          start: index,
          end: index + word.length,
          vocabulary: vocab,
          length: word.length,
        });
        index = textLower.indexOf(word, index + 1);
      }
    });

    // Sort by start position, then by length (longest first for overlapping matches)
    matches.sort((a, b) => {
      if (a.start !== b.start) return a.start - b.start;
      return b.length - a.length;
    });

    // Remove overlapping matches, keeping the longest ones
    const filteredMatches: typeof matches = [];
    let lastEnd = 0;

    matches.forEach((match) => {
      if (match.start >= lastEnd) {
        filteredMatches.push(match);
        lastEnd = match.end;
      }
    });

    return filteredMatches;
  };

  // Render text with vocabulary highlights
  const renderTextWithVocabulary = (
    text: string,
    vocabularies: Vocabulary[]
  ) => {
    if (!vocabularies.length) return text;

    const matches = findVocabularyMatches(text, vocabularies);
    if (!matches.length) return text;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    matches.forEach((match, index) => {
      // Add text before the match
      if (match.start > lastIndex) {
        parts.push(text.slice(lastIndex, match.start));
      }

      // Add the vocabulary button
      parts.push(
        <Popover key={`vocab-${index}`}>
          <PopoverTrigger asChild>
            <span
              className="inline-block px-2 py-1 mx-1 text-xs font-medium text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              {text.slice(match.start, match.end)}
            </span>
          </PopoverTrigger>
          <PopoverContent side="top">
            <div className="flex justify-between">
              <p className="font-light">{match.vocabulary.maori}</p>
              <Button
                variant="ghost"
                className="p-0"
                onClick={async () => {
                  try {
                    const token = localStorage.getItem("auth_token") || "";
                    await createItem(token, {
                      text: match.vocabulary.maori,
                      video_id: "",
                      notes: "",
                    });
                    toast.success(
                      `Added "${match.vocabulary.maori}" to learning list`
                    );
                  } catch (error) {
                    toast.error(
                      `Failed to add "${match.vocabulary.maori}" to learning list`
                    );
                    console.error("Error adding to learning list:", error);
                  }
                }}
              >
                <Notebook />
              </Button>
            </div>
            <p className="font-semibold">{match.vocabulary.english}</p>
            <p className="text-muted-foreground">
              {match.vocabulary.description}
            </p>
          </PopoverContent>
        </Popover>
      );

      lastIndex = match.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

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
              <span className="text-foreground">
                {renderTextWithVocabulary(item.text, vocabularies)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default VideoTranscription;
