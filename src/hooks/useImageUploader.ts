
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

  const updateImage = async (imageId: string, newImageSrc: string) => {
    const imageToUpdate = sourceImages.find(img => img.id === imageId);
    if (!imageToUpdate) return;
    
    const dimensions = await loadSourceImage(newImageSrc);
    
    setSourceImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, src: newImageSrc, dimensions } 
        : img
    ));
  };

  const handleMultipleSourceImagesUpload = async (files: { src: string, name: string, type: string }[]) => {
    if (files.length === 0) return;
    
    const newImages: SourceImage[] = [];
    
    for (const file of files) {
      const dimensions = await loadSourceImage(file.src);
      
      const newImage: SourceImage = {
        id: `image-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        src: file.src,
        name: file.name,
        type: file.type,
        dimensions
      };
      
      newImages.push(newImage);
    }
    
    setSourceImages(prev => [...prev, ...newImages]);
    
    if (sourceImages.length === 0 && newImages.length > 0) {
      setActiveImageIndex(0); // Set the first new image as active if no images existed before
    }
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
    handleMultipleSourceImagesUpload,
    removeImage,
    setActiveImage,
    updateImage,
    resetImages
  };
};
