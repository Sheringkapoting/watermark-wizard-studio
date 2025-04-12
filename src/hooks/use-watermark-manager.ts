
import { useState, useCallback } from 'react';
import { Watermark, SourceImage, Position, TextWatermark, ImageWatermark } from '@/types/watermark';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export const useWatermarkManager = () => {
  const [sourceImages, setSourceImages] = useState<SourceImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const getCurrentImage = useCallback(() => {
    return sourceImages[currentImageIndex] || null;
  }, [sourceImages, currentImageIndex]);

  // Handle source image upload
  const addSourceImages = useCallback((files: FileList) => {
    const newImages: SourceImage[] = [];
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: SourceImage = {
          id: uuidv4(),
          src: e.target?.result as string,
          name: file.name,
          watermarks: []
        };
        
        newImages.push(newImage);
        
        setSourceImages(prev => [...prev, ...newImages]);
        
        if (sourceImages.length === 0 && newImages.length > 0) {
          setCurrentImageIndex(0);
        }
        
        toast({
          title: "Images Uploaded",
          description: `${files.length} source image(s) have been loaded successfully.`,
        });
      };
      reader.readAsDataURL(file);
    });
  }, [sourceImages]);

  // Add watermark image
  const addImageWatermark = useCallback((file: File) => {
    if (sourceImages.length === 0) {
      toast({
        title: "No Source Image",
        description: "Please upload a source image first.",
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const watermark: ImageWatermark = {
        id: uuidv4(),
        type: 'image',
        src: e.target?.result as string,
        position: { x: 0.5, y: 0.5 },
        opacity: 0.7,
        scale: 0.3,
        rotation: 0,
        zIndex: Date.now()
      };
      
      setSourceImages(prev => {
        const newImages = [...prev];
        newImages[currentImageIndex].watermarks.push(watermark);
        return newImages;
      });
      
      toast({
        title: "Watermark Added",
        description: "Image watermark has been added successfully.",
      });
    };
    reader.readAsDataURL(file);
  }, [sourceImages, currentImageIndex]);

  // Add text watermark
  const addTextWatermark = useCallback((text: string) => {
    if (sourceImages.length === 0) {
      toast({
        title: "No Source Image",
        description: "Please upload a source image first.",
        variant: "destructive",
      });
      return;
    }
    
    if (!text.trim()) {
      toast({
        title: "Empty Text",
        description: "Please enter some text for the watermark.",
        variant: "destructive",
      });
      return;
    }
    
    const watermark: TextWatermark = {
      id: uuidv4(),
      type: 'text',
      content: text,
      fontFamily: 'Arial',
      fontSize: 24,
      fontWeight: 'bold',
      color: '#ffffff',
      position: { x: 0.5, y: 0.5 },
      opacity: 0.7,
      scale: 1,
      rotation: 0,
      zIndex: Date.now()
    };
    
    setSourceImages(prev => {
      const newImages = [...prev];
      newImages[currentImageIndex].watermarks.push(watermark);
      return newImages;
    });
    
    toast({
      title: "Watermark Added",
      description: "Text watermark has been added successfully.",
    });
  }, [sourceImages, currentImageIndex]);

  // Update watermark properties
  const updateWatermark = useCallback((imageId: string, watermarkId: string, updates: Partial<Watermark>) => {
    setSourceImages(prev => {
      return prev.map(img => {
        if (img.id === imageId) {
          return {
            ...img,
            watermarks: img.watermarks.map(w => 
              w.id === watermarkId ? { ...w, ...updates } : w
            )
          };
        }
        return img;
      });
    });
  }, []);

  // Remove a watermark
  const removeWatermark = useCallback((imageId: string, watermarkId: string) => {
    setSourceImages(prev => {
      return prev.map(img => {
        if (img.id === imageId) {
          return {
            ...img,
            watermarks: img.watermarks.filter(w => w.id !== watermarkId)
          };
        }
        return img;
      });
    });
    
    toast({
      title: "Watermark Removed",
      description: "Watermark has been removed.",
    });
  }, []);

  // Remove a source image
  const removeSourceImage = useCallback((imageId: string) => {
    setSourceImages(prev => {
      const newImages = prev.filter(img => img.id !== imageId);
      if (newImages.length === 0) {
        setCurrentImageIndex(0);
      } else if (currentImageIndex >= newImages.length) {
        setCurrentImageIndex(newImages.length - 1);
      }
      return newImages;
    });
    
    toast({
      title: "Image Removed",
      description: "Source image has been removed.",
    });
  }, [currentImageIndex]);

  // Apply watermarks from one image to all images
  const applyWatermarksToAll = useCallback((sourceImageId: string) => {
    const sourceImage = sourceImages.find(img => img.id === sourceImageId);
    if (!sourceImage) return;
    
    setSourceImages(prev => {
      return prev.map(img => {
        if (img.id !== sourceImageId) {
          return {
            ...img,
            watermarks: JSON.parse(JSON.stringify(sourceImage.watermarks))
          };
        }
        return img;
      });
    });
    
    toast({
      title: "Watermarks Applied",
      description: "Watermarks have been applied to all images.",
    });
  }, [sourceImages]);

  // Process all images with their watermarks
  const processAllImages = useCallback(async () => {
    if (sourceImages.length === 0) {
      toast({
        title: "No Images",
        description: "Please upload at least one source image.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const updatedImages = await Promise.all(
        sourceImages.map(async sourceImg => {
          // Skip processing if no watermarks
          if (sourceImg.watermarks.length === 0) {
            return sourceImg;
          }
          
          // Load source image
          const img = new Image();
          const loadImg = new Promise((resolve) => {
            img.onload = resolve;
            img.src = sourceImg.src;
          });
          await loadImg;
          
          // Create canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error("Could not get canvas context");
          
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw source image
          ctx.drawImage(img, 0, 0);
          
          // Sort watermarks by zIndex
          const sortedWatermarks = [...sourceImg.watermarks].sort((a, b) => a.zIndex - b.zIndex);
          
          // Apply each watermark
          for (const watermark of sortedWatermarks) {
            ctx.save();
            
            if (watermark.type === 'image') {
              // Load watermark image
              const wmImg = new Image();
              const loadWm = new Promise<void>((resolve) => {
                wmImg.onload = () => resolve();
                wmImg.src = (watermark as ImageWatermark).src;
              });
              await loadWm;
              
              // Apply opacity
              ctx.globalAlpha = watermark.opacity;
              
              // Calculate watermark size based on scale
              const watermarkWidth = wmImg.width * watermark.scale;
              const watermarkHeight = wmImg.height * watermark.scale;
              
              // Calculate position
              const posX = (canvas.width - watermarkWidth) * watermark.position.x;
              const posY = (canvas.height - watermarkHeight) * watermark.position.y;
              
              // Move to position and rotate
              ctx.translate(posX + (watermarkWidth / 2), posY + (watermarkHeight / 2));
              ctx.rotate((watermark.rotation * Math.PI) / 180);
              
              // Draw watermark
              ctx.drawImage(
                wmImg,
                -watermarkWidth / 2,
                -watermarkHeight / 2,
                watermarkWidth,
                watermarkHeight
              );
            } else if (watermark.type === 'text') {
              // Apply opacity
              ctx.globalAlpha = watermark.opacity;
              
              // Set font properties
              const fontSize = (watermark as TextWatermark).fontSize * watermark.scale;
              ctx.font = `${(watermark as TextWatermark).fontWeight} ${fontSize}px ${(watermark as TextWatermark).fontFamily}`;
              ctx.fillStyle = (watermark as TextWatermark).color;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              
              // Measure text width (approximate)
              const textWidth = ctx.measureText((watermark as TextWatermark).content).width;
              
              // Calculate position
              const posX = canvas.width * watermark.position.x;
              const posY = canvas.height * watermark.position.y;
              
              // Move to position and rotate
              ctx.translate(posX, posY);
              ctx.rotate((watermark.rotation * Math.PI) / 180);
              
              // Draw text
              ctx.fillText((watermark as TextWatermark).content, 0, 0);
            }
            
            ctx.restore();
          }
          
          // Get result as data URL
          const resultSrc = canvas.toDataURL('image/png');
          
          return {
            ...sourceImg,
            resultSrc
          };
        })
      );
      
      setSourceImages(updatedImages);
      
      toast({
        title: "Processing Complete",
        description: "All images have been watermarked successfully.",
      });
    } catch (error) {
      console.error('Error processing images:', error);
      toast({
        title: "Processing Error",
        description: "An error occurred while processing the images.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [sourceImages]);

  // Download a processed image
  const downloadImage = useCallback((imageId: string) => {
    const image = sourceImages.find(img => img.id === imageId);
    if (!image || !image.resultSrc) {
      toast({
        title: "No Processed Image",
        description: "Please process the image first.",
        variant: "destructive",
      });
      return;
    }

    const link = document.createElement('a');
    link.href = image.resultSrc;
    link.download = `watermarked-${image.name || 'image'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: "Your watermarked image is being downloaded.",
    });
  }, [sourceImages]);

  // Download all processed images as a zip
  const downloadAllImages = useCallback(() => {
    const processedImages = sourceImages.filter(img => img.resultSrc);
    if (processedImages.length === 0) {
      toast({
        title: "No Processed Images",
        description: "Please process the images first.",
        variant: "destructive",
      });
      return;
    }

    // Download each image one by one for now
    // In a real app, you'd use a library like JSZip to create a zip file
    processedImages.forEach((image, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = image.resultSrc!;
        link.download = `watermarked-${image.name || `image-${index}`}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 500); // Delay each download to prevent browser issues
    });
    
    toast({
      title: "Downloads Started",
      description: `${processedImages.length} watermarked images are being downloaded.`,
    });
  }, [sourceImages]);

  return {
    sourceImages,
    currentImageIndex,
    setCurrentImageIndex,
    getCurrentImage,
    isProcessing,
    addSourceImages,
    addImageWatermark,
    addTextWatermark,
    updateWatermark,
    removeWatermark,
    removeSourceImage,
    applyWatermarksToAll,
    processAllImages,
    downloadImage,
    downloadAllImages
  };
};
