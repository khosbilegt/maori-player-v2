import React, { useEffect, useRef, useState } from "react";
import WordTooltip from "./WordTooltip";
import {
  getAllVocabData,
  parseTextForVocabMatches,
  type VocabData,
  type VocabEntry,
} from "../utils/vocabLoader";

export interface TranscriptItem {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

interface TranscriptViewerProps {
  transcript: TranscriptItem[];
  currentTime: number;
  onSeek?: (time: number) => void;
  className?: string;
}

const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  transcript,
  currentTime,
  onSeek,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [vocabData, setVocabData] = useState<VocabData>({});

  // Load vocabulary data on component mount
  useEffect(() => {
    const loadVocab = async () => {
      try {
        const data = await getAllVocabData();
        setVocabData(data);
      } catch (error) {
        console.error("Failed to load vocabulary data:", error);
      }
    };

    loadVocab();
  }, []);

  useEffect(() => {
    const activeItem = transcript
      .slice()
      .reverse()
      .find(
        (item) => currentTime >= item.startTime && currentTime <= item.endTime
      );
    setActiveItemId(activeItem?.id || null);
  }, [currentTime, transcript]);

  useEffect(() => {
    if (activeItemId && containerRef.current) {
      const activeElement = containerRef.current.querySelector(
        `[data-id="${activeItemId}"]`
      ) as HTMLElement;

      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [activeItemId]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleItemClick = (event: React.MouseEvent, startTime: number) => {
    // Check if the click was on a hoverable word or its container
    const target = event.target as HTMLElement;
    const isWordClick =
      target.closest(".hoverable-word") ||
      target.classList.contains("hoverable-word");

    // Only seek if it's not a word click
    if (!isWordClick) {
      onSeek?.(startTime);
    }
  };

  // Function to render text with hoverable words/phrases (only for entries in vocab.json)
  const renderTextWithTooltips = (text: string) => {
    // Find all vocabulary matches in the text (longest first)
    const vocabMatches = parseTextForVocabMatches(text, vocabData);

    // Split text into segments while preserving whitespace
    const segments = text.split(/(\s+)/);

    // Create a map to track which segments are part of vocabulary matches
    const segmentVocabMap = new Map<
      number,
      {
        entry: VocabEntry;
        matchedText: string;
        vocabId: string;
        isStart: boolean;
        isEnd: boolean;
      }
    >();

    // Mark segments that are part of vocabulary matches
    vocabMatches.forEach((match) => {
      for (let i = match.startIndex; i <= match.endIndex; i++) {
        segmentVocabMap.set(i, {
          entry: match.entry,
          matchedText: match.matchedText,
          vocabId: match.vocabId,
          isStart: i === match.startIndex,
          isEnd: i === match.endIndex,
        });
      }
    });

    // Render segments with appropriate wrappers
    const renderedSegments: React.ReactNode[] = [];
    let skipUntil = -1;

    segments.forEach((segment, index) => {
      // Skip if we're in the middle of a multi-word match
      if (index <= skipUntil) {
        return;
      }

      const vocabInfo = segmentVocabMap.get(index);

      if (vocabInfo && vocabInfo.isStart) {
        // This is the start of a vocabulary match
        // Find the end of this match
        let endIndex = index;
        while (endIndex < segments.length && segmentVocabMap.get(endIndex)) {
          endIndex++;
        }
        endIndex--; // Go back to the last segment that was part of the match

        // Extract the matched text from segments
        const matchSegments = segments.slice(index, endIndex + 1);
        const matchedText = matchSegments.join("");

        // Create tooltip for the entire phrase
        renderedSegments.push(
          <WordTooltip key={`vocab-${index}`} vocabEntry={vocabInfo.entry}>
            <span
              className="hoverable-word"
              data-vocab-id={vocabInfo.vocabId}
              id={`vocab-span-${vocabInfo.vocabId}-${index}`}
            >
              {matchedText}
            </span>
          </WordTooltip>
        );

        // Skip ahead past this match
        skipUntil = endIndex;
      } else if (!vocabInfo) {
        // This segment is not part of any vocabulary match
        if (segment.match(/^\s+$/)) {
          // It's whitespace
          renderedSegments.push(segment);
        } else {
          // It's a regular word - extract punctuation
          const wordMatch = segment.match(/^(\W*)(.*?)(\W*)$/);
          const [, leadingPunct, word, trailingPunct] = wordMatch || [
            "",
            "",
            segment,
            "",
          ];

          renderedSegments.push(
            <React.Fragment key={`regular-${index}`}>
              {leadingPunct}
              <span>{word}</span>
              {trailingPunct}
            </React.Fragment>
          );
        }
      }
    });

    return renderedSegments;
  };

  return (
    <div className={`transcript-viewer ${className}`} ref={containerRef}>
      <h3 className="transcript-title">Transcript</h3>
      <div className="transcript-content">
        {transcript.map((item) => (
          <div
            key={item.id}
            data-id={item.id}
            className={`transcript-item ${
              activeItemId === item.id ? "active" : ""
            }`}
            onClick={(event) => handleItemClick(event, item.startTime)}
          >
            <span className="transcript-time">
              {formatTime(item.startTime)}
            </span>
            <span className="transcript-text">
              {renderTextWithTooltips(item.text)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TranscriptViewer;
