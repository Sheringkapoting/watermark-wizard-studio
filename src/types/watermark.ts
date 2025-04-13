
export interface Position {
  x: number;
  y: number;
}

export interface Watermark {
  id: string;
  src: string;
  opacity: number;
  scale: number;
  position: Position;
  rotation: number;
  isDragging: boolean;
  sourceImageId?: string; // Added to associate watermark with specific source image
}

export interface ImageFormat {
  type: string;
  quality: number;
  label: string;
}

// For debugging position issues
export const debugPosition = (
  position: Position, 
  container: HTMLElement | null
): string => {
  if (!container) return JSON.stringify(position);
  const width = container.clientWidth;
  const height = container.clientHeight;
  return `x: ${Math.round(position.x * width)}px, y: ${Math.round(position.y * height)}px`;
};

// Helper function to constrain position within boundaries
export const constrainPosition = (position: Position): Position => {
  return {
    x: Math.max(0, Math.min(1, position.x)),
    y: Math.max(0, Math.min(1, position.y))
  };
};
