
import { useState } from "react";

export interface SourceImage {
  id: string;
  src: string;
  name: string;
  type: string;
  dimensions: { width: number; height: number } | null;
}

export const useImageUploader = () => {
  const [sourceImages, setSourceImages] = useState<SourceImage[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const getActiveImage = (): SourceImage | null => {
    return sourceImages.length > 0 ? sourceImages[activeImageIndex] : null;
  };

  const loadSourceImage = (src: string) => {
    return new Promise<{width: number, height: number}>((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({width: img.width, height: img.height});
      };
      img.src = src;
    });
  };

  const handleSourceImageUpload = async (imageSrc: string, fileName: string, fileType: string) => {
    const dimensions = await loadSourceImage(imageSrc);
    
    const newImage: SourceImage = {
      id: `image-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      src: imageSrc,
      name: fileName,
      type: fileType,
      dimensions
    };
    
    setSourceImages(prev => [...prev, newImage]);
    setActiveImageIndex(sourceImages.length); // Set the newly added image as active
  };

  const removeImage = (id: string) => {
    const indexToRemove = sourceImages.findIndex(img => img.id === id);
    if (indexToRemove === -1) return;
    
    setSourceImages(prev => prev.filter((_, index) => index !== indexToRemove));
    
    // Adjust active index if necessary
    if (activeImageIndex >= sourceImages.length - 1) {
      setActiveImageIndex(Math.max(0, sourceImages.length - 2));
    } else if (activeImageIndex === indexToRemove) {
      setActiveImageIndex(Math.max(0, activeImageIndex - 1));
    }
  };

  const setActiveImage = (index: number) => {
    if (index >= 0 && index < sourceImages.length) {
      setActiveImageIndex(index);
    }
  };

  const resetImages = () => {
    setSourceImages([]);
    setActiveImageIndex(0);
  };

  return {
    sourceImages,
    activeImageIndex,
    getActiveImage,
    handleSourceImageUpload,
    removeImage,
    setActiveImage,
    resetImages
  };
};
