
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { 
  WatermarkConfig, 
  WatermarkedImage, 
  applyMultipleWatermarks,
  createWatermarkPreview,
  DEFAULT_WATERMARK_OPTIONS,
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
      isProcessing: false,
      watermarks: [],
      selectedWatermarkIndex: 0
    }));
    
    setImages(prev => [...prev, ...newImages]);
    toast.success(`Added ${files.length} image${files.length > 1 ? 's' : ''}`);
  }, []);

  // Add a new watermark to the config and all images
  const addWatermark = useCallback((config: WatermarkConfig) => {
    // Create a new watermark with a unique ID
    const newWatermark = {
      ...config,
      id: uuidv4()
    };
    
    setWatermarkConfig(newWatermark);
    
    // Add the watermark to all images if they don't already have it
    setImages(prev => 
      prev.map(img => ({
        ...img,
        watermarks: [...img.watermarks, { ...newWatermark }],
        selectedWatermarkIndex: img.watermarks.length
      }))
    );
  }, []);

  // Process/apply watermarks to all images
  const processImages = useCallback(async () => {
    if (images.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      // Update all images to processing state
      setImages(prev => 
        prev.map(img => ({ ...img, isProcessing: true }))
      );
      
      // Process each image
      const updatedImages = [...images];
      
      for (let i = 0; i < updatedImages.length; i++) {
        const image = updatedImages[i];
        
        if (image.watermarks.length === 0) {
          // Skip images with no watermarks
          updatedImages[i] = {
            ...image,
            isProcessing: false
          };
          continue;
        }
        
        try {
          const img = new Image();
          img.src = image.originalUrl;
          
          // Wait for image to load
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          
          // Apply all watermarks
          const watermarkedUrl = await applyMultipleWatermarks(img, image.watermarks);
          
          // Get the preview of the first watermark for display
          const watermarkPreview = image.watermarks.length > 0 && 
            image.watermarks[0].type === 'image' && 
            image.watermarks[0].content instanceof File ? 
            await createWatermarkPreview(image.watermarks[0]) : null;
          
          // Update image
          updatedImages[i] = {
            ...image,
            watermarkedUrl,
            watermarkPreview,
            isProcessing: false
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
  }, [images]);

  // Effect to process images when watermarkConfig changes
  useEffect(() => {
    if (watermarkConfig && images.length > 0) {
      processImages();
    }
  }, [processImages]);

  // Handle watermark configuration changes (for new watermarks)
  const handleWatermarkChange = useCallback((config: WatermarkConfig) => {
    addWatermark(config);
  }, [addWatermark]);

  // Handle watermark selection in the UI
  const handleSelectWatermark = useCallback((imageId: string, watermarkIndex: number) => {
    setImages(prev => 
      prev.map(img => 
        img.id === imageId ? { ...img, selectedWatermarkIndex: watermarkIndex } : img
      )
    );
  }, []);

  // Handle watermark update (for existing watermarks)
  const handleUpdateWatermark = useCallback((imageId: string, watermarkId: string, updatedConfig: Partial<WatermarkConfig>) => {
    setImages(prev => {
      const updatedImages = prev.map(img => {
        if (img.id !== imageId) return img;
        
        const updatedWatermarks = img.watermarks.map(watermark => 
          watermark.id === watermarkId ? { ...watermark, ...updatedConfig } : watermark
        );
        
        return {
          ...img,
          watermarks: updatedWatermarks,
          isProcessing: true // Mark for processing
        };
      });
      
      return updatedImages;
    });
    
    // Trigger processing to update images
    processImages();
  }, [processImages]);

  // Handle removing a watermark
  const handleRemoveWatermark = useCallback((imageId: string, watermarkId: string) => {
    setImages(prev => {
      const updatedImages = prev.map(img => {
        if (img.id !== imageId) return img;
        
        const updatedWatermarks = img.watermarks.filter(w => w.id !== watermarkId);
        const newSelectedIndex = Math.min(img.selectedWatermarkIndex, updatedWatermarks.length - 1);
        
        return {
          ...img,
          watermarks: updatedWatermarks,
          selectedWatermarkIndex: newSelectedIndex >= 0 ? newSelectedIndex : 0,
          isProcessing: updatedWatermarks.length > 0 // Only mark for processing if watermarks remain
        };
      });
      
      return updatedImages;
    });
    
    // Trigger processing to update images
    processImages();
  }, [processImages]);

  // Apply a watermark config to all images
  const applyWatermarkToAll = useCallback((sourceImageId: string, watermarkId: string) => {
    const sourceImage = images.find(img => img.id === sourceImageId);
    if (!sourceImage) return;
    
    const watermarkToApply = sourceImage.watermarks.find(w => w.id === watermarkId);
    if (!watermarkToApply) return;
    
    setImages(prev => {
      const updatedImages = prev.map(img => {
        if (img.id === sourceImageId) return img;
        
        // Check if this image already has this watermark
        const existingIndex = img.watermarks.findIndex(w => w.id === watermarkId);
        
        if (existingIndex >= 0) {
          // Update existing watermark
          const updatedWatermarks = [...img.watermarks];
          updatedWatermarks[existingIndex] = { ...watermarkToApply };
          
          return {
            ...img,
            watermarks: updatedWatermarks,
            isProcessing: true
          };
        } else {
          // Add new watermark
          return {
            ...img,
            watermarks: [...img.watermarks, { ...watermarkToApply, id: watermarkId }],
            isProcessing: true
          };
        }
      });
      
      return updatedImages;
    });
    
    // Trigger processing to update images
    processImages();
    
    toast.success('Watermark settings applied to all images');
  }, [images, processImages]);

  return {
    images,
    watermarkConfig,
    isProcessing,
    handleImagesSelected,
    handleWatermarkChange,
    handleSelectWatermark,
    handleUpdateWatermark,
    handleRemoveWatermark,
    applyWatermarkToAll,
    addWatermark,
    setImages
  };
}
