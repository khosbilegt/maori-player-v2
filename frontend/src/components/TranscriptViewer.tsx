import React, { useEffect, useRef, useState } from "react";
import WordTooltip from "./WordTooltip";
import TextSelectionPopover from "./TextSelectionPopover";
import {
  getAllVocabData,
  parseTextForVocabMatches,
  type VocabData,
  type VocabEntry,
} from "../utils/vocabLoader";
import { apiClient } from "../utils/apiClient";

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
  videoId?: string;
}

const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  transcript,
  currentTime,
  onSeek,
  className = "",
  videoId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [vocabData, setVocabData] = useState<VocabData>({});
  const [selectedText, setSelectedText] = useState<string>("");
  const [popoverPosition, setPopoverPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [showPopover, setShowPopover] = useState<boolean>(false);
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Handle text selection
  useEffect(() => {
    const handleTextSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.toString().trim() === "") {
        setShowPopover(false);
        return;
      }

      const selectedText = selection.toString().trim();
      if (selectedText.length === 0 || selectedText.length < 2) {
        setShowPopover(false);
        return;
      }

      // Check if selection is within the transcript viewer
      const range = selection.getRangeAt(0);
      const container = containerRef.current;

      // More robust check for whether selection is within transcript
      let isWithinTranscript = false;
      if (container) {
        // Check if the range's common ancestor is within our container
        isWithinTranscript = container.contains(range.commonAncestorContainer);

        // Also check if the start and end containers are within our container
        if (!isWithinTranscript) {
          isWithinTranscript =
            container.contains(range.startContainer) &&
            container.contains(range.endContainer);
        }
      }

      if (!isWithinTranscript) {
        setShowPopover(false);
        return;
      }

      // Get selection position - handle both forward and backward selections
      let rect = range.getBoundingClientRect();

      // If we don't have valid dimensions, try alternative methods
      if (rect.width === 0 && rect.height === 0) {
        // Try to get position from the range's start container
        const startContainer = range.startContainer;
        if (startContainer.nodeType === Node.TEXT_NODE) {
          const textNode = startContainer as Text;
          const tempRange = document.createRange();
          tempRange.setStart(textNode, range.startOffset);
          tempRange.setEnd(
            textNode,
            Math.min(range.startOffset + 1, textNode.length)
          );
          rect = tempRange.getBoundingClientRect();
        } else if (startContainer.nodeType === Node.ELEMENT_NODE) {
          // If it's an element node, get its bounding rect
          const element = startContainer as Element;
          rect = element.getBoundingClientRect();
        }
      }

      // Final fallback: use the middle of the viewport if we still don't have valid dimensions
      if (rect.width === 0 && rect.height === 0) {
        rect = {
          left: window.innerWidth / 2,
          top: window.innerHeight / 2,
          width: 0,
          height: 0,
          right: window.innerWidth / 2,
          bottom: window.innerHeight / 2,
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
          toJSON: () => ({}),
        };
      }

      setSelectedText(selectedText);
      setPopoverPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
      setShowPopover(true);
    };

    let isMouseDown = false;

    const handleMouseDown = () => {
      isMouseDown = true;
    };

    const handleMouseUp = (event: MouseEvent) => {
      isMouseDown = false;

      // Only handle if the mouse up is within the transcript viewer
      const container = containerRef.current;
      if (container && container.contains(event.target as Node)) {
        // Add a small delay to ensure selection is complete
        setTimeout(() => {
          const selection = window.getSelection();
          if (selection && selection.toString().trim().length > 0) {
            handleTextSelection();
          }
        }, 50);
      }
    };

    const handleSelectionChange = () => {
      // Only handle selection changes if mouse is not currently down
      // This prevents auto-selection glitches
      if (!isMouseDown) {
        // Clear any existing timeout
        if (selectionTimeoutRef.current) {
          clearTimeout(selectionTimeoutRef.current);
        }

        // Set a new timeout to debounce selection changes
        selectionTimeoutRef.current = setTimeout(handleTextSelection, 100);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("selectionchange", handleSelectionChange);

      // Clear any pending timeout
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, []);

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

  const handleClosePopover = () => {
    setShowPopover(false);
    setSelectedText("");
    // Clear any text selection
    window.getSelection()?.removeAllRanges();
  };

  const handleAddToLearnList = async (text: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.error("No authentication token found");
        alert("Please log in to add items to your learning list");
        return;
      }

      await apiClient.createLearningListItem(token, {
        text: text,
        video_id: videoId,
      });

      console.log("Successfully added to learn list:", text);
      alert(`"${text}" has been added to your learning list!`);
    } catch (error) {
      console.error("Failed to add to learn list:", error);
      alert("Failed to add to learning list. Please try again.");
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
    <>
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

      {showPopover && (
        <TextSelectionPopover
          selectedText={selectedText}
          position={popoverPosition}
          onClose={handleClosePopover}
          onAddToLearnList={handleAddToLearnList}
        />
      )}
    </>
  );
};

export default TranscriptViewer;
