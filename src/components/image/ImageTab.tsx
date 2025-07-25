import React, { useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWatermarkManager } from "@/hooks/useWatermarkManager";
import { useImageProcessor } from "@/hooks/useImageProcessor";
import { useImageUploader } from "@/hooks/useImageUploader";
import { useDragManager } from "@/hooks/useDragManager";
import { useImageDownloader } from "@/hooks/useImageDownloader";

import { ImageEditorSection } from "./ImageEditorSection";
import { WatermarkSection } from "./WatermarkSection";
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
    handleMultipleSourceImagesUpload,
    removeImage,
    setActiveImage,
    updateImage,
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
      <ImageEditorSection
        sourceImages={sourceImages}
        activeImageIndex={activeImageIndex}
        watermarks={watermarks}
        onDragStart={handleDragStart}
        onSourceImageUpload={handleSourceImageUpload}
        onMultipleSourceImagesUpload={handleMultipleSourceImagesUpload}
        onProcessImage={handleProcessImage}
        onProcessAllImages={handleProcessAllImages}
        onRemoveImage={removeImage}
        onSelectImage={setActiveImage}
        onDownload={handleDownloadClick}
        onUpdateImage={updateImage}
        resultImage={getResultImage()}
        isProcessing={isProcessing}
        imageContainerRef={imageContainerRef}
      />
      
      <WatermarkSection
        watermarks={watermarks}
        onWatermarkUpload={handleWatermarkImageUpload}
        onWatermarkRemove={removeWatermark}
        onWatermarkUpdate={updateWatermark}
      />
      
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
