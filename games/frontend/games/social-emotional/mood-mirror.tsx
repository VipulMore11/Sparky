"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ExpressionData {
  targetExpression: string;
  detectedExpression: string | null;
  accuracy: number;
  reactionTime: number;
  timestamp: number;
}

const EXPRESSIONS = [
  { name: 'happy', emoji: '😊', description: 'Smile with raised cheeks' },
  { name: 'sad', emoji: '😢', description: 'Frown with downturned mouth' },
  { name: 'surprised', emoji: '😮', description: 'Wide eyes and open mouth' },
  { name: 'angry', emoji: '😠', description: 'Furrowed brow and tight lips' },
  { name: 'neutral', emoji: '😐', description: 'Relaxed facial expression' },
  { name: 'disgusted', emoji: '🤢', description: 'Wrinkled nose and raised lip' }
];

export default function MoodMirror() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [currentExpression, setCurrentExpression] = useState<typeof EXPRESSIONS[0] | null>(null);
  const [results, setResults] = useState<ExpressionData[]>([]);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [totalTrials] = useState(12);
  const [gameComplete, setGameComplete] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [showingExpression, setShowingExpression] = useState(false);
  const [expressionStartTime, setExpressionStartTime] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mockDetection, setMockDetection] = useState(false); // For demo purposes
  const [confidence, setConfidence] = useState<number>(0);

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraPermission(true);
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      setCameraPermission(false);
    }
  }, []);

  // Mock facial expression detection (simulates ML model)
  const mockFacialDetection = useCallback((targetExpression: string): { expression: string; confidence: number } => {
    // Simulate varying accuracy based on expression difficulty
    const accuracyRates = {
      'happy': 0.9,
      'sad': 0.8,
      'surprised': 0.85,
      'angry': 0.75,
      'neutral': 0.95,
      'disgusted': 0.7
    };
    
    const baseAccuracy = accuracyRates[targetExpression as keyof typeof accuracyRates] || 0.8;
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8-1.2 multiplier
    const finalAccuracy = Math.min(baseAccuracy * randomFactor, 1.0);
    
    const isCorrect = Math.random() < finalAccuracy;
    const detectedExpression = isCorrect 
      ? targetExpression 
      : EXPRESSIONS[Math.floor(Math.random() * EXPRESSIONS.length)].name;
    
    const confidence = isCorrect 
      ? 0.7 + Math.random() * 0.3  // 70-100% when correct
      : 0.3 + Math.random() * 0.4; // 30-70% when incorrect
    
    return { expression: detectedExpression, confidence };
  }, []);

  const startGame = async () => {
    if (cameraPermission === null) {
      await initializeCamera();
      return;
    }
    
    if (!cameraPermission) {
      setMockDetection(true); // Enable demo mode without camera
    }
    
    setGameStarted(true);
    setGameComplete(false);
    setResults([]);
    setCurrentTrial(0);
    startTrial();
  };

  const startTrial = useCallback(() => {
    const expression = EXPRESSIONS[Math.floor(Math.random() * EXPRESSIONS.length)];
    setCurrentExpression(expression);
    setShowingExpression(false);
    setIsAnalyzing(false);
    
    // Countdown before showing expression
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setShowingExpression(true);
          setExpressionStartTime(performance.now());
          
          // Auto-capture after 3 seconds of showing expression
          setTimeout(() => {
            captureExpression();
          }, 3000);
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const captureExpression = useCallback(() => {
    if (!currentExpression) return;
    
    setIsAnalyzing(true);
    setShowingExpression(false);
    
    // Simulate analysis time
    setTimeout(() => {
      const reactionTime = performance.now() - expressionStartTime;
      
      let detectedExpression: string;
      let detectedConfidence: number;
      
      if (mockDetection) {
        // Use mock detection for demo
        const detection = mockFacialDetection(currentExpression.name);
        detectedExpression = detection.expression;
        detectedConfidence = detection.confidence;
      } else {
        // In real implementation, this would use actual ML model
        const detection = mockFacialDetection(currentExpression.name);
        detectedExpression = detection.expression;
        detectedConfidence = detection.confidence;
      }
      
      const accuracy = detectedExpression === currentExpression.name ? 100 : 0;
      setConfidence(detectedConfidence);
      
      const result: ExpressionData = {
        targetExpression: currentExpression.name,
        detectedExpression,
        accuracy,
        reactionTime,
        timestamp: performance.now()
      };
      
      setResults(prev => [...prev, result]);
      setIsAnalyzing(false);
      
      // Show result for 2 seconds, then continue
      setTimeout(() => {
        const nextTrial = currentTrial + 1;
        setCurrentTrial(nextTrial);
        
        if (nextTrial >= totalTrials) {
          setGameComplete(true);
          setGameStarted(false);
        } else {
          startTrial();
        }
      }, 2000);
    }, 1500);
  }, [currentExpression, expressionStartTime, mockDetection, mockFacialDetection, currentTrial, totalTrials, startTrial]);

  // Calculate statistics
  const correctExpressions = results.filter(r => r.accuracy === 100).length;
  const overallAccuracy = results.length > 0 ? Math.round((correctExpressions / results.length) * 100) : 0;
  const averageReactionTime = results.length > 0 
    ? Math.round(results.reduce((sum, r) => sum + r.reactionTime, 0) / results.length)
    : 0;

  const expressionAccuracy = EXPRESSIONS.map(expr => {
    const trials = results.filter(r => r.targetExpression === expr.name);
    const correct = trials.filter(r => r.accuracy === 100).length;
    return {
      expression: expr.name,
      emoji: expr.emoji,
      accuracy: trials.length > 0 ? Math.round((correct / trials.length) * 100) : 0,
      trials: trials.length
    };
  });

  const resetGame = () => {
    setGameStarted(false);
    setGameComplete(false);
    setResults([]);
    setCurrentTrial(0);
    setCurrentExpression(null);
    setShowingExpression(false);
    setIsAnalyzing(false);
    setCountdown(0);
  };

  useEffect(() => {
    return () => {
      // Cleanup camera stream
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            😊 Mood Mirror
            <Badge variant="secondary">Emotion Recognition</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Mimic the facial expressions shown on screen. Tests emotion recognition and facial expression accuracy.
          </p>
        </CardHeader>
        <CardContent>
          {!gameStarted && !gameComplete ? (
            <div className="text-center space-y-6">
              {cameraPermission === null && (
                <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Camera Permission Required</h3>
                  <p className="text-sm text-blue-700 mb-4">
                    This game uses your camera to detect facial expressions. Your video is processed locally and not recorded.
                  </p>
                  <Button onClick={initializeCamera} className="mb-2">
                    Enable Camera
                  </Button>
                  <div className="text-xs text-blue-600">
                    Or continue without camera for demo mode
                  </div>
                </div>
              )}

              {cameraPermission === false && (
                <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">Demo Mode</h3>
                  <p className="text-sm text-yellow-700">
                    Camera access not available. The game will simulate expression detection for demonstration.
                  </p>
                </div>
              )}

              <div className="p-6 bg-gray-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-2">How to Play</h3>
                <ul className="text-sm space-y-1 text-left max-w-md mx-auto">
                  <li>• A facial expression will be shown on screen</li>
                  <li>• Mimic that expression with your face</li>
                  <li>• The AI will detect and score your accuracy</li>
                  <li>• Try to match {totalTrials} different expressions</li>
                </ul>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {EXPRESSIONS.map(expr => (
                  <div key={expr.name} className="p-3 bg-white rounded-lg border text-center">
                    <div className="text-3xl mb-1">{expr.emoji}</div>
                    <div className="text-xs font-semibold capitalize">{expr.name}</div>
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={startGame} 
                size="lg" 
                className="w-full md:w-auto"
                disabled={cameraPermission === null}
              >
                Start Expression Game ({totalTrials} trials)
              </Button>
            </div>
          ) : gameComplete ? (
            <div className="text-center space-y-6">
              <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-xl font-bold text-green-800 mb-4">Game Complete! 🎉</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-6">
                  <div className="p-3 bg-white rounded border">
                    <div className="font-semibold text-green-700">Overall Accuracy</div>
                    <div className="text-2xl font-bold text-green-800">{overallAccuracy}%</div>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <div className="font-semibold text-green-700">Avg Response Time</div>
                    <div className="text-2xl font-bold text-green-800">{averageReactionTime}ms</div>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <div className="font-semibold text-green-700">Expressions Tested</div>
                    <div className="text-2xl font-bold text-green-800">{results.length}</div>
                  </div>
                </div>

                {/* Expression Breakdown */}
                <div className="p-4 bg-white rounded border">
                  <h4 className="font-semibold text-green-700 mb-3">Expression Accuracy</h4>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
                    {expressionAccuracy.map(expr => (
                      <div key={expr.expression} className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-2xl mb-1">{expr.emoji}</div>
                        <div className="font-semibold capitalize text-xs">{expr.expression}</div>
                        <div className={`text-lg font-bold ${expr.accuracy >= 80 ? 'text-green-600' : expr.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {expr.accuracy}%
                        </div>
                        <div className="text-xs text-gray-500">({expr.trials})</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <Button onClick={resetGame} size="lg">
                Play Again
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Progress */}
              <div className="flex justify-between items-center text-sm">
                <span>Trial: <span className="font-bold">{currentTrial + 1}/{totalTrials}</span></span>
                <div className="flex gap-4">
                  {results.length > 0 && (
                    <span>Accuracy: <span className="font-bold text-green-600">{overallAccuracy}%</span></span>
                  )}
                  <Button onClick={resetGame} size="sm" variant="outline">
                    Reset
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Camera/Demo View */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-center">
                    {mockDetection ? 'Demo Mode' : 'Your Camera'}
                  </h3>
                  
                  {!mockDetection ? (
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-64 object-cover"
                      />
                      <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-2">📷</div>
                        <div className="text-sm text-gray-600">Demo Mode Active</div>
                        <div className="text-xs text-gray-500">Simulating camera input</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Expression Display */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-center">Target Expression</h3>
                  
                  <div className="bg-gray-50 rounded-lg h-64 flex items-center justify-center">
                    {countdown > 0 && (
                      <div className="text-center">
                        <div className="text-6xl font-bold mb-2">{countdown}</div>
                        <div className="text-lg">Get ready...</div>
                      </div>
                    )}
                    
                    {showingExpression && currentExpression && (
                      <div className="text-center">
                        <div className="text-8xl mb-4">{currentExpression.emoji}</div>
                        <div className="text-xl font-semibold capitalize mb-2">{currentExpression.name}</div>
                        <div className="text-sm text-gray-600">{currentExpression.description}</div>
                        <div className="text-xs text-gray-500 mt-4">Make this expression now!</div>
                      </div>
                    )}
                    
                    {isAnalyzing && (
                      <div className="text-center">
                        <div className="text-4xl mb-4 animate-spin">🔍</div>
                        <div className="text-xl font-semibold">Analyzing...</div>
                        <div className="text-sm text-gray-600">Detecting your expression</div>
                      </div>
                    )}
                    
                    {!countdown && !showingExpression && !isAnalyzing && results.length > 0 && (
                      <div className="text-center">
                        <div className="text-4xl mb-2">
                          {results[results.length - 1].accuracy === 100 ? '✅' : '❌'}
                        </div>
                        <div className="text-lg font-semibold">
                          {results[results.length - 1].accuracy === 100 ? 'Correct!' : 'Try again!'}
                        </div>
                        <div className="text-sm text-gray-600">
                          Detected: {results[results.length - 1].detectedExpression}
                        </div>
                        <div className="text-xs text-gray-500">
                          Confidence: {Math.round(confidence * 100)}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Live Stats */}
              {results.length > 0 && (
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-semibold">Accuracy</div>
                    <div className="text-lg font-bold text-green-600">{overallAccuracy}%</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-semibold">Correct</div>
                    <div className="text-lg font-bold text-blue-600">{correctExpressions}/{results.length}</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-semibold">Avg Time</div>
                    <div className="text-lg font-bold text-purple-600">{averageReactionTime}ms</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}