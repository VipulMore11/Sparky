"use client"

import { useState, useEffect } from 'react';
import { usePrecisionTiming } from '@/hooks/use-precision-timing';
import { TimingCalibration } from '@/components/experiments/timing-calibration';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer, Zap, Target, TrendingUp } from 'lucide-react';

export function ReactionTimeGame() {
  const { startTiming, measureReactionTime, scheduleStimulus, isCalibrated } = usePrecisionTiming();
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'stimulus' | 'result' | 'too-early'>('waiting');
  const [startTime, setStartTime] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [results, setResults] = useState<number[]>([]);
  const [stimulusColor, setStimulusColor] = useState('#ef4444');

  const colors = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'];

  const startGame = () => {
    if (!isCalibrated) {
      alert('Please calibrate timing first for accurate results');
      return;
    }

    setGameState('ready');
    setReactionTime(null);
    
    // Random delay between 2-5 seconds
    const delay = 2000 + Math.random() * 3000;
    
    scheduleStimulus(() => {
      const timing = startTiming();
      setStartTime(timing);
      setStimulusColor(colors[Math.floor(Math.random() * colors.length)]);
      setGameState('stimulus');
    }, delay);
  };

  const handleClick = () => {
    if (gameState === 'ready') {
      setGameState('too-early');
      setTimeout(() => setGameState('waiting'), 2000);
      return;
    }
    
    if (gameState === 'stimulus') {
      const measurement = measureReactionTime(startTime);
      setReactionTime(measurement.reactionTime);
      setResults(prev => [...prev, measurement.reactionTime].slice(-10)); // Keep last 10
      setGameState('result');
    }
  };

  const getReactionRating = (time: number) => {
    if (time < 200) return { rating: 'Excellent', color: 'bg-green-500' };
    if (time < 300) return { rating: 'Good', color: 'bg-blue-500' };
    if (time < 400) return { rating: 'Average', color: 'bg-yellow-500' };
    return { rating: 'Slow', color: 'bg-red-500' };
  };

  const getAverageTime = () => {
    if (results.length === 0) return 0;
    return results.reduce((a, b) => a + b, 0) / results.length;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Calibration Panel */}
        <TimingCalibration />

        {/* Game Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {getAverageTime().toFixed(0)}ms
                    </div>
                    <div className="text-sm text-muted-foreground">Average</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {Math.min(...results).toFixed(0)}ms
                    </div>
                    <div className="text-sm text-muted-foreground">Best</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Attempts: {results.length}
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Timer className="w-8 h-8 mx-auto mb-2 opacity-50" />
                Complete some trials to see your stats
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Game Area */}
      <Card className="min-h-96">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Reaction Time Test
          </CardTitle>
          <CardDescription>
            Click as fast as you can when the circle appears. Wait for the green "ready" state first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-6 py-8">
            
            {/* Game States */}
            {gameState === 'waiting' && (
              <div className="text-center space-y-4">
                <div className="text-xl text-muted-foreground">
                  Click "Start Test" to begin
                </div>
                <Button 
                  onClick={startGame} 
                  size="lg"
                  disabled={!isCalibrated}
                  className="px-8"
                >
                  <Target className="w-5 h-5 mr-2" />
                  Start Test
                </Button>
                {!isCalibrated && (
                  <div className="text-sm text-muted-foreground">
                    Please calibrate timing first for accurate results
                  </div>
                )}
              </div>
            )}
            
            {gameState === 'ready' && (
              <div 
                onClick={handleClick}
                className="text-center space-y-4 cursor-pointer"
              >
                <div className="text-xl text-green-600 font-semibold">
                  Get ready... 
                </div>
                <div className="text-lg text-muted-foreground">
                  Click anywhere when the circle appears!
                </div>
                <div className="w-24 h-24 border-4 border-green-500 rounded-full mx-auto animate-pulse" />
              </div>
            )}
            
            {gameState === 'stimulus' && (
              <div 
                onClick={handleClick}
                className="cursor-pointer animate-pulse"
              >
                <div 
                  className="w-32 h-32 rounded-full mx-auto shadow-lg"
                  style={{ backgroundColor: stimulusColor }}
                />
              </div>
            )}

            {gameState === 'too-early' && (
              <div className="text-center space-y-4">
                <div className="text-xl text-red-600 font-semibold">
                  Too early!
                </div>
                <div className="text-muted-foreground">
                  Wait for the circle to appear before clicking
                </div>
              </div>
            )}
            
            {gameState === 'result' && reactionTime && (
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-primary">
                    {reactionTime.toFixed(1)}ms
                  </div>
                  <Badge className={getReactionRating(reactionTime).color}>
                    {getReactionRating(reactionTime).rating}
                  </Badge>
                </div>
                
                <div className="flex gap-2 justify-center">
                  <Button 
                    onClick={() => setGameState('waiting')} 
                    variant="outline"
                  >
                    Try Again
                  </Button>
                  <Button onClick={startGame}>
                    Next Trial
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Instructions:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Calibrate timing for maximum accuracy</li>
              <li>Click "Start Test" and wait for the colored circle</li>
              <li>Click as fast as possible when the circle appears</li>
              <li>Avoid clicking before the circle appears (too early)</li>
              <li>Average human reaction time is 200-300ms</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}