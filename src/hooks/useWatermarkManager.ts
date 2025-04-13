
import { useState } from "react";
import { Watermark } from "@/types/watermark";

export const useWatermarkManager = () => {
  const [watermarks, setWatermarks] = useState<Watermark[]>([]);

  const addWatermark = (src: string, sourceImageId?: string) => {
    const newWatermark: Watermark = {
      id: `watermark-${Date.now()}`,
      src: src,
      opacity: 1.0,
      scale: 0.5,
      position: { x: 0.5, y: 0.5 },
      rotation: 0,
      isDragging: false,
      sourceImageId // Associate with a specific source image if provided
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

  // Get watermarks associated with a specific source image or all watermarks if sourceImageId is not provided
  const getWatermarksForImage = (sourceImageId?: string) => {
    if (!sourceImageId) return watermarks;
    return watermarks.filter(watermark => !watermark.sourceImageId || watermark.sourceImageId === sourceImageId);
  };

  // Clone watermarks from one image to another
  const cloneWatermarksToImage = (fromImageId: string, toImageId: string) => {
    const sourceWatermarks = watermarks.filter(w => w.sourceImageId === fromImageId);
    
    const newWatermarks = sourceWatermarks.map(watermark => ({
      ...watermark,
      id: `watermark-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      sourceImageId: toImageId
    }));
    
    setWatermarks(prev => [...prev, ...newWatermarks]);
  };

  return {
    watermarks,
    addWatermark,
    removeWatermark,
    updateWatermark,
    updateDraggingState,
    getWatermarksForImage,
    cloneWatermarksToImage
  };
};
