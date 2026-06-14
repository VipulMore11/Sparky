"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Point {
  x: number;
  y: number;
  value: string | number;
  id: string;
  connected: boolean;
}

type TrailType = 'numbers' | 'letters' | 'mixed';

export default function TrailTracker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [currentTarget, setCurrentTarget] = useState<string | number | null>(null);
  const [connectedPoints, setConnectedPoints] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [trailType, setTrailType] = useState<TrailType>('numbers');
  const [startTime, setStartTime] = useState<number>(0);
  const [completionTime, setCompletionTime] = useState<number>(0);
  const [errors, setErrors] = useState<number>(0);
  const [currentPath, setCurrentPath] = useState<{ x: number, y: number }[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [scores, setScores] = useState<{ type: TrailType, time: number, errors: number }[]>([]);

  const getDifficultySettings = (diff: 'easy' | 'medium' | 'hard') => {
    switch (diff) {
      case 'easy': return { count: 10, radius: 30 };
      case 'medium': return { count: 15, radius: 25 };
      case 'hard': return { count: 20, radius: 20 };
    }
  };

  const generateSequence = useCallback((type: TrailType, count: number = 15) => {
    switch (type) {
      case 'numbers':
        return Array.from({ length: count }, (_, i) => i + 1);
      case 'letters':
        return Array.from({ length: count }, (_, i) => String.fromCharCode(65 + i));
      case 'mixed':
        const mixed: (string | number)[] = [];
        for (let i = 0; i < Math.floor(count / 2); i++) {
          mixed.push(i + 1);
          if (i < Math.floor(count / 2)) {
            mixed.push(String.fromCharCode(65 + i));
          }
        }
        return mixed.slice(0, count);
      default:
        return Array.from({ length: count }, (_, i) => i + 1);
    }
  }, []);

  const generateRandomPoints = useCallback((sequence: (string | number)[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return [];

    const padding = 60;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;
    const { radius } = getDifficultySettings(difficulty);

    const points: Point[] = [];
    const minDistance = radius * 2.5; // Minimum distance between points

    for (let i = 0; i < sequence.length; i++) {
      let attempts = 0;
      let validPosition = false;
      let x: number = 0;
      let y: number = 0;

      while (!validPosition && attempts < 100) {
        x = padding + Math.random() * width;
        y = padding + Math.random() * height;

        validPosition = points.every(point => {
          const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
          return distance >= minDistance;
        });

        attempts++;
      }

      points.push({
        x: x || padding + Math.random() * width,
        y: y || padding + Math.random() * height,
        value: sequence[i],
        id: `point-${i}`,
        connected: false
      });
    }

    return points;
  }, [difficulty]);

  const startGame = (type: TrailType) => {
    setTrailType(type);
    setGameStarted(true);
    setGameCompleted(false);
    setConnectedPoints([]);
    setErrors(0);
    setCurrentPath([]);
    setCompletionTime(0);

    const { count } = getDifficultySettings(difficulty);
    const sequence = generateSequence(type, count);
    const newPoints = generateRandomPoints(sequence);
    setPoints(newPoints);
    setCurrentTarget(sequence[0]);
    setStartTime(performance.now());
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameStarted || gameCompleted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    const { radius } = getDifficultySettings(difficulty);

    const clickedPoint = points.find(point => {
      const distance = Math.sqrt(
        Math.pow(clickX - point.x, 2) + Math.pow(clickY - point.y, 2)
      );
      return distance <= radius;
    });

    if (clickedPoint) {
      if (clickedPoint.value === currentTarget && !connectedPoints.includes(clickedPoint.id)) {
        // Correct point clicked
        const newConnectedPoints = [...connectedPoints, clickedPoint.id];
        setConnectedPoints(newConnectedPoints);
        setCurrentPath(prev => [...prev, { x: clickedPoint.x, y: clickedPoint.y }]);

        // Update points to mark as connected
        setPoints(prev =>
          prev.map(p =>
            p.id === clickedPoint.id ? { ...p, connected: true } : p
          )
        );

        // Check if game is complete
        if (newConnectedPoints.length === points.length) {
          const finalTime = performance.now() - startTime;
          setGameCompleted(true);
          setCompletionTime(finalTime);

          // Save score
          const newScore = { type: trailType, time: finalTime, errors };
          setScores(prev => [...prev, newScore].slice(-10)); // Keep last 10 scores
        } else {
          // Set next target
          const { count } = getDifficultySettings(difficulty);
          const sequence = generateSequence(trailType, count);
          setCurrentTarget(sequence[newConnectedPoints.length]);
        }
      } else if (!connectedPoints.includes(clickedPoint.id)) {
        // Wrong point clicked (but not already connected)
        setErrors(prev => prev + 1);
      }
    }
  };

  // Canvas drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { radius } = getDifficultySettings(difficulty);

    // Draw connections
    if (currentPath.length > 1) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y);
      }
      ctx.stroke();

      // Add arrow indicators
      for (let i = 1; i < currentPath.length; i++) {
        const from = currentPath[i - 1];
        const to = currentPath[i];
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        const headLength = 15;

        ctx.strokeStyle = '#1d4ed8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(to.x, to.y);
        ctx.lineTo(
          to.x - headLength * Math.cos(angle - Math.PI / 6),
          to.y - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(to.x, to.y);
        ctx.lineTo(
          to.x - headLength * Math.cos(angle + Math.PI / 6),
          to.y - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      }
    }

    // Draw points
    points.forEach(point => {
      const isConnected = point.connected;

      // Shadow
      ctx.beginPath();
      ctx.arc(point.x + 2, point.y + 2, radius, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fill();

      // Circle - all points look the same (no highlighting)
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);

      if (isConnected) {
        ctx.fillStyle = '#10b981'; // Green for completed points
      } else {
        ctx.fillStyle = '#e5e7eb'; // Gray for all remaining points
      }

      ctx.fill();
      ctx.strokeStyle = isConnected ? '#059669' : '#9ca3af';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      ctx.fillStyle = isConnected ? 'white' : '#374151';
      ctx.font = `bold ${Math.max(14, radius - 6)}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(point.value.toString(), point.x, point.y);
    });

    // Add game state indicator if no points
    if (points.length === 0 && gameStarted) {
      ctx.fillStyle = '#6b7280';
      ctx.font = '20px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Generating points...', canvas.width / 2, canvas.height / 2);
    }
  }, [points, currentTarget, currentPath, difficulty, gameStarted]);

  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setPoints([]);
    setConnectedPoints([]);
    setCurrentTarget(null);
    setCurrentPath([]);
    setErrors(0);
    setCompletionTime(0);
  };

  const calculateScore = () => {
    if (completionTime === 0) return 0;
    const baseScore = 1000;
    const timeBonus = Math.max(0, 500 - (completionTime / 100));
    const errorPenalty = errors * 50;
    const difficultyMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2;
    return Math.round((baseScore + timeBonus - errorPenalty) * difficultyMultiplier);
  };

  const getBestTime = (type: TrailType) => {
    const typeScores = scores.filter(s => s.type === type);
    if (typeScores.length === 0) return null;
    return Math.min(...typeScores.map(s => s.time));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <Link href="/games" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
          ← Back to Games
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              🔢 Trail Tracker
              <Badge variant="secondary">Cognitive Test</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Connect numbers or letters in sequential order as quickly as possible. No visual hints - find the next one yourself! Tests memory, visual scanning, and processing speed.
            </p>
          </CardHeader>
        </Card>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Game Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              {!gameStarted ? (
                <div className="space-y-6">
                  {gameCompleted && (
                    <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                      <h3 className="text-xl font-bold text-green-800 mb-4">Excellent Work! 🎉</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="font-semibold text-gray-700">Time</div>
                          <div className="text-xl font-bold text-blue-600">
                            {(completionTime / 1000).toFixed(2)}s
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-700">Errors</div>
                          <div className="text-xl font-bold text-red-600">{errors}</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-700">Score</div>
                          <div className="text-xl font-bold text-green-600">{calculateScore()}</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-700">Difficulty</div>
                          <div className="text-xl font-bold text-purple-600 capitalize">{difficulty}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Difficulty Selection */}
                  <div className="text-center space-y-3">
                    <h3 className="text-lg font-semibold">Difficulty Level</h3>
                    <div className="flex justify-center gap-2">
                      {(['easy', 'medium', 'hard'] as const).map((diff) => (
                        <Button
                          key={diff}
                          onClick={() => setDifficulty(diff)}
                          variant={difficulty === diff ? "default" : "outline"}
                          size="sm"
                        >
                          {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Easy: 10 points | Medium: 15 points | Hard: 20 points
                    </p>
                  </div>

                  {/* Trail Type Selection */}
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold">Choose Trail Type</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button onClick={() => startGame('numbers')} size="lg" variant="outline" className="h-16">
                        <div className="text-center">
                          <div className="font-semibold">Numbers</div>
                          <div className="text-xs text-muted-foreground">1→2→3→4...</div>
                        </div>
                      </Button>
                      <Button onClick={() => startGame('letters')} size="lg" variant="outline" className="h-16">
                        <div className="text-center">
                          <div className="font-semibold">Letters</div>
                          <div className="text-xs text-muted-foreground">A→B→C→D...</div>
                        </div>
                      </Button>
                      <Button onClick={() => startGame('mixed')} size="lg" variant="outline" className="h-16">
                        <div className="text-center">
                          <div className="font-semibold">Mixed</div>
                          <div className="text-xs text-muted-foreground">1→A→2→B...</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Game Stats */}
                  <div className="flex flex-wrap justify-between items-center text-sm gap-4">
                    <div className="flex gap-4 flex-wrap">
                      <span>Find & Connect: <span className="font-bold text-blue-600 text-lg">Next in Sequence</span></span>
                      <span>Progress: <span className="font-bold text-green-600">{connectedPoints.length}/{points.length}</span></span>
                      <span>Errors: <span className="font-bold text-red-600">{errors}</span></span>
                      <span>Time: <span className="font-bold text-blue-600">{((performance.now() - startTime) / 1000).toFixed(1)}s</span></span>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {difficulty.toUpperCase()} • {trailType.toUpperCase()}
                      </Badge>
                      <Button onClick={resetGame} size="sm" variant="outline">
                        Reset
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(connectedPoints.length / points.length) * 100}%` }}
                    ></div>
                  </div>

                  {/* Game Canvas */}
                  <div className="border rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 relative">
                    <canvas
                      ref={canvasRef}
                      width={800}
                      height={600}
                      onClick={handleCanvasClick}
                      className="cursor-pointer w-full max-w-full h-auto"
                      style={{ display: 'block' }}
                    />

                    {/* Fallback display if canvas fails */}
                    {points.length === 0 && gameStarted && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="text-center">
                          <div className="text-4xl mb-2">⚠</div>
                          <p className="text-gray-600">Loading game points...</p>
                          <Button onClick={() => startGame(trailType)} className="mt-2" size="sm">
                            Retry
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Instructions - No Target Shown */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-800 mb-2">
                        🧠 Find and connect the {trailType} in correct sequence
                      </p>
                      <p className="text-xs text-gray-600">
                        Green circles = Already connected • Gray circles = Find the next one yourself!
                      </p>
                      {trailType === 'mixed' && (
                        <p className="text-xs text-purple-600 mt-1">
                          Mixed Trail: Alternate between numbers and letters (1→A→2→B→3→C...)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Debug Info (only show if there might be issues) */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="bg-gray-100 p-2 rounded text-xs text-gray-600">
                      Debug: Points={points.length}, Canvas={canvasRef.current ? 'OK' : 'Not ready'}, Mode=No-Assist
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar with Stats and Info */}
        <div className="space-y-4">
          {/* Best Times */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Bests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(['numbers', 'letters', 'mixed'] as const).map((type) => {
                const bestTime = getBestTime(type);
                return (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{type}</span>
                    <span className="text-sm font-mono">
                      {bestTime ? `${(bestTime / 1000).toFixed(2)}s` : '--'}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Research Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About This Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Measures:</strong> Executive function, visual scanning, task switching</p>
              <p><strong>Clinical Use:</strong> Trail Making Test (TMT) variant used in neuropsychological assessment</p>
              <p><strong>Technology:</strong> Canvas-based rendering with precise click detection and path visualization</p>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p>• Find the next number/letter in sequence</p>
              <p>• No highlighting - use your memory!</p>
              <p>• Green circles show completed connections</p>
              <p>• Gray circles are remaining points</p>
              <p>• Avoid clicking wrong points (errors count)</p>
              <p>• Complete the trail as fast as possible</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}