
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload, Image as ImageIcon, Download, Move, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface Position {
  x: number;
  y: number;
}

interface Watermark {
  id: string;
  src: string;
  opacity: number;
  scale: number;
  position: Position;
  rotation: number;
  isDragging: boolean;
}

const Index = () => {
  const isMobile = useIsMobile();
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [watermarks, setWatermarks] = useState<Watermark[]>([]);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sourceImageDimensions, setSourceImageDimensions] = useState<{width: number, height: number} | null>(null);
  
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const watermarkRefs = useRef<Map<string, HTMLImageElement>>(new Map());
  const startPositionRef = useRef<{ id: string, x: number, y: number, posX: number, posY: number } | null>(null);
  
  // Load source image and get its dimensions
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

  // Handle source image upload
  const handleSourceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageSrc = e.target?.result as string;
        setSourceImage(imageSrc);
        setResultImage(null);
        
        // Load source image dimensions
        await loadSourceImage(imageSrc);
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
        const newWatermark: Watermark = {
          id: `watermark-${Date.now()}`,
          src: e.target?.result as string,
          opacity: 1.0, // Default to 100% opacity
          scale: 0.5,
          position: { x: 0.5, y: 0.5 },
          rotation: 0,
          isDragging: false
        };
        
        setWatermarks(prevWatermarks => [...prevWatermarks, newWatermark]);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
      toast({
        title: "Watermark Uploaded",
        description: "Watermark image has been added successfully.",
      });
    }
  };

  // Remove a watermark
  const removeWatermark = (id: string) => {
    setWatermarks(prevWatermarks => prevWatermarks.filter(watermark => watermark.id !== id));
    setResultImage(null);
  };

  // Update watermark settings
  const updateWatermarkSettings = (id: string, update: Partial<Watermark>) => {
    setWatermarks(prevWatermarks => 
      prevWatermarks.map(watermark => 
        watermark.id === id ? { ...watermark, ...update } : watermark
      )
    );
    setResultImage(null);
  };

  // Get watermark dimensions from DOM elements (for the preview)
  const getWatermarkPreviewDimensions = (watermarkId: string) => {
    const watermarkElement = watermarkRefs.current.get(watermarkId);
    if (!watermarkElement) return null;
    
    return {
      width: watermarkElement.naturalWidth,
      height: watermarkElement.naturalHeight
    };
  };

  // Process the image with watermarks
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
      // Load source image
      const sourceImg = new Image();
      
      const sourceLoaded = new Promise((resolve) => {
        sourceImg.onload = resolve;
        sourceImg.src = sourceImage;
      });
      
      await sourceLoaded;
      
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
      
      // Store watermark loading promises
      const watermarkLoadPromises = [];
      
      // Process each watermark
      for (const watermark of watermarks) {
        const watermarkImg = new Image();
        
        const watermarkLoaded = new Promise<void>((resolve) => {
          watermarkImg.onload = () => resolve();
          watermarkImg.src = watermark.src;
        });
        
        watermarkLoadPromises.push(watermarkLoaded.then(() => {
          // Apply opacity to context
          ctx.globalAlpha = watermark.opacity;
          
          // Calculate watermark size based on the scale relative to the source image
          // Using the source image's dimensions to determine watermark size
          const watermarkWidth = watermarkImg.width * watermark.scale;
          const watermarkHeight = watermarkImg.height * watermark.scale;
          
          // Calculate absolute position based on the relative position
          const posX = (canvas.width - watermarkWidth) * watermark.position.x;
          const posY = (canvas.height - watermarkHeight) * watermark.position.y;
          
          // Save context state
          ctx.save();
          
          // Move to the center point for rotation
          ctx.translate(posX + (watermarkWidth / 2), posY + (watermarkHeight / 2));
          
          // Apply rotation
          ctx.rotate((watermark.rotation * Math.PI) / 180);
          
          // Draw watermark centered at the rotation point
          ctx.drawImage(
            watermarkImg,
            -watermarkWidth / 2,
            -watermarkHeight / 2,
            watermarkWidth,
            watermarkHeight
          );
          
          // Restore context state
          ctx.restore();
        }));
      }
      
      // Wait for all watermarks to be processed
      await Promise.all(watermarkLoadPromises);
      
      // Convert canvas to data URL
      const dataURL = canvas.toDataURL('image/png');
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
  }, [sourceImage, watermarks, sourceImageDimensions]);

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
  const handleDragStart = (id: string, e: React.MouseEvent<HTMLImageElement> | React.TouchEvent<HTMLImageElement>) => {
    if (!imageContainerRef.current) return;
    
    setWatermarks(prevWatermarks => 
      prevWatermarks.map(watermark => 
        watermark.id === id ? { ...watermark, isDragging: true } : watermark
      )
    );
    
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
    
    // Find the current watermark
    const watermark = watermarks.find(w => w.id === id);
    if (!watermark) return;
    
    // Store start position for the drag operation
    startPositionRef.current = {
      id,
      x: clientX,
      y: clientY,
      posX: watermark.position.x,
      posY: watermark.position.y
    };
  };

  // Drag handler
  const handleDrag = useCallback((e: MouseEvent | TouchEvent) => {
    if (!startPositionRef.current || !imageContainerRef.current) return;
    
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

  // Drag end handler
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
                    
                    {watermarks.map((watermark) => (
                      <img
                        key={watermark.id}
                        ref={(el) => {
                          if (el) watermarkRefs.current.set(watermark.id, el);
                          else watermarkRefs.current.delete(watermark.id);
                        }}
                        src={watermark.src}
                        alt={`Watermark ${watermark.id}`}
                        className="absolute pointer-events-auto cursor-move"
                        style={{
                          opacity: watermark.opacity,
                          transform: `translate(-50%, -50%) scale(${watermark.scale}) rotate(${watermark.rotation}deg)`,
                          left: `${watermark.position.x * 100}%`,
                          top: `${watermark.position.y * 100}%`,
                          maxWidth: "100%",
                          maxHeight: "100%",
                          touchAction: "none",
                          zIndex: 10 + watermarks.indexOf(watermark)
                        }}
                        onMouseDown={(e) => handleDragStart(watermark.id, e)}
                        onTouchStart={(e) => handleDragStart(watermark.id, e)}
                      />
                    ))}
                  </div>

                  <div className="flex justify-between mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSourceImage(null);
                        setResultImage(null);
                        setSourceImageDimensions(null);
                      }}
                    >
                      Change Image
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={processImage}
                        disabled={watermarks.length === 0 || isProcessing}
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
              <h2 className="text-xl font-semibold mb-4">Watermarks</h2>
              
              {watermarks.length === 0 ? (
                <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 mb-4">
                  <div className="mb-4">
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Add a watermark</h3>
                    <p className="mt-1 text-xs text-gray-500">PNG with transparency works best</p>
                  </div>
                  <Input
                    id="watermark-image-upload-initial"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleWatermarkImageUpload}
                  />
                  <label htmlFor="watermark-image-upload-initial">
                    <Button asChild size="sm" variant="outline">
                      <span>
                        <Upload className="h-3 w-3 mr-2" />
                        Select Watermark
                      </span>
                    </Button>
                  </label>
                </div>
              ) : (
                <div className="space-y-6">
                  {watermarks.map((watermark, index) => (
                    <div key={watermark.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium">Watermark {index + 1}</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0" 
                          onClick={() => removeWatermark(watermark.id)}
                        >
                          &times;
                        </Button>
                      </div>
                      
                      <div className="bg-gray-100 p-4 rounded-md mb-4 flex justify-center">
                        <img
                          src={watermark.src}
                          alt={`Watermark ${index + 1}`}
                          className="max-h-24 max-w-full object-contain"
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <Label htmlFor={`opacity-${watermark.id}`}>
                              Opacity: {Math.round(watermark.opacity * 100)}%
                            </Label>
                          </div>
                          <Slider
                            id={`opacity-${watermark.id}`}
                            min={0}
                            max={1}
                            step={0.01}
                            value={[watermark.opacity]}
                            onValueChange={([value]) => 
                              updateWatermarkSettings(watermark.id, { opacity: value })
                            }
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <Label htmlFor={`scale-${watermark.id}`}>
                              Size: {Math.round(watermark.scale * 100)}%
                            </Label>
                          </div>
                          <Slider
                            id={`scale-${watermark.id}`}
                            min={0.1}
                            max={2}
                            step={0.01}
                            value={[watermark.scale]}
                            onValueChange={([value]) => 
                              updateWatermarkSettings(watermark.id, { scale: value })
                            }
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <Label htmlFor={`rotation-${watermark.id}`}>
                              Rotation: {watermark.rotation}°
                            </Label>
                          </div>
                          <Slider
                            id={`rotation-${watermark.id}`}
                            min={0}
                            max={360}
                            step={1}
                            value={[watermark.rotation]}
                            onValueChange={([value]) => 
                              updateWatermarkSettings(watermark.id, { rotation: value })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div>
                    <Input
                      id="watermark-image-upload-additional"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleWatermarkImageUpload}
                    />
                    <label htmlFor="watermark-image-upload-additional">
                      <Button asChild variant="outline" className="w-full">
                        <span>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Another Watermark
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              )}
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Instructions</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Upload your source image</li>
                <li>Add one or more watermark images (PNG with transparency works best)</li>
                <li>Adjust each watermark's size, opacity, and rotation</li>
                <li>Drag watermarks to position them exactly where you want</li>
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
