
export interface WatermarkOptions {
  position: 'center' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'custom';
  customPosition?: { x: number; y: number };
  scale: number;
  opacity: number;
  rotation: number;
}

export interface WatermarkedImage {
  id: string;
  originalFile: File;
  originalUrl: string;
  watermarkedUrl: string | null;
  isProcessing: boolean;
}

export interface WatermarkConfig {
  type: 'image' | 'text';
  content: string | File;
  options: WatermarkOptions;
}

export const DEFAULT_WATERMARK_OPTIONS: WatermarkOptions = {
  position: 'bottomRight',
  scale: 0.2,
  opacity: 0.7,
  rotation: 0
};

/**
 * Apply watermark to an image
 */
export const applyWatermark = (
  image: HTMLImageElement,
  watermarkConfig: WatermarkConfig
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not create canvas context'));
        return;
      }

      // Set canvas dimensions
      canvas.width = image.width;
      canvas.height = image.height;

      // Draw original image
      ctx.drawImage(image, 0, 0, image.width, image.height);

      // Apply watermark based on type
      if (watermarkConfig.type === 'image' && watermarkConfig.content instanceof File) {
        // Image watermark
        const watermarkImg = new Image();
        watermarkImg.onload = () => {
          applyImageWatermark(ctx, watermarkImg, image.width, image.height, watermarkConfig.options);
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        watermarkImg.onerror = () => reject(new Error('Failed to load watermark image'));
        watermarkImg.src = URL.createObjectURL(watermarkConfig.content);
      } else if (watermarkConfig.type === 'text' && typeof watermarkConfig.content === 'string') {
        // Text watermark
        applyTextWatermark(ctx, watermarkConfig.content, image.width, image.height, watermarkConfig.options);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      } else {
        reject(new Error('Invalid watermark configuration'));
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Apply image watermark to canvas
 */
const applyImageWatermark = (
  ctx: CanvasRenderingContext2D,
  watermarkImg: HTMLImageElement,
  imageWidth: number,
  imageHeight: number,
  options: WatermarkOptions
) => {
  // Calculate scale
  const scaleFactor = options.scale;
  const watermarkWidth = watermarkImg.width * scaleFactor;
  const watermarkHeight = watermarkImg.height * scaleFactor;

  // Calculate position
  let x = 0;
  let y = 0;

  switch (options.position) {
    case 'center':
      x = (imageWidth - watermarkWidth) / 2;
      y = (imageHeight - watermarkHeight) / 2;
      break;
    case 'topLeft':
      x = 20;
      y = 20;
      break;
    case 'topRight':
      x = imageWidth - watermarkWidth - 20;
      y = 20;
      break;
    case 'bottomLeft':
      x = 20;
      y = imageHeight - watermarkHeight - 20;
      break;
    case 'bottomRight':
      x = imageWidth - watermarkWidth - 20;
      y = imageHeight - watermarkHeight - 20;
      break;
    case 'custom':
      if (options.customPosition) {
        x = options.customPosition.x * imageWidth;
        y = options.customPosition.y * imageHeight;
      }
      break;
  }

  // Save context state
  ctx.save();

  // Set opacity
  ctx.globalAlpha = options.opacity;

  // Rotate if needed
  if (options.rotation !== 0) {
    const centerX = x + watermarkWidth / 2;
    const centerY = y + watermarkHeight / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((options.rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);
  }

  // Draw watermark
  ctx.drawImage(watermarkImg, x, y, watermarkWidth, watermarkHeight);

  // Restore context state
  ctx.restore();
};

/**
 * Apply text watermark to canvas
 */
const applyTextWatermark = (
  ctx: CanvasRenderingContext2D,
  text: string,
  imageWidth: number,
  imageHeight: number,
  options: WatermarkOptions
) => {
  // Calculate font size based on scale and image size
  const fontSize = Math.max(Math.min(imageWidth, imageHeight) * options.scale * 0.25, 12);
  ctx.font = `${fontSize}px Arial`;
  
  // Calculate text metrics
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = fontSize;

  // Calculate position
  let x = 0;
  let y = 0;

  switch (options.position) {
    case 'center':
      x = (imageWidth - textWidth) / 2;
      y = (imageHeight + textHeight) / 2;
      break;
    case 'topLeft':
      x = 20;
      y = 20 + textHeight;
      break;
    case 'topRight':
      x = imageWidth - textWidth - 20;
      y = 20 + textHeight;
      break;
    case 'bottomLeft':
      x = 20;
      y = imageHeight - 20;
      break;
    case 'bottomRight':
      x = imageWidth - textWidth - 20;
      y = imageHeight - 20;
      break;
    case 'custom':
      if (options.customPosition) {
        x = options.customPosition.x * imageWidth;
        y = options.customPosition.y * imageHeight;
      }
      break;
  }

  // Save context state
  ctx.save();

  // Set opacity
  ctx.globalAlpha = options.opacity;

  // Rotate if needed
  if (options.rotation !== 0) {
    const centerX = x + textWidth / 2;
    const centerY = y - textHeight / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((options.rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);
  }

  // Draw text watermark
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = fontSize / 15;
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);

  // Restore context state
  ctx.restore();
};

/**
 * Generate a ZIP file from watermarked images
 */
export const generateZip = async (
  images: WatermarkedImage[]
): Promise<string> => {
  // Note: In a real implementation, we would use JSZip to create a ZIP file
  // For this example, we're just returning a data URL
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('#');
    }, 1000);
  });
};
