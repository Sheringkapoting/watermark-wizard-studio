
import React, { useRef, useState, useEffect } from 'react';
import { Watermark, Position } from '@/types/watermark';
import { cn } from '@/lib/utils';

interface InteractiveWatermarkProps {
  watermark: Watermark;
  containerWidth: number;
  containerHeight: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Watermark>) => void;
  onRemove: () => void;
}

export const InteractiveWatermark: React.FC<InteractiveWatermarkProps> = ({
  watermark,
  containerWidth,
  containerHeight,
  isSelected,
  onSelect,
  onUpdate,
  onRemove
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const startPositionRef = useRef<{ x: number, y: number, posX: number, posY: number } | null>(null);
  const startScaleRef = useRef<number>(1);
  
  // Calculate actual position in pixels
  const posX = containerWidth * watermark.position.x;
  const posY = containerHeight * watermark.position.y;
  
  // Handle drag start
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    
    // Get current mouse/touch position
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    startPositionRef.current = {
      x: clientX,
      y: clientY,
      posX: watermark.position.x,
      posY: watermark.position.y
    };
  };
  
  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onSelect();
    setIsResizing(true);
    startScaleRef.current = watermark.scale;
    
    // Get current mouse/touch position
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    startPositionRef.current = {
      x: clientX,
      y: clientY,
      posX: 0,
      posY: 0
    };
  };
  
  // Handle wheel for scaling
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!isSelected) return;
    
    const delta = e.deltaY * -0.01;
    const newScale = Math.max(0.1, Math.min(3, watermark.scale + delta));
    
    onUpdate({ scale: newScale });
  };
  
  // Global mouse/touch move handler
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if ((!isDragging && !isResizing) || !startPositionRef.current) return;
      
      e.preventDefault();
      
      // Get current mouse/touch position
      let clientX: number, clientY: number;
      
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      
      if (isDragging) {
        // Calculate movement as proportion of container
        const deltaX = (clientX - startPositionRef.current.x) / containerWidth;
        const deltaY = (clientY - startPositionRef.current.y) / containerHeight;
        
        // Apply movement to starting position
        let newPosX = startPositionRef.current.posX + deltaX;
        let newPosY = startPositionRef.current.posY + deltaY;
        
        // Clamp values between 0 and 1
        newPosX = Math.max(0, Math.min(1, newPosX));
        newPosY = Math.max(0, Math.min(1, newPosY));
        
        onUpdate({ position: { x: newPosX, y: newPosY } });
      } else if (isResizing) {
        // Calculate distance moved
        const deltaX = clientX - startPositionRef.current.x;
        const deltaY = clientY - startPositionRef.current.y;
        
        // Use the greater of the two changes
        const delta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
        const sign = Math.abs(deltaX) > Math.abs(deltaY) 
          ? Math.sign(deltaX) 
          : Math.sign(deltaY);
        
        // Calculate scale factor (adjust sensitivity as needed)
        const scaleFactor = sign * delta * 0.01;
        const newScale = Math.max(0.1, Math.min(3, startScaleRef.current + scaleFactor));
        
        onUpdate({ scale: newScale });
      }
    };
    
    const handleEnd = () => {
      setIsDragging(false);
      setIsResizing(false);
      startPositionRef.current = null;
    };
    
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchend', handleEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, isResizing, containerWidth, containerHeight, onUpdate]);
  
  // Rotation control handler
  const handleRotation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRotation = parseInt(e.target.value, 10);
    onUpdate({ rotation: newRotation });
  };
  
  // Opacity control handler
  const handleOpacity = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOpacity = parseFloat(e.target.value);
    onUpdate({ opacity: newOpacity });
  };
  
  return (
    <div
      ref={elementRef}
      className={cn(
        "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move touch-none",
        isSelected && "outline outline-2 outline-blue-500"
      )}
      style={{
        left: `${posX}px`,
        top: `${posY}px`,
        opacity: watermark.opacity,
        transform: `translate(-50%, -50%) scale(${watermark.scale}) rotate(${watermark.rotation}deg)`,
        zIndex: watermark.zIndex,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      onWheel={handleWheel}
    >
      {watermark.type === 'image' ? (
        <img
          src={watermark.src}
          alt="Watermark"
          className="pointer-events-none select-none max-w-full max-h-full"
          draggable={false}
        />
      ) : (
        <div 
          className="pointer-events-none select-none text-white"
          style={{
            fontFamily: watermark.fontFamily,
            fontSize: `${watermark.fontSize}px`,
            fontWeight: watermark.fontWeight,
            color: watermark.color,
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          {watermark.content}
        </div>
      )}
      
      {isSelected && (
        <>
          <div 
            className="absolute -right-4 -bottom-4 w-8 h-8 bg-blue-500 rounded-full cursor-se-resize flex items-center justify-center"
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
          >
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </div>
          <div className="absolute -right-4 -top-12 bg-white border rounded-md shadow-md p-1 flex flex-col gap-1">
            <button 
              className="hover:bg-red-100 rounded p-1"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
