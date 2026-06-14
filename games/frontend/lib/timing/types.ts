/**
 * High-precision timing types for cognitive psychology experiments
 * Achieves millisecond-accurate stimulus presentation and response measurement
 */

export interface TimingConfig {
  targetAccuracy: number; // Target timing accuracy in milliseconds
  maxFrameDrops: number; // Maximum allowed frame drops percentage
  calibrationRequired: boolean; // Whether calibration is required before experiments
  audioEnabled: boolean; // Whether audio timing is enabled
}

export interface FrameInfo {
  frameNumber: number;
  timestamp: DOMHighResTimeStamp;
  interval: number;
  jitter: number;
  dropped: boolean;
}

export interface StimulusEvent {
  id: string;
  type: 'visual' | 'audio' | 'mixed';
  scheduledTime: number;
  actualTime?: number;
  duration: number;
  accuracy?: number; // Difference between scheduled and actual
}

export interface ResponseEvent {
  id: string;
  stimulusId: string;
  type: 'keyboard' | 'mouse' | 'touch';
  timestamp: DOMHighResTimeStamp;
  reactionTime: number;
  key?: string;
  button?: number;
  coordinates?: { x: number; y: number };
}

export interface CalibrationResult {
  refreshRate: number;
  meanFrameInterval: number;
  frameJitter: number;
  displayLatency: number;
  inputDelay: number;
  audioLatency: number;
  reliability: number; // 0-1 score
  passed: boolean;
}

export interface TimingReport {
  experimentId: string;
  startTime: number;
  endTime: number;
  totalFrames: number;
  droppedFrames: number;
  meanFrameRate: number;
  stimulusAccuracy: {
    mean: number;
    std: number;
    percentile90: number;
  };
  responseAccuracy: {
    mean: number;
    std: number;
    count: number;
  };
  warnings: string[];
  qualityScore: number; // 0-1 overall quality
}

export interface TimingError extends Error {
  code: 'UNSUPPORTED_BROWSER' | 'CALIBRATION_FAILED' | 'TIMING_DRIFT' | 'FRAME_DROP_EXCEEDED' | 'AUDIO_CONTEXT_FAILED';
  details: any;
}

export interface DisplayInfo {
  refreshRate: number;
  width: number;
  height: number;
  colorDepth: number;
  pixelRatio: number;
}

export interface AudioContextInfo {
  sampleRate: number;
  baseLatency: number;
  outputLatency: number;
  state: AudioContextState;
}

// Event callback types
export type FrameCallback = (frameInfo: FrameInfo) => void;
export type StimulusCallback = (event: StimulusEvent) => void;
export type ResponseCallback = (event: ResponseEvent) => void;
export type ErrorCallback = (error: TimingError) => void;