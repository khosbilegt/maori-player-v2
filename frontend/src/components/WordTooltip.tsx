import React, { useRef } from "react";
import type { VocabEntry } from "../utils/vocabLoader";

interface WordTooltipProps {
  vocabEntry: VocabEntry;
  children: React.ReactNode;
}

const WordTooltip: React.FC<WordTooltipProps> = ({ vocabEntry, children }) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  return (
    <span className="word-tooltip-container" ref={containerRef}>
      {children}
      <div className={`word-tooltip-popup`} ref={tooltipRef}>
        <div className="word-tooltip-content">
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "space-between",
            }}
          >
            <div className="word-tooltip-word">{vocabEntry.maori}</div>
            <button className="word-tooltip-pronunciation">+</button>
          </div>
          <div className="word-tooltip-english">{vocabEntry.english}</div>
          {vocabEntry.description && (
            <div className="word-tooltip-description">
              {vocabEntry.description}
            </div>
          )}
        </div>
        <div className="word-tooltip-arrow"></div>
      </div>
    </span>
  );
};

export default WordTooltip;
