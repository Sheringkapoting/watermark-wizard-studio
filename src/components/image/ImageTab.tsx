
import React, { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWatermarkManager } from "@/hooks/useWatermarkManager";
import { useImageProcessor } from "@/hooks/useImageProcessor";
import { useImageUploader } from "@/hooks/useImageUploader";
import { useDragManager } from "@/hooks/useDragManager";
import { useImageDownloader } from "@/hooks/useImageDownloader";

import { ImageUploader } from "@/components/watermark/ImageUploader";
import { ImageEditor } from "@/components/watermark/ImageEditor";
import { ResultPreview } from "@/components/watermark/ResultPreview";
import { WatermarkList } from "@/components/watermark/WatermarkList";
import { Instructions } from "@/components/watermark/Instructions";
import { DownloadDialog } from "@/components/watermark/DownloadDialog";

export const ImageTab = () => {
  const isMobile = useIsMobile();
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  // Custom hooks
  const {
    sourceImages,
    activeImageIndex,
    getActiveImage,
    handleSourceImageUpload,
    removeImage,
    setActiveImage,
    resetImages
  } = useImageUploader();
  
  const {
    watermarks,
    addWatermark,
    removeWatermark,
    updateWatermark,
    updateDraggingState
  } = useWatermarkManager();
  
  const {
    processedImages,
    activeResultIndex,
    getResultImage,
    setActiveResult,
    isProcessing,
    processImage,
    processAllImages
  } = useImageProcessor();
  
  const {
    downloadDialogOpen,
    setDownloadDialogOpen,
    downloadFilename,
    setDownloadFilename,
    selectedFormat,
    setSelectedFormat,
    imageQuality,
    setImageQuality,
    imageFormats,
    handleDownload,
    processDownload
  } = useImageDownloader(
    getActiveImage()?.name || "", 
    getActiveImage()?.type || ""
  );
  
  const {
    handleDragStart,
    handleDrag,
    handleDragEnd
  } = useDragManager(updateDraggingState, updateWatermark, imageContainerRef);

  // Update download filename when active image changes
  useEffect(() => {
    const activeImage = getActiveImage();
    if (activeImage?.name) {
      setDownloadFilename(activeImage.name);
    }
  }, [activeImageIndex, getActiveImage, setDownloadFilename]);

  // Set up event listeners for drag operations
  useEffect(() => {
    const isDragging = watermarks.some(watermark => watermark.isDragging);
    
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('touchmove', handleDrag, { passive: false });
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchend', handleDragEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('touchmove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [watermarks, handleDrag, handleDragEnd]);

  // Handle watermark image upload
  const handleWatermarkImageUpload = (src: string) => {
    addWatermark(src);
  };

  // Process the active image with watermarks
  const handleProcessImage = () => {
    const activeImage = getActiveImage();
    if (activeImage) {
      processImage(
        activeImage, 
        watermarks, 
        imageContainerRef
      );
    }
  };

  // Process all images with the same watermarks
  const handleProcessAllImages = () => {
    processAllImages(
      sourceImages,
      watermarks,
      imageContainerRef
    );
  };

  // Handle download button click
  const handleDownloadClick = () => {
    const resultImage = getResultImage();
    handleDownload(resultImage);
  };

  // Process the download
  const handleProcessDownload = () => {
    const resultImage = getResultImage();
    processDownload(resultImage);
  };

  return (
    <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-[1fr_380px] gap-8'}`}>
      <div className="flex flex-col gap-4">
        <Card className="p-6 flex flex-col items-center justify-center">
          {sourceImages.length === 0 ? (
            <ImageUploader 
              id="source-image-upload"
              onUpload={handleSourceImageUpload}
              buttonText="Select Image"
              description="Upload an image to add a watermark"
            />
          ) : (
            <ImageEditor 
              sourceImages={sourceImages}
              activeImageIndex={activeImageIndex}
              watermarks={watermarks}
              onDragStart={handleDragStart}
              onChangeImage={() => document.getElementById("source-image-upload-additional")?.click()}
              onProcessImage={handleProcessImage}
              onProcessAllImages={handleProcessAllImages}
              onRemoveImage={removeImage}
              onSelectImage={setActiveImage}
              onDownload={handleDownloadClick}
              resultImage={getResultImage()}
              isProcessing={isProcessing}
              imageContainerRef={imageContainerRef}
            />
          )}
        </Card>
        
        {sourceImages.length > 0 && (
          <div className="hidden">
            <ImageUploader 
              id="source-image-upload-additional"
              onUpload={handleSourceImageUpload}
              buttonText="Add Another Image"
              description="Upload additional images"
            />
          </div>
        )}
        
        {getResultImage() && (
          <Card className="p-6">
            <ResultPreview 
              resultImage={getResultImage()} 
              onDownload={handleDownloadClick} 
            />
          </Card>
        )}
      </div>
      
      <div className="flex flex-col gap-4">
        <Card className="p-6">
          <WatermarkList 
            watermarks={watermarks}
            onWatermarkUpload={handleWatermarkImageUpload}
            onWatermarkRemove={removeWatermark}
            onWatermarkUpdate={updateWatermark}
          />
        </Card>
        
        <Card className="p-6">
          <Instructions />
        </Card>
      </div>
      
      <DownloadDialog
        open={downloadDialogOpen}
        onOpenChange={setDownloadDialogOpen}
        filename={downloadFilename}
        onFilenameChange={setDownloadFilename}
        selectedFormat={selectedFormat}
        onFormatChange={setSelectedFormat}
        imageQuality={imageQuality}
        onQualityChange={setImageQuality}
        onDownload={handleProcessDownload}
        imageFormats={imageFormats}
      />
    </div>
  );
};
