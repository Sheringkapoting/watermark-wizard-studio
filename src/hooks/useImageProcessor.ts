
import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { Watermark } from "@/types/watermark";
import type { SourceImage } from "@/hooks/useImageUploader";

export interface ProcessedImage {
  sourceId: string;
  resultSrc: string;
}

export const useImageProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [activeResultIndex, setActiveResultIndex] = useState<number>(0);

  const getResultImage = (): string | null => {
    return processedImages.length > 0 ? processedImages[activeResultIndex].resultSrc : null;
  };

  const setActiveResult = (index: number) => {
    if (index >= 0 && index < processedImages.length) {
      setActiveResultIndex(index);
    }
  };

  const processImage = useCallback(async (
    sourceImage: SourceImage | null, 
    watermarks: Watermark[], 
    previewContainerRef: React.RefObject<HTMLDivElement>
  ) => {
    if (!sourceImage || watermarks.length === 0 || !sourceImage.dimensions) {
      toast({
        title: "Missing Images",
        description: watermarks.length === 0 
          ? "Please add at least one watermark." 
          : "Please upload both source image and at least one watermark.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Get the reference size from the preview container
      const previewContainer = previewContainerRef.current;
      if (!previewContainer) {
        throw new Error("Preview container reference not found");
      }
      
      const previewWidth = previewContainer.clientWidth;
      const previewHeight = previewContainer.clientHeight;
      
      // Get the preview scale factor (how much the original image is scaled in the preview)
      const previewScaleFactor = Math.min(
        previewWidth / sourceImage.dimensions.width,
        previewHeight / sourceImage.dimensions.height
      );
      
      // Load all watermark images
      const watermarkData = await Promise.all(
        watermarks.map(async (watermark) => {
          // Load the watermark image
          const img = new Image();
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error(`Failed to load watermark: ${watermark.id}`));
            img.src = watermark.src;
          });
          
          return {
            img,
            watermark
          };
        })
      );
      
      // Load the source image
      const sourceImg = new Image();
      await new Promise<void>((resolve) => {
        sourceImg.onload = () => resolve();
        sourceImg.src = sourceImage.src;
      });
      
      // Create the main canvas
      const canvas = document.createElement('canvas');
      canvas.width = sourceImg.width;
      canvas.height = sourceImg.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }
      
      // Draw the source image
      ctx.drawImage(sourceImg, 0, 0);
      
      // Apply each watermark, adjusting for the scale difference between preview and final
      for (const { img, watermark } of watermarkData) {
        // Calculate position in pixels
        const posX = canvas.width * watermark.position.x;
        const posY = canvas.height * watermark.position.y;
        
        // Adjust the watermark scale to account for the difference 
        // between preview size and actual image size
        const adjustedScale = watermark.scale / previewScaleFactor;
        
        // Calculate scaled dimensions using the adjusted scale
        const scaledWidth = img.width * adjustedScale;
        const scaledHeight = img.height * adjustedScale;
        
        // Set opacity
        ctx.globalAlpha = watermark.opacity;
        
        // Save the current context state
        ctx.save();
        
        // Move to the designated position
        ctx.translate(posX, posY);
        
        // Apply rotation
        ctx.rotate(watermark.rotation * Math.PI / 180);
        
        // Draw the watermark centered at the origin
        ctx.drawImage(
          img, 
          -scaledWidth / 2, 
          -scaledHeight / 2,
          scaledWidth,
          scaledHeight
        );
        
        // Restore context state
        ctx.restore();
      }
      
      // Reset opacity
      ctx.globalAlpha = 1.0;
      
      // Generate the result image
      const dataURL = canvas.toDataURL(sourceImage.type, 0.9);
      
      // Update the processed images
      setProcessedImages(prev => {
        // Check if this image was already processed
        const existingIndex = prev.findIndex(img => img.sourceId === sourceImage.id);
        if (existingIndex >= 0) {
          // Update existing processed image
          const updated = [...prev];
          updated[existingIndex] = { sourceId: sourceImage.id, resultSrc: dataURL };
          return updated;
        } else {
          // Add new processed image
          return [...prev, { sourceId: sourceImage.id, resultSrc: dataURL }];
        }
      });
      
      // Set active result index to match this image
      const newIndex = processedImages.findIndex(img => img.sourceId === sourceImage.id);
      if (newIndex >= 0) {
        setActiveResultIndex(newIndex);
      } else {
        setActiveResultIndex(processedImages.length);
      }
      
      toast({
        title: "Processing Complete",
        description: "Watermarks have been applied successfully.",
      });
      
      return dataURL;
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Processing Error",
        description: "An error occurred while processing the image.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [processedImages]);

  const processAllImages = useCallback(async (
    sourceImages: SourceImage[], 
    getWatermarksForImage: (sourceImage: SourceImage) => Watermark[],
    previewContainerRef: React.RefObject<HTMLDivElement>
  ) => {
    if (sourceImages.length === 0) {
      toast({
        title: "Missing Images",
        description: "Please add at least one source image.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const results: ProcessedImage[] = [];
      
      for (const sourceImage of sourceImages) {
        // Get watermarks specific to this image
        const imageWatermarks = getWatermarksForImage(sourceImage);
        
        if (imageWatermarks.length === 0) {
          // Skip images without watermarks
          continue;
        }
        
        const resultSrc = await processImage(sourceImage, imageWatermarks, previewContainerRef);
        if (resultSrc) {
          results.push({ sourceId: sourceImage.id, resultSrc });
        }
      }
      
      if (results.length === 0) {
        toast({
          title: "No Images Processed",
          description: "None of the images had watermarks applied to them.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Batch Processing Complete",
          description: `Applied watermarks to ${results.length} of ${sourceImages.length} images.`,
        });
      }
    } catch (error) {
      console.error('Error processing images:', error);
      toast({
        title: "Batch Processing Error",
        description: "An error occurred while processing the images.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [processImage]);

  return {
    processedImages,
    activeResultIndex,
    getResultImage,
    setActiveResult,
    isProcessing,
    processImage,
    processAllImages
  };
};
