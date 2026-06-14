"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { usePrecisionTiming } from '@/hooks/use-precision-timing';
import { CheckCircle, AlertCircle, Clock, Wifi, Monitor, Volume2 } from 'lucide-react';

export function TimingCalibration() {
  const { calibrate, isCalibrating, calibration, isCalibrated } = usePrecisionTiming();
  const [showDetails, setShowDetails] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);

  const handleCalibrate = async () => {
    setCalibrationProgress(0);
    const progressInterval = setInterval(() => {
      setCalibrationProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await calibrate();
      setCalibrationProgress(100);
    } catch (error) {
      console.error('Calibration failed:', error);
    } finally {
      clearInterval(progressInterval);
    }
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 10) return 'text-green-600';
    if (latency < 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLatencyIcon = (latency: number) => {
    if (latency < 10) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (latency < 25) return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    return <AlertCircle className="w-4 h-4 text-red-600" />;
  };

  const getAccuracyRating = () => {
    if (!calibration) return null;
    
    const avgLatency = (calibration.networkLatency + calibration.audioLatency) / 2;
    if (avgLatency < 15 && calibration.displayRefreshRate >= 60) return 'Excellent';
    if (avgLatency < 30 && calibration.displayRefreshRate >= 30) return 'Good';
    return 'Fair';
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Timing Calibration
          {isCalibrated && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Calibrated
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Calibrate your device for millisecond-accurate measurements in behavioral experiments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isCalibrating && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Calibrating timing accuracy...
            </div>
            <Progress value={calibrationProgress} className="w-full" />
            <div className="text-xs text-muted-foreground">
              Measuring network latency, display refresh rate, and audio latency
            </div>
          </div>
        )}

        {!isCalibrating && !isCalibrated && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Calibration ensures accurate reaction time measurements for your experiments.
            </div>
            <Button onClick={handleCalibrate} className="w-full">
              <Clock className="w-4 h-4 mr-2" />
              Start Calibration
            </Button>
          </div>
        )}

        {calibration && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Accuracy:</span>
              <Badge variant="outline" className={getLatencyColor(calibration.networkLatency)}>
                {getAccuracyRating()}
              </Badge>
            </div>

            <Button 
              variant="outline" 
              onClick={() => setShowDetails(!showDetails)}
              className="w-full"
            >
              {showDetails ? 'Hide' : 'Show'} Technical Details
            </Button>

            {showDetails && (
              <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4" />
                    <span>Network Latency:</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getLatencyIcon(calibration.networkLatency)}
                    <span className={getLatencyColor(calibration.networkLatency)}>
                      {calibration.networkLatency.toFixed(1)}ms
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    <span>Display Refresh:</span>
                  </div>
                  <span className="text-muted-foreground">
                    {calibration.displayRefreshRate}Hz
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Browser Offset:</span>
                  </div>
                  <span className="text-muted-foreground">
                    {calibration.browserOffset.toFixed(2)}ms
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    <span>Audio Latency:</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getLatencyIcon(calibration.audioLatency)}
                    <span className={getLatencyColor(calibration.audioLatency)}>
                      {calibration.audioLatency.toFixed(1)}ms
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleCalibrate} variant="outline" className="flex-1">
                Recalibrate
              </Button>
              {isCalibrated && (
                <Button variant="default" className="flex-1">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Ready for Experiments
                </Button>
              )}
            </div>
          </div>
        )}

        {isCalibrated && (
          <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded border border-blue-200">
            💡 <strong>Tip:</strong> Your timing is now optimized for accurate behavioral measurements. 
            Reaction times will be automatically adjusted for your device's latency.
          </div>
        )}
      </CardContent>
    </Card>
  );
}