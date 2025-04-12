
import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Image as ImageIcon, Plus, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
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
          const posX = canvas.width * watermark.position.x;
          const posY = canvas.height * watermark.position.y;
          
          ctx.save();
          
          // Apply the same transformation as in the preview
          // Translate to the position point
          ctx.translate(posX, posY);
          
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

  // ImageUploader Component
  const ImageUploader = ({ 
    id, 
    onUpload, 
    buttonText, 
    description 
  }: {
    id: string;
    onUpload: (imageSrc: string, fileName: string, fileType: string) => void;
    buttonText: string;
    description: string;
  }) => {
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageSrc = e.target?.result as string;
          onUpload(imageSrc, file.name.split('.')[0], file.type);
        };
        reader.readAsDataURL(file);
        toast({
          title: "Image Uploaded",
          description: "Image has been loaded successfully.",
        });
      }
    };

    return (
      <div className="text-center p-10 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 w-full">
        <div className="mb-4">
          <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No image selected</h3>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
        <Input
          id={id}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        <label htmlFor={id}>
          <Button asChild variant="default">
            <span>
              <Upload className="h-4 w-4 mr-2" />
              {buttonText}
            </span>
          </Button>
        </label>
      </div>
    );
  };

  // WatermarkImage Component
  const WatermarkImage = ({ 
    watermark, 
    onDragStart 
  }: {
    watermark: Watermark;
    onDragStart: (id: string, e: React.MouseEvent<HTMLImageElement> | React.TouchEvent<HTMLImageElement>) => void;
  }) => {
    return (
      <img
        key={watermark.id}
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
          zIndex: 10,
        }}
        onMouseDown={(e) => onDragStart(watermark.id, e)}
        onTouchStart={(e) => onDragStart(watermark.id, e)}
      />
    );
  };

  // WatermarkItem Component
  const WatermarkItem = ({ 
    watermark, 
    index, 
    onRemove, 
    onUpdate 
  }: {
    watermark: Watermark;
    index: number;
    onRemove: (id: string) => void;
    onUpdate: (id: string, update: Partial<Watermark>) => void;
  }) => {
    return (
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium">Watermark {index + 1}</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0" 
            onClick={() => onRemove(watermark.id)}
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
                onUpdate(watermark.id, { opacity: value })
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
                onUpdate(watermark.id, { scale: value })
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
                onUpdate(watermark.id, { rotation: value })
              }
            />
          </div>
        </div>
      </div>
    );
  };

  // WatermarkList Component
  const WatermarkList = ({
    watermarks,
    onWatermarkUpload,
    onWatermarkRemove,
    onWatermarkUpdate
  }: {
    watermarks: Watermark[];
    onWatermarkUpload: (src: string) => void;
    onWatermarkRemove: (id: string) => void;
    onWatermarkUpdate: (id: string, update: Partial<Watermark>) => void;
  }) => {
    const handleWatermarkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          onWatermarkUpload(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        toast({
          title: "Watermark Uploaded",
          description: "Watermark image has been added successfully.",
        });
      }
    };

    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Watermarks</h2>
        
        {watermarks.length === 0 ? (
          <ImageUploader 
            id="watermark-image-upload-initial"
            onUpload={(src) => onWatermarkUpload(src)}
            buttonText="Select Watermark"
            description="PNG with transparency works best"
          />
        ) : (
          <div className="space-y-6">
            {watermarks.map((watermark, index) => (
              <WatermarkItem
                key={watermark.id}
                watermark={watermark}
                index={index}
                onRemove={onWatermarkRemove}
                onUpdate={onWatermarkUpdate}
              />
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
      </div>
    );
  };

  // ImageEditor Component
  const ImageEditor = ({
    sourceImage,
    watermarks,
    onDragStart,
    onChangeImage,
    onProcessImage,
    onDownload,
    resultImage,
    isProcessing
  }: {
    sourceImage: string | null;
    watermarks: Watermark[];
    onDragStart: (id: string, e: React.MouseEvent<HTMLImageElement> | React.TouchEvent<HTMLImageElement>) => void;
    onChangeImage: () => void;
    onProcessImage: () => void;
    onDownload: () => void;
    resultImage: string | null;
    isProcessing: boolean;
  }) => {
    return (
      <div className="w-full relative">
        <div className="relative" ref={imageContainerRef}>
          <img
            src={sourceImage}
            alt="Source"
            className="w-full h-auto rounded-md object-contain max-h-[70vh]"
          />
          
          {watermarks.map((watermark) => (
            <WatermarkImage
              key={watermark.id}
              watermark={watermark}
              onDragStart={onDragStart}
            />
          ))}
        </div>

        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            onClick={onChangeImage}
          >
            Change Image
          </Button>
          
          <div className="flex gap-2">
            <Button
              onClick={onProcessImage}
              disabled={watermarks.length === 0 || isProcessing}
            >
              {isProcessing ? "Processing..." : "Apply Watermark"}
            </Button>
            
            <Button
              variant="secondary"
              onClick={onDownload}
              disabled={!resultImage}
            >
              Download
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // ResultPreview Component
  const ResultPreview = ({ 
    resultImage, 
    onDownload 
  }: {
    resultImage: string;
    onDownload: () => void;
  }) => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Result</h2>
        <img
          src={resultImage}
          alt="Result"
          className="w-full h-auto rounded-md mb-4"
        />
        <Button 
          onClick={onDownload} 
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Image
        </Button>
      </div>
    );
  };

  // Instructions Component
  const Instructions = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>Upload your source image</li>
          <li>Add one or more watermark images (PNG with transparency works best)</li>
          <li>Adjust each watermark's size, opacity, and rotation</li>
          <li>Drag watermarks to position them exactly where you want</li>
          <li>Click "Apply Watermark" to process the image</li>
          <li>Download your watermarked image</li>
        </ol>
      </div>
    );
  };

  // DownloadDialog Component
  const DownloadDialog = ({
    open,
    onOpenChange,
    filename,
    onFilenameChange,
    selectedFormat,
    onFormatChange,
    imageQuality,
    onQualityChange,
    onDownload,
    imageFormats
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filename: string;
    onFilenameChange: (filename: string) => void;
    selectedFormat: string;
    onFormatChange: (format: string) => void;
    imageQuality: number;
    onQualityChange: (quality: number) => void;
    onDownload: () => void;
    imageFormats: ImageFormat[];
  }) => {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download Options</DialogTitle>
            <DialogDescription>
              Customize your download settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filename">Filename</Label>
              <Input
                id="filename"
                value={filename}
                onChange={(e) => onFilenameChange(e.target.value)}
                placeholder="Enter filename"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="format">Image Format</Label>
              <Select value={selectedFormat} onValueChange={onFormatChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {imageFormats.map((format) => (
                    <SelectItem key={format.type} value={format.type}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedFormat !== "image/png" && selectedFormat !== "original" && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="quality">Quality: {Math.round(imageQuality * 100)}%</Label>
                </div>
                <Slider
                  id="quality"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={[imageQuality]}
                  onValueChange={([value]) => onQualityChange(value)}
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onDownload}>
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

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
