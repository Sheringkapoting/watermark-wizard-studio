
import { toast } from 'sonner';
import { WatermarkedImage, generateZip } from '@/utils/imageProcessing';

// Delete an image
export const deleteImage = (id: string, images: WatermarkedImage[], setImages: React.Dispatch<React.SetStateAction<WatermarkedImage[]>>) => {
  setImages(prev => {
    const filtered = prev.filter(img => img.id !== id);
    if (filtered.length === 0) {
      toast.info('All images removed');
    }
    return filtered;
  });
};

// Download a single watermarked image
export const downloadImage = (image: WatermarkedImage) => {
  if (!image.watermarkedUrl) return;
  
  const link = document.createElement('a');
  link.href = image.watermarkedUrl;
  link.download = `watermarked_${image.originalFile.name}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  toast.success('Image downloaded successfully');
};

// Download all watermarked images
export const downloadAllImages = async (
  images: WatermarkedImage[], 
  setIsProcessing: (state: boolean) => void,
  handleDownloadImage: (image: WatermarkedImage) => void
) => {
  if (images.length === 0 || !images.some(img => img.watermarkedUrl)) return;
  
  // For a single image, just download it directly
  if (images.length === 1 && images[0].watermarkedUrl) {
    handleDownloadImage(images[0]);
    return;
  }
  
  setIsProcessing(true);
  toast.info('Preparing download...');
  
  try {
    // In a real implementation, we would use JSZip to create a ZIP file
    const zipUrl = await generateZip(images);
    
    // Check if any images failed
    const failedImages = images.filter(img => !img.watermarkedUrl).length;
    if (failedImages > 0) {
      toast.warning(`${failedImages} image(s) could not be processed and will not be included in the download`);
    }
    
    if (images.filter(img => img.watermarkedUrl).length > 0) {
      toast.success(`${images.filter(img => img.watermarkedUrl).length} images prepared for download`);
    }
  } catch (error) {
    console.error('Error generating ZIP:', error);
    toast.error('Failed to prepare images for download');
  } finally {
    setIsProcessing(false);
  }
};
