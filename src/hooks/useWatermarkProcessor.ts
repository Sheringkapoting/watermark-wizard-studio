
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { 
  WatermarkConfig, 
  WatermarkedImage, 
  applyWatermark,
  createWatermarkPreview,
} from '@/utils/imageProcessing';

export function useWatermarkProcessor() {
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

  return {
    images,
    watermarkConfig,
    isProcessing,
    handleImagesSelected,
    handleWatermarkChange,
    handleImageConfigChange,
    setImages
  };
}
