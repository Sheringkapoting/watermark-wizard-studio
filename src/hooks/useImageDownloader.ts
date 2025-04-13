
import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { ImageFormat } from "@/types/watermark";

export const useImageDownloader = (sourceImageName: string, sourceImageType: string) => {
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadFilename, setDownloadFilename] = useState(sourceImageName || "");
  const [selectedFormat, setSelectedFormat] = useState<string>("original");
  const [imageQuality, setImageQuality] = useState<number>(0.9);

  const imageFormats: ImageFormat[] = [
    { type: "original", quality: 0.9, label: "Original Format" },
    { type: "image/jpeg", quality: 0.9, label: "JPEG" },
    { type: "image/png", quality: 1, label: "PNG" },
    { type: "image/webp", quality: 0.9, label: "WebP" },
  ];

  const handleDownload = useCallback((resultImage: string | null) => {
    if (!resultImage) {
      toast({
        title: "No Image to Download",
        description: "Please process an image first.",
        variant: "destructive",
      });
      return;
    }

    setDownloadDialogOpen(true);
  }, []);

  const processDownload = useCallback((resultImage: string | null) => {
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
  }, [downloadFilename, sourceImageType, selectedFormat, imageQuality, imageFormats]);

  return {
    downloadDialogOpen,
    setDownloadDialogOpen,
    downloadFilename,
    setDownloadFilename,
    selectedFormat,
    setSelectedFormat,
    imageQuality,
    setImageQuality,
    imageFormats,
    handleDownload,
    processDownload
  };
};
