
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
    sourceImage,
    sourceImageName,
    sourceImageType,
    sourceImageDimensions,
    handleSourceImageUpload,
    resetImage
  } = useImageUploader();
  
  const {
    watermarks,
    addWatermark,
    removeWatermark,
    updateWatermark,
    updateDraggingState
  } = useWatermarkManager();
  
  const {
    resultImage,
    setResultImage,
    isProcessing,
    processImage
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
  } = useImageDownloader(sourceImageName, sourceImageType);
  
  const {
    handleDragStart,
    handleDrag,
    handleDragEnd
  } = useDragManager(updateDraggingState, updateWatermark, imageContainerRef);

  // Update download filename when source image name changes
  useEffect(() => {
    if (sourceImageName) {
      setDownloadFilename(sourceImageName);
    }
  }, [sourceImageName, setDownloadFilename]);

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
    setResultImage(null);
  };

  // Process the image with watermarks
  const handleProcessImage = () => {
    processImage(
      sourceImage, 
      watermarks, 
      sourceImageDimensions, 
      sourceImageType, 
      imageContainerRef
    );
  };

  // Reset all state
  const resetAll = () => {
    resetImage();
    setResultImage(null);
  };

  // Handle download button click
  const handleDownloadClick = () => {
    handleDownload(resultImage);
  };

  // Process the download
  const handleProcessDownload = () => {
    processDownload(resultImage);
  };

  return (
    <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-[1fr_380px] gap-8'}`}>
      <div className="flex flex-col gap-4">
        <Card className="p-6 flex flex-col items-center justify-center">
          {!sourceImage ? (
            <ImageUploader 
              id="source-image-upload"
              onUpload={handleSourceImageUpload}
              buttonText="Select Image"
              description="Upload an image to add a watermark"
            />
          ) : (
            <ImageEditor 
              sourceImage={sourceImage}
              watermarks={watermarks}
              onDragStart={handleDragStart}
              onChangeImage={resetAll}
              onProcessImage={handleProcessImage}
              onDownload={handleDownloadClick}
              resultImage={resultImage}
              isProcessing={isProcessing}
              imageContainerRef={imageContainerRef}
            />
          )}
        </Card>
        
        {resultImage && (
          <Card className="p-6">
            <ResultPreview 
              resultImage={resultImage} 
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
