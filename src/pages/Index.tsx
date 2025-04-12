
import React, { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ImageUploader from '@/components/ImageUploader';
import WatermarkControls from '@/components/WatermarkControls';
import ImagePreview from '@/components/ImagePreview';
import { 
  WatermarkConfig, 
  WatermarkedImage, 
  applyWatermark,
  generateZip,
  createWatermarkPreview,
  DEFAULT_WATERMARK_OPTIONS
} from '@/utils/imageProcessing';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const Index: React.FC = () => {
  const [images, setImages] = useState<WatermarkedImage[]>([]);
  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Function to handle newly selected images
  const handleImagesSelected = useCallback((files: File[]) => {
    const newImages = files.map(file => ({
      id: uuidv4(),
      originalFile: file,
      originalUrl: URL.createObjectURL(file),
      watermarkedUrl: null,
      isProcessing: false
    }));
    
    setImages(prev => [...prev, ...newImages]);
    toast.success(`Added ${files.length} image${files.length > 1 ? 's' : ''}`);
  }, []);

  // Apply watermark to all images
  const processImages = useCallback(async () => {
    if (!watermarkConfig || images.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      // Update all images to processing state
      setImages(prev => 
        prev.map(img => ({ ...img, isProcessing: true }))
      );
      
      // Process each image
      const updatedImages = [...images];
      const watermarkPreview = await createWatermarkPreview(watermarkConfig);
      
      for (let i = 0; i < updatedImages.length; i++) {
        const image = updatedImages[i];
        
        try {
          const img = new Image();
          img.src = image.originalUrl;
          
          // Wait for image to load
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          
          // Apply watermark with image-specific config if available
          const configToApply = image.customWatermarkConfig || watermarkConfig;
          const watermarkedUrl = await applyWatermark(img, configToApply);
          
          // Update image
          updatedImages[i] = {
            ...image,
            watermarkedUrl,
            watermarkPreview,
            isProcessing: false,
            customWatermarkConfig: image.customWatermarkConfig || { ...watermarkConfig }
          };
          
          // Update state with progress
          setImages([...updatedImages]);
        } catch (error) {
          console.error('Error processing image:', error);
          
          // Mark this image as failed
          updatedImages[i] = {
            ...image,
            isProcessing: false
          };
          
          // Show error
          toast.error(`Failed to process image: ${image.originalFile.name}`);
        }
      }
      
      toast.success('All images processed successfully');
    } catch (error) {
      console.error('Error in batch processing:', error);
      toast.error('An error occurred while processing images');
    } finally {
      setIsProcessing(false);
    }
  }, [images, watermarkConfig]);

  // Effect to process images when watermarkConfig changes
  useEffect(() => {
    if (watermarkConfig && images.length > 0) {
      processImages();
    }
  }, [watermarkConfig, processImages]);

  // Handle watermark configuration changes
  const handleWatermarkChange = useCallback((config: WatermarkConfig) => {
    setWatermarkConfig(config);
  }, []);

  // Handle individual image watermark config changes
  const handleImageConfigChange = useCallback((imageId: string, config: WatermarkConfig) => {
    setImages(prev => 
      prev.map(img => 
        img.id === imageId 
          ? { ...img, customWatermarkConfig: config } 
          : img
      )
    );
    
    // Reprocess the specific image with the new config
    setImages(prev => {
      const updatedImages = [...prev];
      const imageIndex = updatedImages.findIndex(img => img.id === imageId);
      
      if (imageIndex >= 0) {
        updatedImages[imageIndex] = {
          ...updatedImages[imageIndex],
          isProcessing: true
        };
      }
      
      return updatedImages;
    });
    
    // Process the image with its new configuration
    (async () => {
      try {
        const image = images.find(img => img.id === imageId);
        if (!image) return;
        
        const img = new Image();
        img.src = image.originalUrl;
        
        // Wait for image to load
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        
        // Apply watermark with the new config
        const watermarkedUrl = await applyWatermark(img, config);
        
        // Update just this image
        setImages(prev => 
          prev.map(img => 
            img.id === imageId 
              ? { 
                  ...img, 
                  watermarkedUrl, 
                  customWatermarkConfig: config,
                  isProcessing: false 
                } 
              : img
          )
        );
      } catch (error) {
        console.error('Error updating image watermark:', error);
        
        // Mark as failed but not processing
        setImages(prev => 
          prev.map(img => 
            img.id === imageId 
              ? { ...img, isProcessing: false } 
              : img
          )
        );
        
        toast.error('Failed to update watermark position');
      }
    })();
  }, [images]);

  // Delete an image
  const handleDeleteImage = useCallback((id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      if (filtered.length === 0) {
        toast.info('All images removed');
      }
      return filtered;
    });
  }, []);

  // Download a single watermarked image
  const handleDownloadImage = useCallback((image: WatermarkedImage) => {
    if (!image.watermarkedUrl) return;
    
    const link = document.createElement('a');
    link.href = image.watermarkedUrl;
    link.download = `watermarked_${image.originalFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Image downloaded successfully');
  }, []);

  // Download all watermarked images
  const handleDownloadAll = useCallback(async () => {
    if (images.length === 0 || !images.some(img => img.watermarkedUrl)) return;
    
    // For a single image, just download it directly
    if (images.length === 1 && images[0].watermarkedUrl) {
      handleDownloadImage(images[0]);
      return;
    }
    
    setIsProcessing(true);
    toast.info('Preparing download...');
    
    try {
      // In a real implementation, we would use JSZip to create a ZIP file
      // But for this prototype, we'll just simulate it
      const zipUrl = await generateZip(images);
      
      // Check if any images failed
      const failedImages = images.filter(img => !img.watermarkedUrl).length;
      if (failedImages > 0) {
        toast.warning(`${failedImages} image(s) could not be processed and will not be included in the download`);
      }
      
      if (images.filter(img => img.watermarkedUrl).length > 0) {
        toast.success(`${images.filter(img => img.watermarkedUrl).length} images prepared for download`);
      }
    } catch (error) {
      console.error('Error generating ZIP:', error);
      toast.error('Failed to prepare images for download');
    } finally {
      setIsProcessing(false);
    }
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
              watermarkConfig={watermarkConfig}
              onImageConfigChange={handleImageConfigChange}
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
        
        {isProcessing && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-4">
              <Loader2 className="h-8 w-8 text-watermark-blue animate-spin" />
              <p className="text-lg font-medium">Processing images...</p>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
