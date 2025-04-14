
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, EraserIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { removeBackground, loadImage } from "@/utils/backgroundRemoval";

interface BackgroundRemovalToolProps {
  imageUrl: string;
  onProcessed: (newImageUrl: string) => void;
}

export const BackgroundRemovalTool = ({ imageUrl, onProcessed }: BackgroundRemovalToolProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRemoveBackground = async () => {
    if (!imageUrl) {
      toast({
        title: "No Image Selected",
        description: "Please upload an image before removing the background.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Load the image
      const img = await loadImage(imageUrl);
      
      // Process the image
      const resultImageUrl = await removeBackground(img);
      
      // Pass the processed image back
      onProcessed(resultImageUrl);
      
      toast({
        title: "Background Removed",
        description: "The background has been successfully removed from the image.",
      });
    } catch (error) {
      console.error("Error removing background:", error);
      toast({
        title: "Background Removal Failed",
        description: "An error occurred while removing the background. Please try again with a different image.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleRemoveBackground}
      disabled={isProcessing || !imageUrl}
      className="gap-2"
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <EraserIcon className="h-4 w-4" />
          Remove Background
        </>
      )}
    </Button>
  );
};
