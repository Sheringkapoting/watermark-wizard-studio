
import React from "react";
import { Watermark } from "@/types/watermark";

interface WatermarkImageProps {
  watermark: Watermark;
  onDragStart: (id: string, e: React.MouseEvent<HTMLImageElement> | React.TouchEvent<HTMLImageElement>) => void;
}

export const WatermarkImage = ({ watermark, onDragStart }: WatermarkImageProps) => {
  return (
    <img
      key={watermark.id}
      src={watermark.src}
      alt={`Watermark ${watermark.id}`}
      className="absolute pointer-events-auto cursor-move"
      style={{
        opacity: watermark.opacity,
        transform: `translate(-50%, -50%) scale(${watermark.scale}) rotate(${watermark.rotation}deg)`,
        left: `${watermark.position.x * 100}%`,
        top: `${watermark.position.y * 100}%`,
        maxWidth: "100%",
        maxHeight: "100%",
        touchAction: "none",
        zIndex: 10,
      }}
      onMouseDown={(e) => onDragStart(watermark.id, e)}
      onTouchStart={(e) => onDragStart(watermark.id, e)}
    />
  );
};
