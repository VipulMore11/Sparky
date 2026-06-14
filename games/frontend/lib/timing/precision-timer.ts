export interface TimingCalibration {
  networkLatency: number;
  displayRefreshRate: number;
  browserOffset: number;
  audioLatency: number;
}

export interface TimingMeasurement {
  timestamp: number;
  reactionTime: number;
  accuracy: 'high' | 'medium' | 'low';
  calibrationApplied: boolean;
}

export class PrecisionTimer {
  private calibration: TimingCalibration | null = null;
  private isCalibrated = false;
  private performanceObserver: PerformanceObserver | null = null;

  constructor() {
    this.initializePerformanceMonitoring();
  }

  private initializePerformanceMonitoring() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        // Monitor frame timing for display sync
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'frame') {
            // Track frame timing for precision
          }
        });
      });
    }
  }

  async calibrateDevice(): Promise<TimingCalibration> {
    const calibration: TimingCalibration = {
      networkLatency: await this.measureNetworkLatency(),
      displayRefreshRate: await this.detectRefreshRate(),
      browserOffset: this.measureBrowserOffset(),
      audioLatency: await this.measureAudioLatency()
    };

    this.calibration = calibration;
    this.isCalibrated = true;

    return calibration;
  }

  private async measureNetworkLatency(): Promise<number> {
    const measurements: number[] = [];

    for (let i = 0; i < 10; i++) {
      const start = performance.now();
      try {
        // Create a simple ping by fetching a small resource
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        await fetch(origin + '/favicon.ico', {
          method: 'HEAD',
          cache: 'no-cache'
        });
        const end = performance.now();
        measurements.push(end - start);
      } catch {
        measurements.push(0);
      }
    }

    // Return median to avoid outliers
    measurements.sort((a, b) => a - b);
    return measurements[Math.floor(measurements.length / 2)];
  }

  private async detectRefreshRate(): Promise<number> {
    return new Promise((resolve) => {
      let start = performance.now();
      let frameCount = 0;

      const countFrames = () => {
        frameCount++;
        const now = performance.now();

        if (now - start >= 1000) {
          resolve(frameCount);
        } else {
          requestAnimationFrame(countFrames);
        }
      };

      requestAnimationFrame(countFrames);
    });
  }

  private measureBrowserOffset(): number {
    // Measure browser-specific timing differences
    const measurements: number[] = [];

    for (let i = 0; i < 100; i++) {
      const start = performance.now();
      const end = performance.now();
      measurements.push(end - start);
    }

    return measurements.reduce((a, b) => a + b) / measurements.length;
  }

  private async measureAudioLatency(): Promise<number> {
    if (typeof window === 'undefined' || !window.AudioContext) return 0;

    try {
      const audioContext = new AudioContext();
      const baseLatency = audioContext.baseLatency || 0;
      const outputLatency = (audioContext as any).outputLatency || 0;
      await audioContext.close();

      return (baseLatency + outputLatency) * 1000; // Convert to ms
    } catch {
      return 0;
    }
  }

  startTiming(): number {
    if (!this.isCalibrated) {
      console.warn('Timer not calibrated. Results may be less accurate.');
    }

    return performance.now();
  }

  measureReactionTime(startTime: number): TimingMeasurement {
    const rawTime = performance.now() - startTime;
    const calibratedTime = this.calibration ?
      rawTime - this.calibration.browserOffset : rawTime;

    return {
      timestamp: performance.now(),
      reactionTime: Math.max(0, calibratedTime),
      accuracy: this.getAccuracyLevel(calibratedTime),
      calibrationApplied: this.isCalibrated
    };
  }

  private getAccuracyLevel(time: number): 'high' | 'medium' | 'low' {
    if (this.isCalibrated && time > 0) return 'high';
    if (time > 0) return 'medium';
    return 'low';
  }

  // For stimulus presentation timing
  scheduleStimulus(callback: () => void, delayMs: number): number {
    const targetTime = performance.now() + delayMs;

    const checkTime = () => {
      const now = performance.now();
      if (now >= targetTime) {
        callback();
      } else {
        requestAnimationFrame(checkTime);
      }
    };

    requestAnimationFrame(checkTime);
    return targetTime;
  }

  // Schedule multiple stimuli with precise intervals
  scheduleSequence(stimuli: Array<{ callback: () => void; delay: number }>): void {
    let cumulativeDelay = 0;

    stimuli.forEach(stimulus => {
      cumulativeDelay += stimulus.delay;
      this.scheduleStimulus(stimulus.callback, cumulativeDelay);
    });
  }

  getCalibrationReport(): TimingCalibration | null {
    return this.calibration;
  }

  destroy() {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}