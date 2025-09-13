"use client";

import { useState, useEffect, useCallback } from "react";

interface TextSelectionState {
  selectedText: string;
  position: { x: number; y: number };
  isVisible: boolean;
}

export const useTextSelection = () => {
  const [selectionState, setSelectionState] = useState<TextSelectionState>({
    selectedText: "",
    position: { x: 0, y: 0 },
    isVisible: false,
  });

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === "") {
      setSelectionState((prev) => ({ ...prev, isVisible: false }));
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText.length < 2) {
      setSelectionState((prev) => ({ ...prev, isVisible: false }));
      return;
    }

    // Get the position of the selection
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setSelectionState({
      selectedText,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      },
      isVisible: true,
    });
  }, []);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    // Don't close if clicking on the popover itself
    const target = event.target as Element;
    if (target.closest("[data-text-selection-popover]")) {
      return;
    }

    setSelectionState((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectionState((prev) => ({ ...prev, isVisible: false }));
    window.getSelection()?.removeAllRanges();
  }, []);

  useEffect(() => {
    // Add event listeners
    document.addEventListener("mouseup", handleTextSelection);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mouseup", handleTextSelection);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleTextSelection, handleClickOutside]);

  return {
    ...selectionState,
    clearSelection,
  };
};
