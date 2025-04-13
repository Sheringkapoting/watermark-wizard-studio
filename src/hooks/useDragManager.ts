import { useRef, useCallback, RefObject } from "react";
import { Watermark, Position, constrainPosition } from "@/types/watermark";

interface DragPosition {
  id: string;
  x: number;
  y: number;
  posX: number;
  posY: number;
}

export const useDragManager = (
  updateDraggingState: (id: string, isDragging: boolean) => void,
  updateWatermark: (id: string, update: Partial<Watermark>) => void,
  imageContainerRef: RefObject<HTMLDivElement>
) => {
  const startPositionRef = useRef<DragPosition | null>(null);

  const handleDragStart = (id: string, e: React.MouseEvent<HTMLImageElement> | React.TouchEvent<HTMLImageElement>) => {
    if (!imageContainerRef.current) return;
    
    updateDraggingState(id, true);
    
    const containerRect = imageContainerRef.current.getBoundingClientRect();
    
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const watermark = imageContainerRef.current.querySelector(`img[alt="Watermark ${id}"]`);
    if (!watermark) return;
    
    // Get the current data-position-x and data-position-y from the element
    const posX = parseFloat(watermark.getAttribute('data-position-x') || '0.5');
    const posY = parseFloat(watermark.getAttribute('data-position-y') || '0.5');
    
    startPositionRef.current = {
      id,
      x: clientX,
      y: clientY,
      posX,
      posY
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
    
    // Apply constraints to keep watermark inside the image
    // We're already doing Math.max(0, Math.min(1, value)) here
    newPosX = Math.max(0, Math.min(1, newPosX));
    newPosY = Math.max(0, Math.min(1, newPosY));
    
    const id = startPositionRef.current.id;
    
    updateWatermark(id, {
      position: { x: newPosX, y: newPosY }
    });
  }, [imageContainerRef, updateWatermark]);

  const handleDragEnd = useCallback(() => {
    if (!startPositionRef.current) return;
    
    const id = startPositionRef.current.id;
    updateDraggingState(id, false);
    startPositionRef.current = null;
  }, [updateDraggingState]);

  return {
    handleDragStart,
    handleDrag,
    handleDragEnd
  };
};
