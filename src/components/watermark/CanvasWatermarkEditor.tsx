import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Watermark } from '@/types/watermark';
import type { SourceImage } from '@/hooks/useImageUploader';

interface CanvasWatermarkEditorProps {
  sourceImage: SourceImage;
  watermarks: Watermark[];
  onWatermarkUpdate: (id: string, update: Partial<Watermark>) => void;
  className?: string;
}

interface HandleInfo {
  type: 'corner' | 'rotate' | 'move';
  position?: 'tl' | 'tr' | 'bl' | 'br';
  x: number;
  y: number;
  size: number;
}

export const CanvasWatermarkEditor = ({ 
  sourceImage, 
  watermarks, 
  onWatermarkUpdate,
  className = ""
}: CanvasWatermarkEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);
  const watermarkImagesRef = useRef<{ [key: string]: HTMLImageElement }>({});
  
  const [selectedWatermark, setSelectedWatermark] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragMode, setDragMode] = useState<'move' | 'resize' | 'rotate' | null>(null);
  const [initialState, setInitialState] = useState<Partial<Watermark> | null>(null);

  // Load source image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      sourceImageRef.current = img;
      redrawCanvas();
    };
    img.src = sourceImage.src;
  }, [sourceImage.src]);

  // Load watermark images
  useEffect(() => {
    watermarks.forEach(watermark => {
      if (!watermarkImagesRef.current[watermark.id]) {
        const img = new Image();
        img.onload = () => {
          watermarkImagesRef.current[watermark.id] = img;
          redrawCanvas();
        };
        img.src = watermark.src;
      }
    });
  }, [watermarks]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const sourceImg = sourceImageRef.current;
    
    if (!canvas || !ctx || !sourceImg) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw source image
    ctx.drawImage(sourceImg, 0, 0, canvas.width, canvas.height);
    
    // Draw watermarks
    watermarks.forEach(watermark => {
      const watermarkImg = watermarkImagesRef.current[watermark.id];
      if (!watermarkImg) return;

      ctx.save();
      
      const x = watermark.position.x * canvas.width;
      const y = watermark.position.y * canvas.height;
      const width = watermarkImg.width * watermark.scale;
      const height = watermarkImg.height * watermark.scale;
      
      // Apply transformations
      ctx.globalAlpha = watermark.opacity;
      ctx.translate(x, y);
      ctx.rotate((watermark.rotation * Math.PI) / 180);
      
      // Draw watermark
      ctx.drawImage(watermarkImg, -width / 2, -height / 2, width, height);
      
      ctx.restore();
      
      // Draw selection handles if selected
      if (selectedWatermark === watermark.id) {
        drawSelectionHandles(ctx, watermark, canvas);
      }
    });
  }, [watermarks, selectedWatermark]);

  const drawSelectionHandles = (ctx: CanvasRenderingContext2D, watermark: Watermark, canvas: HTMLCanvasElement) => {
    const watermarkImg = watermarkImagesRef.current[watermark.id];
    if (!watermarkImg) return;

    const x = watermark.position.x * canvas.width;
    const y = watermark.position.y * canvas.height;
    const width = watermarkImg.width * watermark.scale;
    const height = watermarkImg.height * watermark.scale;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((watermark.rotation * Math.PI) / 180);
    
    // Draw border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(-width / 2, -height / 2, width, height);
    
    // Draw corner handles
    const handleSize = 8;
    const corners = [
      { x: -width / 2, y: -height / 2 }, // top-left
      { x: width / 2, y: -height / 2 },  // top-right
      { x: width / 2, y: height / 2 },   // bottom-right
      { x: -width / 2, y: height / 2 }   // bottom-left
    ];
    
    ctx.fillStyle = '#3b82f6';
    ctx.setLineDash([]);
    corners.forEach(corner => {
      ctx.fillRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
    });
    
    // Draw rotate handle
    const rotateY = -height / 2 - 20;
    ctx.beginPath();
    ctx.arc(0, rotateY, 6, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw line to rotate handle
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -height / 2);
    ctx.lineTo(0, rotateY);
    ctx.stroke();
    
    ctx.restore();
  };

  const getHandleAt = (x: number, y: number, watermark: Watermark, canvas: HTMLCanvasElement): HandleInfo | null => {
    const watermarkImg = watermarkImagesRef.current[watermark.id];
    if (!watermarkImg) return null;

    const centerX = watermark.position.x * canvas.width;
    const centerY = watermark.position.y * canvas.height;
    const width = watermarkImg.width * watermark.scale;
    const height = watermarkImg.height * watermark.scale;
    const rotation = (watermark.rotation * Math.PI) / 180;
    
    // Transform mouse coordinates to watermark space
    const cos = Math.cos(-rotation);
    const sin = Math.sin(-rotation);
    const dx = x - centerX;
    const dy = y - centerY;
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;
    
    const handleSize = 8;
    const tolerance = handleSize;
    
    // Check corner handles
    const corners = [
      { x: -width / 2, y: -height / 2, pos: 'tl' as const },
      { x: width / 2, y: -height / 2, pos: 'tr' as const },
      { x: width / 2, y: height / 2, pos: 'br' as const },
      { x: -width / 2, y: height / 2, pos: 'bl' as const }
    ];
    
    for (const corner of corners) {
      if (Math.abs(localX - corner.x) <= tolerance && Math.abs(localY - corner.y) <= tolerance) {
        return { type: 'corner', position: corner.pos, x, y, size: handleSize };
      }
    }
    
    // Check rotate handle
    const rotateY = -height / 2 - 20;
    if (Math.abs(localX) <= tolerance && Math.abs(localY - rotateY) <= tolerance) {
      return { type: 'rotate', x, y, size: handleSize };
    }
    
    // Check if inside watermark for moving
    if (Math.abs(localX) <= width / 2 && Math.abs(localY) <= height / 2) {
      return { type: 'move', x, y, size: 0 };
    }
    
    return null;
  };

  const constrainPosition = (watermark: Watermark, newX: number, newY: number, canvas: HTMLCanvasElement): { x: number, y: number } => {
    const watermarkImg = watermarkImagesRef.current[watermark.id];
    if (!watermarkImg) return { x: newX, y: newY };

    const width = watermarkImg.width * watermark.scale;
    const height = watermarkImg.height * watermark.scale;
    
    // Calculate bounds considering rotation
    const halfDiagonal = Math.sqrt(width * width + height * height) / 2;
    
    const minX = halfDiagonal / canvas.width;
    const maxX = 1 - halfDiagonal / canvas.width;
    const minY = halfDiagonal / canvas.height;
    const maxY = 1 - halfDiagonal / canvas.height;
    
    return {
      x: Math.max(minX, Math.min(maxX, newX)),
      y: Math.max(minY, Math.min(maxY, newY))
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on any watermark (in reverse order for top-most first)
    for (let i = watermarks.length - 1; i >= 0; i--) {
      const watermark = watermarks[i];
      const handle = getHandleAt(x, y, watermark, canvas);
      
      if (handle) {
        setSelectedWatermark(watermark.id);
        setIsDragging(true);
        setDragStart({ x, y });
        setDragMode(handle.type === 'corner' ? 'resize' : handle.type === 'rotate' ? 'rotate' : 'move');
        setInitialState({ ...watermark });
        canvas.style.cursor = handle.type === 'move' ? 'move' : handle.type === 'rotate' ? 'crosshair' : 'nw-resize';
        return;
      }
    }
    
    // No watermark clicked, deselect
    setSelectedWatermark(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!isDragging) {
      // Update cursor based on hover
      let cursor = 'default';
      for (let i = watermarks.length - 1; i >= 0; i--) {
        const watermark = watermarks[i];
        const handle = getHandleAt(x, y, watermark, canvas);
        if (handle) {
          cursor = handle.type === 'move' ? 'move' : handle.type === 'rotate' ? 'crosshair' : 'nw-resize';
          break;
        }
      }
      canvas.style.cursor = cursor;
      return;
    }

    if (!selectedWatermark || !initialState) return;

    const dx = x - dragStart.x;
    const dy = y - dragStart.y;

    const watermark = watermarks.find(w => w.id === selectedWatermark);
    if (!watermark) return;

    if (dragMode === 'move') {
      const newPosition = constrainPosition(
        watermark,
        initialState.position!.x + dx / canvas.width,
        initialState.position!.y + dy / canvas.height,
        canvas
      );
      onWatermarkUpdate(selectedWatermark, { position: newPosition });
    } else if (dragMode === 'resize') {
      const distance = Math.sqrt(dx * dx + dy * dy);
      const scaleFactor = 1 + (distance / 100) * (dx > 0 || dy > 0 ? 1 : -1);
      const newScale = Math.max(0.1, Math.min(3, initialState.scale! * scaleFactor));
      onWatermarkUpdate(selectedWatermark, { scale: newScale });
    } else if (dragMode === 'rotate') {
      const centerX = watermark.position.x * canvas.width;
      const centerY = watermark.position.y * canvas.height;
      const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
      onWatermarkUpdate(selectedWatermark, { rotation: angle + 90 });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragMode(null);
    setInitialState(null);
    const canvas = canvasRef.current;
    if (canvas) canvas.style.cursor = 'default';
  };

  // Redraw when watermarks change
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Set canvas size when source image loads
  useEffect(() => {
    const canvas = canvasRef.current;
    const sourceImg = sourceImageRef.current;
    
    if (canvas && sourceImg) {
      const maxWidth = 800;
      const maxHeight = 600;
      
      let { width, height } = sourceImg;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      redrawCanvas();
    }
  }, [sourceImage, redrawCanvas]);

  return (
    <div className={`flex justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="border border-border rounded-md shadow-sm cursor-default"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};