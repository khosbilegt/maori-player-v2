import React from "react";
import { SubtitleControlsProps } from "./types";

const SubtitleControls: React.FC<SubtitleControlsProps> = ({
  onSizeChange,
  className = "",
  videoRef,
}) => {
  const handleSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseFloat(event.target.value);
    onSizeChange(size);
  };

  return (
    <div className={`absolute top-4 right-4 z-20 ${className}`}>
      <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-white/20">
        <label className="block text-white text-sm mb-2 font-medium">
          Subtitle Size
        </label>
        <input
          type="range"
          min="0.8"
          max="2.0"
          step="0.1"
          defaultValue="1.1"
          onChange={handleSizeChange}
          className="w-24 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 55%, #374151 55%, #374151 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Small</span>
          <span>Large</span>
        </div>
      </div>
    </div>
  );
};

export default SubtitleControls;
