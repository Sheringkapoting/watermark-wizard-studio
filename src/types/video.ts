
export interface VideoClip {
  id: string;
  src: string;
  name: string;
  type: string;
  startTime: number;
  endTime: number;
  duration: number;
  thumbnail?: string;
}

export interface VideoTrimming {
  currentTime: number;
  startTrim: number;
  endTrim: number;
}
