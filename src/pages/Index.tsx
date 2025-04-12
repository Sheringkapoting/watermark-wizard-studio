
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Upload, Image as ImageIcon, Download, Copy } from "lucide-react";
import { useWatermarkManager } from "@/hooks/use-watermark-manager";
import { ImagePreview } from "@/components/watermark/ImagePreview";
import { WatermarkControls } from "@/components/watermark/WatermarkControls";
import { ImageGallery } from "@/components/watermark/ImageGallery";
import { Watermark } from "@/types/watermark";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Index = () => {
  const isMobile = useIsMobile();
  const {
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
  } = useWatermarkManager();
  
  const [selectedWatermarkId, setSelectedWatermarkId] = useState<string | null>(null);
  const [showApplyAllDialog, setShowApplyAllDialog] = useState(false);
  
  const currentImage = getCurrentImage();
  
  // Find the selected watermark
  const selectedWatermark = currentImage?.watermarks.find(w => w.id === selectedWatermarkId) || null;
  
  // Handle source image upload
  const handleSourceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addSourceImages(files);
    }
  };
  
  // Handle watermark update
  const handleUpdateWatermark = (watermarkId: string, updates: Partial<Watermark>) => {
    if (currentImage) {
      updateWatermark(currentImage.id, watermarkId, updates);
    }
  };
  
  // Handle selected watermark update
  const handleSelectedWatermarkUpdate = (updates: Partial<Watermark>) => {
    if (selectedWatermarkId && currentImage) {
      updateWatermark(currentImage.id, selectedWatermarkId, updates);
    }
  };
  
  // Process current image when user completes editing
  const handleProcessCurrentImage = () => {
    if (sourceImages.length > 1) {
      setShowApplyAllDialog(true);
    } else {
      processAllImages();
    }
  };
  
  return (
    <div className="min-h-screen w-full bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Watermark Wizard Studio</h1>
        
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-[1fr_380px] gap-8'}`}>
          {/* Main content area - Image Preview and Gallery */}
          <div className="flex flex-col gap-4">
            <Card className="p-6 flex flex-col items-center justify-center">
              {sourceImages.length === 0 ? (
                <div className="text-center p-10 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 w-full">
                  <div className="mb-4">
                    <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No source images selected</h3>
                    <p className="mt-1 text-sm text-gray-500">Upload one or more images to add watermarks</p>
                  </div>
                  <Input
                    id="source-image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleSourceImageUpload}
                  />
                  <label htmlFor="source-image-upload">
                    <Button asChild variant="default">
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Select Images
                      </span>
                    </Button>
                  </label>
                </div>
              ) : (
                <div className="w-full">
                  <ImageGallery 
                    images={sourceImages}
                    currentIndex={currentImageIndex}
                    onSelect={setCurrentImageIndex}
                    onRemove={removeSourceImage}
                    onDownload={downloadImage}
                  />
                  
                  <div className="mt-4">
                    <ImagePreview 
                      image={currentImage}
                      onUpdateWatermark={handleUpdateWatermark}
                      onRemoveWatermark={(watermarkId) => {
                        if (currentImage) {
                          removeWatermark(currentImage.id, watermarkId);
                          if (selectedWatermarkId === watermarkId) {
                            setSelectedWatermarkId(null);
                          }
                        }
                      }}
                    />
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <Input
                      id="add-more-images"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleSourceImageUpload}
                    />
                    <label htmlFor="add-more-images">
                      <Button asChild variant="outline">
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Add More Images
                        </span>
                      </Button>
                    </label>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={handleProcessCurrentImage}
                        disabled={isProcessing || sourceImages.length === 0}
                      >
                        Apply Watermarks
                      </Button>
                      
                      <Button
                        variant="secondary"
                        onClick={downloadAllImages}
                        disabled={!sourceImages.some(img => img.resultSrc)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download All
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
          
          {/* Controls Panel */}
          <div className="flex flex-col gap-4">
            <WatermarkControls
              selectedWatermark={selectedWatermark}
              onUpdateWatermark={handleSelectedWatermarkUpdate}
              onAddImageWatermark={addImageWatermark}
              onAddTextWatermark={addTextWatermark}
            />
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Instructions</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Upload one or more source images</li>
                <li>Add image or text watermarks to each image</li>
                <li>Drag watermarks to position them precisely</li>
                <li>Resize watermarks by dragging the corner handle or using the mouse wheel</li>
                <li>Adjust opacity, rotation, and other settings</li>
                <li>Click "Apply Watermarks" to process all images</li>
                <li>Download individual or all watermarked images</li>
              </ol>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Apply to All Dialog */}
      <AlertDialog open={showApplyAllDialog} onOpenChange={setShowApplyAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply to All Images?</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to apply the watermarks from the current image to all other images before processing?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep Individual Settings</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (currentImage) {
                  applyWatermarksToAll(currentImage.id);
                }
                processAllImages();
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              Yes, Apply to All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
