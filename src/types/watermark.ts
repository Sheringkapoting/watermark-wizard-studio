
export interface Position {
  x: number;
  y: number;
}

export interface WatermarkBase {
  id: string;
  type: 'image' | 'text';
  position: Position;
  opacity: number;
  scale: number;
  rotation: number;
  zIndex: number;
}

export interface ImageWatermark extends WatermarkBase {
  type: 'image';
  src: string;
}

export interface TextWatermark extends WatermarkBase {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
}

export type Watermark = ImageWatermark | TextWatermark;

export interface SourceImage {
  id: string;
  src: string;
  name: string;
  watermarks: Watermark[];
  resultSrc?: string;
}
