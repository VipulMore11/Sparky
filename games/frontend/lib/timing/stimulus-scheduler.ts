/**
 * StimulusScheduler - Precise stimulus presentation timing
 * Schedules and presents visual/audio stimuli with frame-perfect accuracy
 */

import type {
  StimulusEvent,
  StimulusCallback,
  TimingError,
  ErrorCallback
} from './types';
import { FrameSynchronizer } from './frame-synchronizer';

interface ScheduledStimulus {
  id: string;
  type: 'visual' | 'audio' | 'mixed';
  targetFrame: number;
  targetTime: number;
  duration: number;
  element?: HTMLElement;
  audioBuffer?: AudioBuffer;
  onPresent?: () => void;
  onRemove?: () => void;
  preloaded: boolean;
  presented: boolean;
  removed: boolean;
  actualPresentTime?: number;
  actualRemoveTime?: number;
}

export class StimulusScheduler {
  private frameSynchronizer: FrameSynchronizer;
  private scheduledStimuli: Map<string, ScheduledStimulus> = new Map();
  private presentedStimuli: StimulusEvent[] = [];
  private stimulusCallbacks: Set<StimulusCallback> = new Set();
  private errorCallbacks: Set<ErrorCallback> = new Set();
  private preloadFrames = 3; // Frames ahead to preload
  private container: HTMLElement;

  constructor(frameSynchronizer: FrameSynchronizer, container?: HTMLElement) {
    this.frameSynchronizer = frameSynchronizer;
    this.container = container || (typeof document !== "undefined" ? document.body : null as any);

    // Listen to frame events for stimulus presentation
    this.frameSynchronizer.onFrame(this.frameHandler);
  }

  /**
   * Schedule a visual stimulus for presentation
   */
  public scheduleVisual(
    id: string,
    element: HTMLElement,
    targetTime: number,
    duration: number,
    onPresent?: () => void,
    onRemove?: () => void
  ): void {
    const targetFrame = this.frameSynchronizer.timeToFrameNumber(targetTime);

    const stimulus: ScheduledStimulus = {
      id,
      type: 'visual',
      targetFrame,
      targetTime,
      duration,
      element,
      onPresent,
      onRemove,
      preloaded: false,
      presented: false,
      removed: false
    };

    this.scheduledStimuli.set(id, stimulus);
  }

  /**
   * Schedule an audio stimulus for presentation
   */
  public scheduleAudio(
    id: string,
    audioBuffer: AudioBuffer,
    targetTime: number,
    duration: number,
    onPresent?: () => void,
    onRemove?: () => void
  ): void {
    const targetFrame = this.frameSynchronizer.timeToFrameNumber(targetTime);

    const stimulus: ScheduledStimulus = {
      id,
      type: 'audio',
      targetFrame,
      targetTime,
      duration,
      audioBuffer,
      onPresent,
      onRemove,
      preloaded: false,
      presented: false,
      removed: false
    };

    this.scheduledStimuli.set(id, stimulus);
  }

