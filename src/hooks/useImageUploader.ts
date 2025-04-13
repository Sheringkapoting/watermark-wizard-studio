
import { useState } from "react";

export const useImageUploader = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceImageName, setSourceImageName] = useState<string>("image");
  const [sourceImageType, setSourceImageType] = useState<string>("image/jpeg");
  const [sourceImageDimensions, setSourceImageDimensions] = useState<{width: number, height: number} | null>(null);

  const loadSourceImage = (src: string) => {
    return new Promise<{width: number, height: number}>((resolve) => {
      const img = new Image();
      img.onload = () => {
        setSourceImageDimensions({width: img.width, height: img.height});
        resolve({width: img.width, height: img.height});
      };
      img.src = src;
    });
  };

  const handleSourceImageUpload = async (imageSrc: string, fileName: string, fileType: string) => {
    setSourceImage(imageSrc);
    
    setSourceImageName(fileName);
    setSourceImageType(fileType);
    
    await loadSourceImage(imageSrc);
  };

  const resetImage = () => {
    setSourceImage(null);
    setSourceImageDimensions(null);
  };

  return {
    sourceImage,
    sourceImageName,
    sourceImageType,
    sourceImageDimensions,
    handleSourceImageUpload,
    resetImage
  };
};
