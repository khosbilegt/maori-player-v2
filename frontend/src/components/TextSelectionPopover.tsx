import React, { useEffect, useRef } from "react";
import "./TextSelectionPopover.css";

interface TextSelectionPopoverProps {
  selectedText: string;
  position: { x: number; y: number };
  onClose: () => void;
  onAddToLearnList: (text: string) => void;
}

const TextSelectionPopover: React.FC<TextSelectionPopoverProps> = ({
  selectedText,
  position,
  onClose,
  onAddToLearnList,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleAddToLearnList = () => {
    onAddToLearnList(selectedText);
    onClose();
  };

  return (
    <div
      ref={popoverRef}
      className="text-selection-popover"
      style={{
        left: Math.max(10, Math.min(position.x, window.innerWidth - 320)),
        top: Math.max(10, position.y),
        transform: "translateX(-50%)",
      }}
    >
      <div className="popover-content">
        <div className="selected-text-preview">
          "
          {selectedText.length > 50
            ? `${selectedText.substring(0, 50)}...`
            : selectedText}
          "
        </div>
        <div className="popover-actions">
          <button
            className="action-button add-to-learn"
            onClick={handleAddToLearnList}
            title="Add to learn list"
          >
            📚 Add to Learn List
          </button>
        </div>
      </div>
      <div className="popover-arrow"></div>
    </div>
  );
};

export default TextSelectionPopover;