  /**
   * Preload visual resources
   */
  public preloadVisual(element: HTMLElement): Promise<void> {
    return new Promise((resolve, reject) => {
      // Prepare element for presentation
      element.style.position = 'absolute';
      element.style.visibility = 'hidden';
      element.style.opacity = '0';
      element.style.transform = 'translateZ(0)'; // Force GPU layer

      // Add to container
      this.container.appendChild(element);

      // If element contains images, wait for them to load
      const images = element.querySelectorAll('img');
      if (images.length === 0) {
        resolve();
        return;
      }

      let loadedCount = 0;
      const totalImages = images.length;

      const onImageLoad = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          resolve();
        }
      };

      const onImageError = (error: ErrorEvent) => {
        reject(new Error(`Failed to load image: ${error.message}`));
      };

      images.forEach(img => {
        if (img.complete) {
          onImageLoad();
        } else {
          img.addEventListener('load', onImageLoad);
          img.addEventListener('error', onImageError);
        }
      });
    });
  }

  /**
   * Remove a scheduled stimulus
   */
  public removeStimulus(id: string): void {
    const stimulus = this.scheduledStimuli.get(id);
    if (!stimulus) return;

    if (stimulus.presented && !stimulus.removed) {
      this.performRemoval(stimulus);
    }

    this.scheduledStimuli.delete(id);
  }

  /**
   * Clear all scheduled stimuli
   */
  public clearAll(): void {
    this.scheduledStimuli.forEach(stimulus => {
      if (stimulus.presented && !stimulus.removed) {
        this.performRemoval(stimulus);
      }
    });

    this.scheduledStimuli.clear();
  }

  /**
   * Add callback for stimulus events
   */
  public onStimulus(callback: StimulusCallback): () => void {
    this.stimulusCallbacks.add(callback);
    return () => this.stimulusCallbacks.delete(callback);
  }

  /**
   * Add callback for error events
   */
  public onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.add(callback);
    return () => this.errorCallbacks.delete(callback);
  }

  /**
   * Get all presented stimuli
   */
  public getPresentedStimuli(): StimulusEvent[] {
    return [...this.presentedStimuli];
  }

  /**
   * Get stimulus accuracy statistics
   */
  public getAccuracyStats() {
    const accuracies = this.presentedStimuli
      .map(s => s.accuracy)
      .filter(a => a !== undefined) as number[];

    if (accuracies.length === 0) {
      return { mean: 0, std: 0, count: 0, percentile90: 0 };
    }

    const mean = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
    const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - mean, 2), 0) / accuracies.length;
    const std = Math.sqrt(variance);

    const sorted = [...accuracies].sort((a, b) => a - b);
    const percentile90 = sorted[Math.floor(sorted.length * 0.9)];

    return {
      mean: Math.abs(mean),
      std,
      count: accuracies.length,
      percentile90: Math.abs(percentile90)
    };
  }

  /**
   * Private: Frame handler for stimulus presentation
   */
  private frameHandler = (frameInfo: any): void => {
    const currentFrame = frameInfo.frameNumber;
    const currentTime = frameInfo.timestamp;

    // Check for stimuli to preload
    this.scheduledStimuli.forEach(stimulus => {
      if (!stimulus.preloaded && currentFrame >= stimulus.targetFrame - this.preloadFrames) {
        this.preloadStimulus(stimulus);
      }
    });

    // Check for stimuli to present
    this.scheduledStimuli.forEach(stimulus => {
      if (!stimulus.presented && currentFrame >= stimulus.targetFrame) {
        this.presentStimulus(stimulus, currentTime);
      }
    });

    // Check for stimuli to remove
    this.scheduledStimuli.forEach(stimulus => {
      if (stimulus.presented && !stimulus.removed && stimulus.actualPresentTime) {
        const elapsed = currentTime - stimulus.actualPresentTime;
        if (elapsed >= stimulus.duration) {
          this.performRemoval(stimulus, currentTime);
        }
      }
    });
  };

  /**
   * Private: Preload stimulus resources
   */
  private async preloadStimulus(stimulus: ScheduledStimulus): Promise<void> {
    try {
      if (stimulus.type === 'visual' && stimulus.element) {
        await this.preloadVisual(stimulus.element);
      }

      stimulus.preloaded = true;
    } catch (error) {
      this.emitError('TIMING_DRIFT', `Failed to preload stimulus ${stimulus.id}`, error);
    }
  }

  /**
   * Private: Present stimulus at exact time
   */
  private presentStimulus(stimulus: ScheduledStimulus, actualTime: number): void {
    try {
      if (stimulus.type === 'visual' && stimulus.element) {
        // Present visual stimulus
        stimulus.element.style.visibility = 'visible';
        stimulus.element.style.opacity = '1';
      }

      stimulus.presented = true;
      stimulus.actualPresentTime = actualTime;

      // Calculate accuracy
      const accuracy = actualTime - stimulus.targetTime;

      // Create stimulus event
      const event: StimulusEvent = {
        id: stimulus.id,
        type: stimulus.type,
        scheduledTime: stimulus.targetTime,
        actualTime,
        duration: stimulus.duration,
        accuracy
      };

      this.presentedStimuli.push(event);

      // Call presentation callback
      if (stimulus.onPresent) {
        stimulus.onPresent();
      }

      // Notify subscribers
      this.stimulusCallbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Stimulus callback error:', error);
        }
      });

    } catch (error) {
      this.emitError('TIMING_DRIFT', `Failed to present stimulus ${stimulus.id}`, error);
    }
  }

  /**
   * Private: Remove stimulus from display
   */
  private performRemoval(stimulus: ScheduledStimulus, currentTime?: number): void {
    try {
      if (stimulus.type === 'visual' && stimulus.element) {
        stimulus.element.style.visibility = 'hidden';
        stimulus.element.style.opacity = '0';
        // Don't remove from DOM immediately to avoid layout shifts
      }

      stimulus.removed = true;
      stimulus.actualRemoveTime = currentTime || performance.now();

      // Call removal callback
      if (stimulus.onRemove) {
        stimulus.onRemove();
      }

    } catch (error) {
      this.emitError('TIMING_DRIFT', `Failed to remove stimulus ${stimulus.id}`, error);
    }
  }

  /**
   * Private: Emit timing error
   */
  private emitError(code: TimingError['code'], message: string, details?: any): void {
    const error = new Error(message) as TimingError;
    error.code = code;
    error.details = details;

    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error('Error callback failed:', callbackError);
      }
    });
  }
}