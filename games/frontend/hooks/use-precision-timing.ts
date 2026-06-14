import { useState, useEffect, useCallback, useRef } from 'react';
import { PrecisionTimer, TimingMeasurement, TimingCalibration } from '@/lib/timing/precision-timer';

export function usePrecisionTiming() {
  const timerRef = useRef<PrecisionTimer | null>(null);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [calibration, setCalibration] = useState<TimingCalibration | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);

  // Initialize timer on first use
  useEffect(() => {
    if (!timerRef.current) {
      timerRef.current = new PrecisionTimer();
    }

    return () => {
      if (timerRef.current) {
        timerRef.current.destroy();
      }
    };
  }, []);

  const calibrate = useCallback(async () => {
    if (!timerRef.current) return;
    
    setIsCalibrating(true);
    try {
      const result = await timerRef.current.calibrateDevice();
      setCalibration(result);
      setIsCalibrated(true);
      return result;
    } catch (error) {
      console.error('Calibration failed:', error);
      throw error;
    } finally {
      setIsCalibrating(false);
    }
  }, []);

  const startTiming = useCallback(() => {
    if (!timerRef.current) {
      throw new Error('Timer not initialized');
    }
    return timerRef.current.startTiming();
  }, []);

  const measureReactionTime = useCallback((startTime: number): TimingMeasurement => {
    if (!timerRef.current) {
      throw new Error('Timer not initialized');
    }
    return timerRef.current.measureReactionTime(startTime);
  }, []);

  const scheduleStimulus = useCallback((callback: () => void, delayMs: number) => {
    if (!timerRef.current) {
      throw new Error('Timer not initialized');
    }
    return timerRef.current.scheduleStimulus(callback, delayMs);
  }, []);

  const scheduleSequence = useCallback((stimuli: Array<{ callback: () => void; delay: number }>) => {
    if (!timerRef.current) {
      throw new Error('Timer not initialized');
    }
    return timerRef.current.scheduleSequence(stimuli);
  }, []);

  const getCalibrationReport = useCallback(() => {
    if (!timerRef.current) return null;
    return timerRef.current.getCalibrationReport();
  }, []);

  return {
    calibrate,
    startTiming,
    measureReactionTime,
    scheduleStimulus,
    scheduleSequence,
    getCalibrationReport,
    isCalibrated,
    calibration,
    isCalibrating,
    timer: timerRef.current
  };
}