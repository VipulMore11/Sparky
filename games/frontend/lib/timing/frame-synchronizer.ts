/**
 * FrameSynchronizer - Core timing engine for frame-synchronized rendering
 * Achieves millisecond precision through requestAnimationFrame monitoring
 */

import type {
  FrameInfo,
  FrameCallback,
  TimingError,
  DisplayInfo,
  ErrorCallback
} from './types';

export class FrameSynchronizer {
  private frameCount = 0;
  private startTime = 0;
  private lastFrameTime = 0;
  private frameIntervals: number[] = [];
  private frameCallbacks: Set<FrameCallback> = new Set();
  private errorCallbacks: Set<ErrorCallback> = new Set();
  private animationId: number | null = null;
  private isRunning = false;

  // Configuration
  private readonly MAX_INTERVALS_HISTORY = 120; // 2 seconds at 60fps
  private readonly FRAME_DROP_THRESHOLD = 1.5; // Factor above expected interval
  private readonly MIN_REFRESH_RATE = 30; // Minimum acceptable refresh rate

  // Calculated properties
  private refreshRate = 0;
  private expectedInterval = 0;
  private totalDroppedFrames = 0;

  constructor() {
    this.detectDisplayInfo();
  }

  /**
   * Start the frame synchronization loop
   */
  public start(): void {
    if (this.isRunning) {
      console.warn('FrameSynchronizer already running');
      return;
    }

    this.isRunning = true;
    this.frameCount = 0;
    this.totalDroppedFrames = 0;
    this.frameIntervals = [];
    this.startTime = performance.now();
    this.lastFrameTime = this.startTime;

    this.scheduleNextFrame();
  }

  /**
   * Stop the frame synchronization loop
   */
  public stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Add callback for frame events
   */
  public onFrame(callback: FrameCallback): () => void {
    this.frameCallbacks.add(callback);
    return () => this.frameCallbacks.delete(callback);
  }

