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

export interface VideoSegment {
  id: string;
  startTime: number;
  endTime: number;
  color: string;
  name: string;
}

export interface VideoEditorState {
  currentTime: number;
  isPlaying: boolean;
  segments: VideoSegment[];
  selectedSegmentId: string | null;
  zoom: number;
}