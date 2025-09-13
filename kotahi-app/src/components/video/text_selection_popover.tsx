"use client";

import React, { useState, useEffect } from "react";
import { Plus, BookOpen } from "lucide-react";

interface TextSelectionPopoverProps {
  selectedText: string;
  position: { x: number; y: number };
  onAddToLearningList?: (text: string) => void;
  onAddToVocabulary?: (text: string) => void;
  onClose?: () => void;
}

const TextSelectionPopover: React.FC<TextSelectionPopoverProps> = ({
  selectedText,
  position,
  onAddToLearningList,
  onAddToVocabulary,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleAddToLearningList = () => {
    onAddToLearningList?.(selectedText);
    onClose?.();
  };

  const handleAddToVocabulary = () => {
    onAddToVocabulary?.(selectedText);
    onClose?.();
  };

  return (
    <div
      data-text-selection-popover
      className={`fixed z-[1000] bg-black/95 border border-white/20 rounded-xl shadow-2xl backdrop-blur-md p-0 min-w-[200px] max-w-[300px] transition-all duration-200 ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 -translate-y-2 scale-95"
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y - 10}px`,
      }}
    >
      <div className="p-3">
        <div className="text-slate-200 text-sm mb-3 p-2 bg-white/5 rounded-lg border-l-4 border-blue-500 leading-relaxed break-words">
          {selectedText}
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            className="flex items-center gap-1.5 px-3 py-2 border-0 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-800 text-white min-w-[140px] justify-center hover:from-blue-500 hover:to-blue-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 active:translate-y-0 active:shadow-md active:shadow-blue-500/30"
            onClick={handleAddToLearningList}
          >
            <BookOpen className="w-4 h-4" />
            Add to Learning List
          </button>

          <button
            className="flex items-center gap-1.5 px-3 py-2 border-0 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white min-w-[140px] justify-center hover:from-emerald-500 hover:to-emerald-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/30 active:translate-y-0 active:shadow-md active:shadow-emerald-500/30"
            onClick={handleAddToVocabulary}
          >
            <Plus className="w-4 h-4" />
            Add to Vocabulary
          </button>
        </div>
      </div>

      {/* Arrow pointing down */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
        <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-black/95"></div>
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-7 border-r-7 border-t-7 border-l-transparent border-r-transparent border-t-white/20"></div>
      </div>
    </div>
  );
};

export default TextSelectionPopover;
