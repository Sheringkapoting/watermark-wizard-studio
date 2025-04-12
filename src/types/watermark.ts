
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
