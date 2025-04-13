import React from "react";
import { Watermark } from "@/types/watermark";

interface WatermarkImageProps {
  watermark: Watermark;
  onDragStart: (id: string, e: React.MouseEvent<HTMLImageElement> | React.TouchEvent<HTMLImageElement>) => void;
}

export const WatermarkImage = ({ watermark, onDragStart }: WatermarkImageProps) => {
  return (
    <div 
      className="absolute pointer-events-auto cursor-move"
      style={{
        left: `${watermark.position.x * 100}%`,
        top: `${watermark.position.y * 100}%`,
        transform: 'translate(-50%, -50%)',
        touchAction: "none",
        zIndex: 10,
        boxShadow: watermark.isDragging ? "0 0 0 2px rgba(59, 130, 246, 0.5)" : "none",
        transition: "box-shadow 0.2s ease"
      }}
    >
      <img
        src={watermark.src}
        alt={`Watermark ${watermark.id}`}
        style={{
          opacity: watermark.opacity,
          transform: `scale(${watermark.scale}) rotate(${watermark.rotation}deg)`,
          maxWidth: "100%",
          maxHeight: "100%",
          transformOrigin: "center center",
          pointerEvents: "none"
        }}
        draggable="false" // Prevent default dragging behavior
      />
      <div 
        className="absolute inset-0"
        onMouseDown={(e) => onDragStart(watermark.id, e)}
        onTouchStart={(e) => onDragStart(watermark.id, e)}
      />
    </div>
  );
};