"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Mascot, SpeechBubble } from '@/components/mascot';
import { Timer, RotateCcw, Target } from 'lucide-react';

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
  const [currentPath, setCurrentPath] = useState<{x: number, y: number}[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

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
    const minDistance = radius * 2.5;

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
    
    setTimeout(() => {
      const { count } = getDifficultySettings(difficulty);
      const sequence = generateSequence(type, count);
      const newPoints = generateRandomPoints(sequence);
      setPoints(newPoints);
      setCurrentTarget(sequence[0]);
      setStartTime(performance.now());
    }, 50);
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
        const newConnectedPoints = [...connectedPoints, clickedPoint.id];
        setConnectedPoints(newConnectedPoints);
        setCurrentPath(prev => [...prev, { x: clickedPoint.x, y: clickedPoint.y }]);

        setPoints(prev => 
          prev.map(p => 
            p.id === clickedPoint.id ? { ...p, connected: true } : p
          )
        );

        if (newConnectedPoints.length === points.length) {
          const finalTime = performance.now() - startTime;
          setGameCompleted(true);
          setCompletionTime(finalTime);
        } else {
          const { count } = getDifficultySettings(difficulty);
          const sequence = generateSequence(trailType, count);
          setCurrentTarget(sequence[newConnectedPoints.length]);
        }
      } else if (!connectedPoints.includes(clickedPoint.id)) {
        setErrors(prev => prev + 1);
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 500;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { radius } = getDifficultySettings(difficulty);

    if (currentPath.length > 1) {
      ctx.strokeStyle = '#f97316'; // orange-500
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y);
      }
      ctx.stroke();

      for (let i = 1; i < currentPath.length; i++) {
        const from = currentPath[i - 1];
        const to = currentPath[i];
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        const headLength = 15;
        
        ctx.strokeStyle = '#ea580c'; // orange-600
        ctx.lineWidth = 3;
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

    points.forEach(point => {
      const isConnected = point.connected;

      ctx.beginPath();
      ctx.arc(point.x + 3, point.y + 3, radius, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = isConnected ? '#f97316' : '#ffffff'; // orange-500 or white
      ctx.fill();
      ctx.strokeStyle = isConnected ? '#ea580c' : '#cbd5e1'; // orange-600 or slate-300
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = isConnected ? 'white' : '#334155'; // slate-700
      ctx.font = `900 ${Math.max(16, radius - 4)}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(point.value.toString(), point.x, point.y + 1);
    });

    if (points.length === 0 && gameStarted && !gameCompleted) {
      ctx.fillStyle = '#64748b';
      ctx.font = '700 24px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Loading dots...', canvas.width / 2, canvas.height / 2);
    }
  }, [points, currentTarget, currentPath, difficulty, gameStarted, gameCompleted]);

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

  return (
    <DashboardShell activeItem="games">
      <div className="mx-auto w-full max-w-4xl pb-12">
        <Card className="overflow-hidden rounded-3xl border-2 border-b-[8px] border-blue-200 bg-white">
          <CardHeader className="border-b-2 bg-blue-50 px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
              <div>
                <CardTitle className="mb-2 flex items-center gap-3 text-3xl font-black text-foreground">
                  🔢 Path Finder
                  <Badge variant="secondary" className="rounded-xl border-2 border-blue-200 bg-blue-100 px-3 py-1 text-sm font-extrabold uppercase text-blue-800">
                    Brain Teaser
                  </Badge>
                </CardTitle>
                <p className="font-semibold text-muted-foreground">
                  Connect the dots in order as fast as you can!
                </p>
              </div>
              <Mascot size={80} animate={!gameStarted} />
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {!gameStarted ? (
              <div className="flex flex-col items-center space-y-8 py-4">
                <SpeechBubble tail="bottom" className="text-lg font-bold">
                  {gameCompleted ? "Awesome path finding! Want to try a harder one?" : "Ready to test your memory and speed?"}
                </SpeechBubble>

                {gameCompleted && (
                  <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
                    <div className="flex flex-col items-center rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 p-6 text-center">
                      <span className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Time</span>
                      <span className="text-4xl font-black text-blue-600">{(completionTime / 1000).toFixed(1)}s</span>
                    </div>
                    <div className="flex flex-col items-center rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 p-6 text-center">
                      <span className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Errors</span>
                      <span className="text-4xl font-black text-red-500">{errors}</span>
                    </div>
                    <div className="flex flex-col items-center rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 p-6 text-center">
                      <span className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Score</span>
                      <span className="text-4xl font-black text-green-600">{calculateScore()}</span>
                    </div>
                  </div>
                )}

                <div className="w-full max-w-lg rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 p-6">
                  <h3 className="mb-4 text-center text-sm font-bold uppercase tracking-widest text-muted-foreground">Difficulty</h3>
                  <div className="flex justify-center gap-3">
                    {(['easy', 'medium', 'hard'] as const).map((diff) => (
                      <Button
                        key={diff}
                        onClick={() => setDifficulty(diff)}
                        variant={difficulty === diff ? "default" : "secondary"}
                        className={`rounded-xl border-b-[4px] px-6 py-6 text-sm font-bold uppercase transition-all active:translate-y-1 active:border-b-0 ${difficulty === diff ? "border-primary bg-primary text-primary-foreground" : "border-gray-200 bg-white"}`}
                      >
                        {diff}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid w-full max-w-lg grid-cols-1 gap-4 sm:grid-cols-3">
                  <Button onClick={() => startGame('numbers')} className="h-24 flex-col rounded-2xl border-2 border-b-[6px] border-orange-200 bg-white text-orange-600 hover:bg-orange-50 active:translate-y-1 active:border-b-2">
                    <span className="text-lg font-black uppercase">Numbers</span>
                    <span className="text-xs font-bold opacity-70">1→2→3...</span>
                  </Button>
                  <Button onClick={() => startGame('letters')} className="h-24 flex-col rounded-2xl border-2 border-b-[6px] border-green-200 bg-white text-green-600 hover:bg-green-50 active:translate-y-1 active:border-b-2">
                    <span className="text-lg font-black uppercase">Letters</span>
                    <span className="text-xs font-bold opacity-70">A→B→C...</span>
                  </Button>
                  <Button onClick={() => startGame('mixed')} className="h-24 flex-col rounded-2xl border-2 border-b-[6px] border-purple-200 bg-white text-purple-600 hover:bg-purple-50 active:translate-y-1 active:border-b-2">
                    <span className="text-lg font-black uppercase">Mixed</span>
                    <span className="text-xs font-bold opacity-70">1→A→2→B...</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between rounded-2xl border-2 border-b-[4px] border-gray-100 bg-gray-50 px-6 py-4 gap-4">
                  <div className="flex gap-8">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Target className="h-3 w-3"/> Find</span>
                      <span className="text-2xl font-black text-blue-600">{currentTarget || "-"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">Progress</span>
                      <span className="text-2xl font-black text-green-600">{connectedPoints.length}/{getDifficultySettings(difficulty).count}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">Errors</span>
                      <span className="text-2xl font-black text-red-500">{errors}</span>
                    </div>
                  </div>
                  <Button onClick={resetGame} variant="outline" className="rounded-xl border-2 font-bold shadow-sm">
                    <RotateCcw className="mr-2 h-4 w-4" /> Reset
                  </Button>
                </div>

                <div className="w-full overflow-hidden rounded-full bg-gray-200">
                  <div 
                    className="h-3 rounded-full bg-orange-500 transition-all duration-300"
                    style={{ width: `${(connectedPoints.length / getDifficultySettings(difficulty).count) * 100}%` }}
                  ></div>
                </div>

                <div className="relative overflow-hidden rounded-3xl border-4 border-gray-100 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className="w-full cursor-pointer touch-none"
                    style={{ display: 'block' }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
