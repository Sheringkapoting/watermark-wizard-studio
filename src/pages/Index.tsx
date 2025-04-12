
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload, Image as ImageIcon, Download, Move } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface Position {
  x: number;
  y: number;
}

interface WatermarkSettings {
  opacity: number;
  scale: number;
  position: Position;
  rotation: number;
  isDragging: boolean;
}

const Index = () => {
  const isMobile = useIsMobile();
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [watermarkImage, setWatermarkImage] = useState<string | null>(null);
  const [settings, setSettings] = useState<WatermarkSettings>({
    opacity: 0.5,
    scale: 0.5,
    position: { x: 0.5, y: 0.5 },
    rotation: 0,
    isDragging: false
  });
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const watermarkRef = useRef<HTMLImageElement>(null);
  const startPositionRef = useRef<{ x: number, y: number, posX: number, posY: number } | null>(null);
  
  // Handle source image upload
  const handleSourceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSourceImage(e.target?.result as string);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
      toast({
        title: "Image Uploaded",
        description: "Source image has been loaded successfully.",
      });
    }
  };

  // Handle watermark image upload
  const handleWatermarkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setWatermarkImage(e.target?.result as string);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
      toast({
        title: "Watermark Uploaded",
        description: "Watermark image has been loaded successfully.",
      });
    }
  };

  // Process the image with watermark
  const processImage = useCallback(async () => {
    if (!sourceImage || !watermarkImage) {
      toast({
        title: "Missing Images",
        description: "Please upload both source image and watermark.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Load images
      const sourceImg = new Image();
      const watermarkImg = new Image();
      
      // Create promises to ensure images are loaded
      const sourceLoaded = new Promise((resolve) => {
        sourceImg.onload = resolve;
        sourceImg.src = sourceImage;
      });
      
      const watermarkLoaded = new Promise((resolve) => {
        watermarkImg.onload = resolve;
        watermarkImg.src = watermarkImage;
      });
      
      // Wait for both images to load
      await Promise.all([sourceLoaded, watermarkLoaded]);
      
      // Create canvas with source image dimensions
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }
      
      canvas.width = sourceImg.width;
      canvas.height = sourceImg.height;
      
      // Draw source image
      ctx.drawImage(sourceImg, 0, 0);
      
      // Apply opacity to context
      ctx.globalAlpha = settings.opacity;
      
      // Calculate watermark size based on scale
      const watermarkWidth = watermarkImg.width * settings.scale;
      const watermarkHeight = watermarkImg.height * settings.scale;
      
      // Calculate position (center is default)
      const posX = (canvas.width - watermarkWidth) * settings.position.x;
      const posY = (canvas.height - watermarkHeight) * settings.position.y;
      
      // Save context state
      ctx.save();
      
      // Move to the center of where we want to draw the watermark
      ctx.translate(posX + (watermarkWidth / 2), posY + (watermarkHeight / 2));
      
      // Rotate around that point
      ctx.rotate((settings.rotation * Math.PI) / 180);
      
      // Draw the watermark with its center at the origin (adjusted for the rotation)
      ctx.drawImage(
        watermarkImg,
        -watermarkWidth / 2,
        -watermarkHeight / 2,
        watermarkWidth,
        watermarkHeight
      );
      
      // Restore context state
      ctx.restore();
      
      // Convert canvas to data URL
      const dataURL = canvas.toDataURL('image/png');
      setResultImage(dataURL);
      
      toast({
        title: "Processing Complete",
        description: "Watermark has been applied successfully.",
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
  }, [sourceImage, watermarkImage, settings]);

  // Download processed image
  const downloadImage = () => {
    if (!resultImage) {
      toast({
        title: "No Image to Download",
        description: "Please process an image first.",
        variant: "destructive",
      });
      return;
    }

    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'watermarked-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: "Your watermarked image is being downloaded.",
    });
  };

  // Drag start handler
  const handleDragStart = (e: React.MouseEvent<HTMLImageElement> | React.TouchEvent<HTMLImageElement>) => {
    if (!imageContainerRef.current || !watermarkRef.current) return;
    
    setSettings(prev => ({ ...prev, isDragging: true }));
    
    const containerRect = imageContainerRef.current.getBoundingClientRect();
    
    // Get current mouse/touch position
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Store start position for the drag operation
    startPositionRef.current = {
      x: clientX,
      y: clientY,
      posX: settings.position.x,
      posY: settings.position.y
    };
  };

  // Drag handler
  const handleDrag = useCallback((e: MouseEvent | TouchEvent) => {
    if (!settings.isDragging || !startPositionRef.current || !imageContainerRef.current) return;
    
    e.preventDefault();
    
    const containerRect = imageContainerRef.current.getBoundingClientRect();
    
    // Get current mouse/touch position
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Calculate the drag delta as a proportion of the container size
    const deltaX = (clientX - startPositionRef.current.x) / containerRect.width;
    const deltaY = (clientY - startPositionRef.current.y) / containerRect.height;
    
    // Apply the delta to the stored start position
    let newPosX = startPositionRef.current.posX + deltaX;
    let newPosY = startPositionRef.current.posY + deltaY;
    
    // Clamp values between 0 and 1
    newPosX = Math.max(0, Math.min(1, newPosX));
    newPosY = Math.max(0, Math.min(1, newPosY));
    
    setSettings(prev => ({
      ...prev,
      position: { x: newPosX, y: newPosY }
    }));
  }, [settings.isDragging]);

  // Drag end handler
  const handleDragEnd = useCallback(() => {
    setSettings(prev => ({ ...prev, isDragging: false }));
    startPositionRef.current = null;
  }, []);

  // Set up event listeners for drag operations
  useEffect(() => {
    if (settings.isDragging) {
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
  }, [settings.isDragging, handleDrag, handleDragEnd]);

  return (
    <div className="min-h-screen w-full bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Watermark Wizard Studio</h1>
        
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-[1fr_380px] gap-8'}`}>
          {/* Main content area - Image Preview or Upload */}
          <div className="flex flex-col gap-4">
            <Card className="p-6 flex flex-col items-center justify-center">
              {!sourceImage ? (
                <div className="text-center p-10 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 w-full">
                  <div className="mb-4">
                    <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No source image selected</h3>
                    <p className="mt-1 text-sm text-gray-500">Upload an image to add a watermark</p>
                  </div>
                  <Input
                    id="source-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSourceImageUpload}
                  />
                  <label htmlFor="source-image-upload">
                    <Button asChild variant="default">
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Select Image
                      </span>
                    </Button>
                  </label>
                </div>
              ) : (
                <div className="w-full relative">
                  <div className="relative" ref={imageContainerRef}>
                    <img
                      src={sourceImage}
                      alt="Source"
                      className="w-full h-auto rounded-md object-contain max-h-[70vh]"
                    />
                    
                    {watermarkImage && (
                      <img
                        ref={watermarkRef}
                        src={watermarkImage}
                        alt="Watermark"
                        className="absolute pointer-events-auto cursor-move"
                        style={{
                          opacity: settings.opacity,
                          transform: `translate(-50%, -50%) scale(${settings.scale}) rotate(${settings.rotation}deg)`,
                          left: `${settings.position.x * 100}%`,
                          top: `${settings.position.y * 100}%`,
                          maxWidth: "100%",
                          maxHeight: "100%",
                          touchAction: "none"
                        }}
                        onMouseDown={handleDragStart}
                        onTouchStart={handleDragStart}
                      />
                    )}
                  </div>

                  <div className="flex justify-between mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSourceImage(null);
                        setResultImage(null);
                      }}
                    >
                      Change Image
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={processImage}
                        disabled={!watermarkImage || isProcessing}
                      >
                        Apply Watermark
                      </Button>
                      
                      <Button
                        variant="secondary"
                        onClick={downloadImage}
                        disabled={!resultImage}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
            
            {resultImage && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Result</h2>
                <img
                  src={resultImage}
                  alt="Result"
                  className="w-full h-auto rounded-md mb-4"
                />
                <Button 
                  onClick={downloadImage} 
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Image
                </Button>
              </Card>
            )}
          </div>
          
          {/* Controls Panel */}
          <div className="flex flex-col gap-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Watermark</h2>
              
              {!watermarkImage ? (
                <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <div className="mb-4">
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Add a watermark</h3>
                    <p className="mt-1 text-xs text-gray-500">PNG with transparency works best</p>
                  </div>
                  <Input
                    id="watermark-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleWatermarkImageUpload}
                  />
                  <label htmlFor="watermark-image-upload">
                    <Button asChild size="sm" variant="outline">
                      <span>
                        <Upload className="h-3 w-3 mr-2" />
                        Select Watermark
                      </span>
                    </Button>
                  </label>
                </div>
              ) : (
                <div>
                  <div className="bg-gray-100 p-4 rounded-md mb-4 flex justify-center">
                    <img
                      src={watermarkImage}
                      alt="Watermark"
                      className="max-h-32 max-w-full object-contain"
                    />
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mb-4"
                    onClick={() => setWatermarkImage(null)}
                  >
                    Change Watermark
                  </Button>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label htmlFor="opacity">Opacity: {Math.round(settings.opacity * 100)}%</Label>
                      </div>
                      <Slider
                        id="opacity"
                        min={0}
                        max={1}
                        step={0.01}
                        value={[settings.opacity]}
                        onValueChange={([value]) => setSettings({...settings, opacity: value})}
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label htmlFor="scale">Size: {Math.round(settings.scale * 100)}%</Label>
                      </div>
                      <Slider
                        id="scale"
                        min={0.1}
                        max={2}
                        step={0.01}
                        value={[settings.scale]}
                        onValueChange={([value]) => setSettings({...settings, scale: value})}
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label htmlFor="rotation">Rotation: {settings.rotation}°</Label>
                      </div>
                      <Slider
                        id="rotation"
                        min={0}
                        max={360}
                        step={1}
                        value={[settings.rotation]}
                        onValueChange={([value]) => setSettings({...settings, rotation: value})}
                      />
                    </div>
                    
                    <div className="bg-gray-100 p-3 rounded-md flex items-center justify-center gap-2">
                      <Move className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        Drag the watermark to position it
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Instructions</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Upload your source image</li>
                <li>Add a watermark image (PNG with transparency works best)</li>
                <li>Adjust watermark size, opacity, and rotation</li>
                <li>Drag the watermark to position it exactly where you want it</li>
                <li>Click "Apply Watermark" to process the image</li>
                <li>Download your watermarked image</li>
              </ol>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
