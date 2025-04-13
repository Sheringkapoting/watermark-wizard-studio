
import React from "react";
import { Watermark } from "@/types/watermark";

interface WatermarkImageProps {
  watermark: Watermark;
  onDragStart: (id: string, e: React.MouseEvent<HTMLImageElement> | React.TouchEvent<HTMLImageElement>) => void;
}

export const WatermarkImage = ({ watermark, onDragStart }: WatermarkImageProps) => {
  return (
    <div 
      className="absolute pointer-events-auto"
      style={{
        left: `${watermark.position.x * 100}%`,
        top: `${watermark.position.y * 100}%`,
        transform: `translate(-50%, -50%)`,
        zIndex: 10,
        // This container helps with consistent positioning
        transformOrigin: "center center"
      }}
    >
      <img
        src={watermark.src}
        alt={`Watermark ${watermark.id}`}
        className="cursor-move select-none"
        style={{
          opacity: watermark.opacity,
          transform: `scale(${watermark.scale}) rotate(${watermark.rotation}deg)`,
          maxWidth: "100%",
          maxHeight: "100%",
          touchAction: "none",
          // Add a subtle indicator for draggable items
          boxShadow: watermark.isDragging ? "0 0 0 2px rgba(59, 130, 246, 0.5)" : "none",
          transition: "box-shadow 0.2s ease"
        }}
        onMouseDown={(e) => onDragStart(watermark.id, e)}
        onTouchStart={(e) => onDragStart(watermark.id, e)}
        draggable="false" // Prevent default dragging behavior
      />
    </div>
  );
};
