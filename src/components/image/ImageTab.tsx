import React, { useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWatermarkManager } from "@/hooks/useWatermarkManager";
import { useImageProcessor } from "@/hooks/useImageProcessor";
import { useImageUploader } from "@/hooks/useImageUploader";
import { useImageDownloader } from "@/hooks/useImageDownloader";

import { ImageEditorSection } from "./ImageEditorSection";
import { WatermarkSection } from "./WatermarkSection";
import { DownloadDialog } from "@/components/watermark/DownloadDialog";

export const ImageTab = () => {
  const isMobile = useIsMobile();
  
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
    updateWatermark
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

  // Update download filename when active image changes
  useEffect(() => {
    const activeImage = getActiveImage();
    if (activeImage?.name) {
      setDownloadFilename(activeImage.name);
    }
  }, [activeImageIndex, getActiveImage, setDownloadFilename]);


  // Handle watermark image upload
  const handleWatermarkImageUpload = (src: string) => {
    addWatermark(src);
  };

  // Process the active image with watermarks
  const handleProcessImage = () => {
    const activeImage = getActiveImage();
    if (activeImage) {
      // Create a temporary container ref for compatibility
      const tempRef = { current: document.createElement('div') };
      tempRef.current.style.width = '800px';
      tempRef.current.style.height = '600px';
      
      processImage(
        activeImage, 
        watermarks,
        tempRef
      );
    }
  };

  // Process all images with the same watermarks
  const handleProcessAllImages = () => {
    // Create a temporary container ref for compatibility
    const tempRef = { current: document.createElement('div') };
    tempRef.current.style.width = '800px';
    tempRef.current.style.height = '600px';
    
    processAllImages(
      sourceImages,
      watermarks,
      tempRef
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
        onSourceImageUpload={handleSourceImageUpload}
        onMultipleSourceImagesUpload={handleMultipleSourceImagesUpload}
        onProcessImage={handleProcessImage}
        onProcessAllImages={handleProcessAllImages}
        onRemoveImage={removeImage}
        onSelectImage={setActiveImage}
        onDownload={handleDownloadClick}
        onUpdateImage={updateImage}
        onWatermarkUpdate={updateWatermark}
        resultImage={getResultImage()}
        isProcessing={isProcessing}
      />
      
      <WatermarkSection
        watermarks={watermarks}
        onWatermarkUpload={handleWatermarkImageUpload}
        onWatermarkRemove={removeWatermark}
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
