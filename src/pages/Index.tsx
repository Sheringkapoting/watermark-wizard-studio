
import React, { useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ImageUploader from '@/components/ImageUploader';
import WatermarkControls from '@/components/WatermarkControls';
import ImagePreview from '@/components/ImagePreview';
import LoadingOverlay from '@/components/LoadingOverlay';
import { useWatermarkProcessor } from '@/hooks/useWatermarkProcessor';
import { deleteImage, downloadImage, downloadAllImages } from '@/utils/imageActions';
import { WatermarkedImage } from '@/utils/imageProcessing';

const Index: React.FC = () => {
  const {
    images,
    watermarkConfig,
    isProcessing,
    handleImagesSelected,
    handleWatermarkChange,
    handleSelectWatermark,
    handleUpdateWatermark,
    handleRemoveWatermark,
    applyWatermarkToAll,
    setImages
  } = useWatermarkProcessor();
  
  // Handle individual image deletion
  const handleDeleteImage = useCallback((id: string) => {
    deleteImage(id, images, setImages);
  }, [images, setImages]);

  // Download a single watermarked image
  const handleDownloadImage = useCallback((image: WatermarkedImage) => {
    downloadImage(image);
  }, []);

  // Download all watermarked images
  const handleDownloadAll = useCallback(async () => {
    const setProcessingState = (state: boolean) => {
      // This function is passed to downloadAllImages but won't actually be used
      // since the setIsProcessing function is managed inside the hook
    };
    
    await downloadAllImages(images, setProcessingState, handleDownloadImage);
  }, [images, handleDownloadImage]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ImageUploader 
              onImagesSelected={handleImagesSelected} 
              isProcessing={isProcessing}
            />
            
            <ImagePreview 
              images={images}
              onDeleteImage={handleDeleteImage}
              onDownloadImage={handleDownloadImage}
              onDownloadAll={handleDownloadAll}
              isProcessing={isProcessing}
              onSelectWatermark={handleSelectWatermark}
              onUpdateWatermark={handleUpdateWatermark}
              onRemoveWatermark={handleRemoveWatermark}
              onApplyWatermarkToAll={applyWatermarkToAll}
            />
          </div>
          
          <div className="lg:col-span-1">
            <WatermarkControls 
              onWatermarkChange={handleWatermarkChange}
              isProcessing={isProcessing}
              hasImages={images.length > 0}
            />
          </div>
        </div>
        
        <LoadingOverlay isVisible={isProcessing} />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
