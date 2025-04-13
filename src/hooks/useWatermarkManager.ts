
import { useState } from "react";
import { Watermark } from "@/types/watermark";

export const useWatermarkManager = () => {
  const [watermarks, setWatermarks] = useState<Watermark[]>([]);

  const addWatermark = (src: string) => {
    const newWatermark: Watermark = {
      id: `watermark-${Date.now()}`,
      src: src,
      opacity: 1.0,
      scale: 0.5,
      position: { x: 0.5, y: 0.5 },
      rotation: 0,
      isDragging: false
    };
    
    setWatermarks(prevWatermarks => [...prevWatermarks, newWatermark]);
  };

  const removeWatermark = (id: string) => {
    setWatermarks(prevWatermarks => prevWatermarks.filter(watermark => watermark.id !== id));
  };

  const updateWatermark = (id: string, update: Partial<Watermark>) => {
    setWatermarks(prevWatermarks => 
      prevWatermarks.map(watermark => 
        watermark.id === id ? { ...watermark, ...update } : watermark
      )
    );
  };

  const updateDraggingState = (id: string, isDragging: boolean) => {
    setWatermarks(prevWatermarks => 
      prevWatermarks.map(watermark => 
        watermark.id === id ? { ...watermark, isDragging } : watermark
      )
    );
  };

  return {
    watermarks,
    addWatermark,
    removeWatermark,
    updateWatermark,
    updateDraggingState
  };
};
