
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

// Helper for calculating pixel positions from relative coordinates
export const getPixelPosition = (
  position: Position,
  containerWidth: number,
  containerHeight: number
): { x: number, y: number } => {
  return {
    x: position.x * containerWidth,
    y: position.y * containerHeight
  };
};

// Helper for calculating relative coordinates from pixel positions
export const getRelativePosition = (
  x: number,
  y: number,
  containerWidth: number,
  containerHeight: number
): Position => {
  return {
    x: Math.max(0, Math.min(1, x / containerWidth)),
    y: Math.max(0, Math.min(1, y / containerHeight))
  };
};