  /**
   * Add callback for error events
   */
  public onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.add(callback);
    return () => this.errorCallbacks.delete(callback);
  }

  /**
   * Get current refresh rate (calculated from frame intervals)
   */
  public getRefreshRate(): number {
    return this.refreshRate;
  }

  /**
   * Get expected frame interval in milliseconds
   */
  public getFrameInterval(): number {
    return this.expectedInterval;
  }

  /**
   * Get percentage of dropped frames
   */
  public getDroppedFrameRate(): number {
    if (this.frameCount === 0) return 0;
    return (this.totalDroppedFrames / this.frameCount) * 100;
  }

  /**
   * Calculate frame jitter (standard deviation of intervals)
   */
  public getFrameJitter(): number {
    if (this.frameIntervals.length < 2) return 0;

    const mean = this.frameIntervals.reduce((sum, interval) => sum + interval, 0) / this.frameIntervals.length;
    const variance = this.frameIntervals.reduce((sum, interval) => sum + Math.pow(interval - mean, 2), 0) / this.frameIntervals.length;

    return Math.sqrt(variance);
  }

  /**
   * Get timing statistics
   */
  public getStats() {
    return {
      frameCount: this.frameCount,
      refreshRate: this.refreshRate,
      expectedInterval: this.expectedInterval,
      droppedFrames: this.totalDroppedFrames,
      droppedFrameRate: this.getDroppedFrameRate(),
      frameJitter: this.getFrameJitter(),
      isRunning: this.isRunning,
      uptime: this.isRunning ? performance.now() - this.startTime : 0
    };
  }

  /**
   * Predict the timestamp of a future frame
   */
  public predictFrameTime(framesAhead: number): number {
    if (!this.isRunning || this.expectedInterval === 0) {
      throw new Error('FrameSynchronizer not running or interval not established');
    }

    return this.lastFrameTime + (framesAhead * this.expectedInterval);
  }

  /**
   * Calculate which frame number a target time falls on
   */
  public timeToFrameNumber(targetTime: number): number {
    if (!this.isRunning || this.expectedInterval === 0) {
      throw new Error('FrameSynchronizer not running or interval not established');
    }

    const elapsed = targetTime - this.startTime;
    return Math.round(elapsed / this.expectedInterval);
  }

  /**
   * Check if timing environment is suitable for experiments
   */
  public validateEnvironment(): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];

    // Check refresh rate
    if (this.refreshRate < this.MIN_REFRESH_RATE) {
      warnings.push(`Low refresh rate detected: ${this.refreshRate}Hz (minimum: ${this.MIN_REFRESH_RATE}Hz)`);
    }

    // Check frame drops
    const dropRate = this.getDroppedFrameRate();
    if (dropRate > 5) {
      warnings.push(`High frame drop rate: ${dropRate.toFixed(1)}% (should be <1%)`);
    }

    // Check frame jitter
    const jitter = this.getFrameJitter();
    if (jitter > 5) {
      warnings.push(`High frame jitter: ${jitter.toFixed(2)}ms (should be <2ms)`);
    }

    // Check browser support
    if (!this.checkBrowserSupport()) {
      warnings.push('Browser may not support high-precision timing');
    }

    return {
      valid: warnings.length === 0,
      warnings
    };
  }

  /**
   * Private: Core animation frame handler
   */
  private frameHandler = (timestamp: DOMHighResTimeStamp): void => {
    if (!this.isRunning) return;

    this.frameCount++;

    // Calculate frame interval
    const interval = this.frameCount === 1 ? 0 : timestamp - this.lastFrameTime;

    // Detect dropped frames
    let dropped = false;
    if (this.frameCount > 1 && this.expectedInterval > 0) {
      dropped = interval > (this.expectedInterval * this.FRAME_DROP_THRESHOLD);
      if (dropped) {
        this.totalDroppedFrames++;
      }
    }

    // Update interval history (skip first frame)
    if (this.frameCount > 1) {
      this.frameIntervals.push(interval);
      if (this.frameIntervals.length > this.MAX_INTERVALS_HISTORY) {
        this.frameIntervals.shift();
      }

      // Recalculate refresh rate after collecting enough samples
      if (this.frameIntervals.length >= 60) {
        this.calculateRefreshRate();
      }
    }

    // Calculate frame jitter
    const jitter = this.frameCount > 1 ? Math.abs(interval - this.expectedInterval) : 0;

    // Create frame info
    const frameInfo: FrameInfo = {
      frameNumber: this.frameCount,
      timestamp,
      interval,
      jitter,
      dropped
    };

    // Notify callbacks
    this.frameCallbacks.forEach(callback => {
      try {
        callback(frameInfo);
      } catch (error) {
        console.error('Frame callback error:', error);
      }
    });

    this.lastFrameTime = timestamp;
    this.scheduleNextFrame();
  };

  /**
   * Private: Schedule next animation frame
   */
  private scheduleNextFrame(): void {
    if (!this.isRunning) return;

    this.animationId = requestAnimationFrame(this.frameHandler);
  }

  /**
   * Private: Calculate refresh rate from frame intervals
   */
  private calculateRefreshRate(): void {
    if (this.frameIntervals.length < 30) return;

    // Use median interval to avoid outliers
    const sortedIntervals = [...this.frameIntervals].sort((a, b) => a - b);
    const medianInterval = sortedIntervals[Math.floor(sortedIntervals.length / 2)];

    this.expectedInterval = medianInterval;
    this.refreshRate = Math.round(1000 / medianInterval);

    // Validate refresh rate
    if (this.refreshRate < this.MIN_REFRESH_RATE) {
      this.emitError('TIMING_DRIFT', `Detected refresh rate too low: ${this.refreshRate}Hz`);
    }
  }

  /**
   * Private: Detect display information
   */
  private detectDisplayInfo(): DisplayInfo {
    if (typeof window === "undefined") {
      return {
        refreshRate: 60,
        width: 1920,
        height: 1080,
        colorDepth: 24,
        pixelRatio: 1
      };
    }
    return {
      refreshRate: 0, // Will be calculated
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1
    };
  }

  /**
   * Private: Check browser support for timing APIs
   */
  private checkBrowserSupport(): boolean {
    return !!(
      typeof window.requestAnimationFrame === 'function' &&
      typeof window.performance?.now === 'function' &&
      typeof window.cancelAnimationFrame === 'function'
    );
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