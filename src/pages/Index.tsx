
import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Download, Image as ImageIcon, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

import { ImageUploader } from "@/components/watermark/ImageUploader";
import { ImageEditor } from "@/components/watermark/ImageEditor";
import { WatermarkList } from "@/components/watermark/WatermarkList";
import { ResultPreview } from "@/components/watermark/ResultPreview";
import { Instructions } from "@/components/watermark/Instructions";
import { DownloadDialog } from "@/components/watermark/DownloadDialog";
import { ImageFormat, Watermark } from "@/types/watermark";

const Index = () => {
  const isMobile = useIsMobile();
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceImageName, setSourceImageName] = useState<string>("image");
  const [sourceImageType, setSourceImageType] = useState<string>("image/jpeg");
  const [watermarks, setWatermarks] = useState<Watermark[]>([]);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sourceImageDimensions, setSourceImageDimensions] = useState<{width: number, height: number} | null>(null);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadFilename, setDownloadFilename] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<string>("original");
  const [imageQuality, setImageQuality] = useState<number>(0.9);
  
  const startPositionRef = useRef<{ id: string, x: number, y: number, posX: number, posY: number } | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  const imageFormats: ImageFormat[] = [
    { type: "original", quality: 0.9, label: "Original Format" },
    { type: "image/jpeg", quality: 0.9, label: "JPEG" },
    { type: "image/png", quality: 1, label: "PNG" },
    { type: "image/webp", quality: 0.9, label: "WebP" },
  ];

  useEffect(() => {
    if (sourceImageName) {
      setDownloadFilename(sourceImageName);
    }
  }, [sourceImageName]);
  
  const loadSourceImage = (src: string) => {
    return new Promise<{width: number, height: number}>((resolve) => {
      const img = new Image();
      img.onload = () => {
        setSourceImageDimensions({width: img.width, height: img.height});
        resolve({width: img.width, height: img.height});
      };
      img.src = src;
    });
  };

  const handleSourceImageUpload = async (imageSrc: string, fileName: string, fileType: string) => {
    setSourceImage(imageSrc);
    setResultImage(null);
    
    setSourceImageName(fileName);
    setSourceImageType(fileType);
    setDownloadFilename(fileName);
    
    await loadSourceImage(imageSrc);
  };

  const handleWatermarkImageUpload = (src: string) => {
    const newWatermark: Watermark = {
      id: `watermark-${Date.now()}`,
      src: src,
      opacity: 1.0,
      scale: 0.5,
      position: { x: 0.5, y: 0.5 },
      rotation: 0,
      isDragging: false
    };
    
    setWatermarks(prevWatermarks => [...prevWatermarks, newWatermark]);
    setResultImage(null);
  };

  const removeWatermark = (id: string) => {
    setWatermarks(prevWatermarks => prevWatermarks.filter(watermark => watermark.id !== id));
    setResultImage(null);
  };

  const updateWatermarkSettings = (id: string, update: Partial<Watermark>) => {
    setWatermarks(prevWatermarks => 
      prevWatermarks.map(watermark => 
        watermark.id === id ? { ...watermark, ...update } : watermark
      )
    );
    setResultImage(null);
  };

  const processImage = useCallback(async () => {
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
      const sourceImg = new Image();
      
      const sourceLoaded = new Promise((resolve) => {
        sourceImg.onload = resolve;
        sourceImg.src = sourceImage;
      });
      
      await sourceLoaded;
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }
      
      canvas.width = sourceImg.width;
      canvas.height = sourceImg.height;
      
      ctx.drawImage(sourceImg, 0, 0);
      
      const watermarkLoadPromises = [];
      
      for (const watermark of watermarks) {
        const watermarkImg = new Image();
        
        const watermarkLoaded = new Promise<void>((resolve) => {
          watermarkImg.onload = () => resolve();
          watermarkImg.src = watermark.src;
        });
        
        watermarkLoadPromises.push(watermarkLoaded.then(() => {
          // Use the same opacity as in the preview
          ctx.globalAlpha = watermark.opacity;
          
          // Calculate the scaled dimensions using the same formula as in the preview
          const scaledWidth = watermarkImg.width * watermark.scale;
          const scaledHeight = watermarkImg.height * watermark.scale;
          
          // Calculate position using the same relative positioning formula as in the preview
          const posX = (canvas.width - scaledWidth) * watermark.position.x;
          const posY = (canvas.height - scaledHeight) * watermark.position.y;
          
          ctx.save();
          
          // Apply the same transformation as in the preview
          // Translate to the position point plus half the watermark dimensions
          ctx.translate(posX + (scaledWidth / 2), posY + (scaledHeight / 2));
          
          // Apply the same rotation as in the preview
          ctx.rotate((watermark.rotation * Math.PI) / 180);
          
          // Draw the watermark centered at the rotation point, with the same
          // size as shown in the preview
          ctx.drawImage(
            watermarkImg,
            -scaledWidth / 2,
            -scaledHeight / 2,
            scaledWidth,
            scaledHeight
          );
          
          ctx.restore();
        }));
      }
      
      await Promise.all(watermarkLoadPromises);
      
      // Use the source image type for consistency
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
  }, [sourceImage, watermarks, sourceImageDimensions, sourceImageType]);

  const handleDownload = () => {
    if (!resultImage) {
      toast({
        title: "No Image to Download",
        description: "Please process an image first.",
        variant: "destructive",
      });
      return;
    }

    setDownloadDialogOpen(true);
  };

  const resetAll = () => {
    setSourceImage(null);
    setResultImage(null);
    setSourceImageDimensions(null);
    setWatermarks([]);
  };

  const processDownload = () => {
    if (!resultImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      toast({
        title: "Download Error",
        description: "Could not create canvas context for download.",
        variant: "destructive",
      });
      return;
    }

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      let outputType = sourceImageType;
      let outputQuality = 0.9;
      
      if (selectedFormat !== "original") {
        const format = imageFormats.find(f => f.type === selectedFormat);
        if (format) {
          outputType = format.type;
          outputQuality = imageQuality;
        }
      }
      
      const getExtension = (mimeType: string) => {
        switch (mimeType) {
          case 'image/jpeg': return '.jpg';
          case 'image/png': return '.png';
          case 'image/webp': return '.webp';
          default: return '.jpg';
        }
      };
      
      const dataURL = canvas.toDataURL(outputType, outputQuality);
      const extension = getExtension(outputType);
      const filename = downloadFilename ? 
        (downloadFilename.includes('.') ? downloadFilename : downloadFilename + extension) : 
        'watermarked-image' + extension;
        
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setDownloadDialogOpen(false);
      
      toast({
        title: "Download Started",
        description: "Your watermarked image is being downloaded.",
      });
    };
    
    img.src = resultImage;
  };

  const handleDragStart = (id: string, e: React.MouseEvent<HTMLImageElement> | React.TouchEvent<HTMLImageElement>) => {
    if (!imageContainerRef.current) return;
    
    setWatermarks(prevWatermarks => 
      prevWatermarks.map(watermark => 
        watermark.id === id ? { ...watermark, isDragging: true } : watermark
      )
    );
    
    const containerRect = imageContainerRef.current.getBoundingClientRect();
    
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const watermark = watermarks.find(w => w.id === id);
    if (!watermark) return;
    
    startPositionRef.current = {
      id,
      x: clientX,
      y: clientY,
      posX: watermark.position.x,
      posY: watermark.position.y
    };
  };

  const handleDrag = useCallback((e: MouseEvent | TouchEvent) => {
    if (!startPositionRef.current || !imageContainerRef.current) return;
    
    e.preventDefault();
    
    const containerRect = imageContainerRef.current.getBoundingClientRect();
    
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const deltaX = (clientX - startPositionRef.current.x) / containerRect.width;
    const deltaY = (clientY - startPositionRef.current.y) / containerRect.height;
    
    let newPosX = startPositionRef.current.posX + deltaX;
    let newPosY = startPositionRef.current.posY + deltaY;
    
    newPosX = Math.max(0, Math.min(1, newPosX));
    newPosY = Math.max(0, Math.min(1, newPosY));
    
    const id = startPositionRef.current.id;
    
    setWatermarks(prevWatermarks => 
      prevWatermarks.map(watermark => 
        watermark.id === id ? {
          ...watermark,
          position: { x: newPosX, y: newPosY }
        } : watermark
      )
    );
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!startPositionRef.current) return;
    
    const id = startPositionRef.current.id;
    
    setWatermarks(prevWatermarks => 
      prevWatermarks.map(watermark => 
        watermark.id === id ? { ...watermark, isDragging: false } : watermark
      )
    );
    
    startPositionRef.current = null;
  }, []);

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

  return (
    <div className="min-h-screen w-full bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Watermark Wizard Studio</h1>
        
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
                  onProcessImage={processImage}
                  onDownload={handleDownload}
                  resultImage={resultImage}
                  isProcessing={isProcessing}
                />
              )}
            </Card>
            
            {resultImage && (
              <Card className="p-6">
                <ResultPreview 
                  resultImage={resultImage} 
                  onDownload={handleDownload} 
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
                onWatermarkUpdate={updateWatermarkSettings}
              />
            </Card>
            
            <Card className="p-6">
              <Instructions />
            </Card>
          </div>
        </div>
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
        onDownload={processDownload}
        imageFormats={imageFormats}
      />
    </div>
  );
};

export default Index;
