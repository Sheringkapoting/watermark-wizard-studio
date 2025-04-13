
import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { Watermark } from "@/types/watermark";

export const useImageProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const processImage = useCallback(async (
    sourceImage: string | null, 
    watermarks: Watermark[], 
    sourceImageDimensions: {width: number, height: number} | null,
    sourceImageType: string,
    previewContainerRef: React.RefObject<HTMLDivElement>
  ) => {
    if (!sourceImage || watermarks.length === 0 || !sourceImageDimensions) {
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
      // First, we need to get the reference size from the preview container
      const previewContainer = previewContainerRef.current;
      if (!previewContainer) {
        throw new Error("Preview container reference not found");
      }
      
      const previewWidth = previewContainer.clientWidth;
      const previewHeight = previewContainer.clientHeight;
      
      // Get the preview scale factor (how much the original image is scaled in the preview)
      const previewScaleFactor = Math.min(
        previewWidth / sourceImageDimensions.width,
        previewHeight / sourceImageDimensions.height
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
        sourceImg.src = sourceImage;
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
      const dataURL = canvas.toDataURL(sourceImageType, 0.9);
      setResultImage(dataURL);
      
      toast({
        title: "Processing Complete",
        description: "Watermarks have been applied successfully.",
      });
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Processing Error",
        description: "An error occurred while processing the image.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    resultImage,
    setResultImage,
    isProcessing,
    processImage
  };
};
