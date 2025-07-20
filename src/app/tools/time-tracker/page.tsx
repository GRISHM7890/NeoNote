
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer, Play, Pause, RotateCcw, Coffee, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

const modes: { [key in TimerMode]: { duration: number; label: string } } = {
  pomodoro: { duration: 25 * 60, label: 'Work Session' },
  shortBreak: { duration: 5 * 60, label: 'Short Break' },
  longBreak: { duration: 15 * 60, label: 'Long Break' },
};

export default function TimeTrackerPage() {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeRemaining, setTimeRemaining] = useState(modes.pomodoro.duration);
  const [isActive, setIsActive] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeRemaining(modes[mode].duration);
  }, [mode]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsActive(false);
      audioRef.current?.play();
      if (mode === 'pomodoro') {
        const newCompletedCycles = completedCycles + 1;
        setCompletedCycles(newCompletedCycles);
        setMode(newCompletedCycles % 4 === 0 ? 'longBreak' : 'shortBreak');
      } else {
        setMode('pomodoro');
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeRemaining, mode, completedCycles]);

  useEffect(() => {
    resetTimer();
  }, [mode, resetTimer]);

  useEffect(() => {
    // Pre-load the audio file
    if (typeof window !== 'undefined') {
        audioRef.current = new Audio('/sounds/notification.mp3');
    }
  }, []);

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progress = (modes[mode].duration - timeRemaining) / modes[mode].duration * 100;

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex items-center gap-4">
          <Timer className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">Study Time Tracker</h1>
            <p className="text-muted-foreground mt-1">Boost your productivity with the Pomodoro technique.</p>
          </div>
        </header>

        <Card className="bg-secondary/30 max-w-2xl mx-auto">
          <CardHeader className="items-center text-center">
            <CardTitle className="text-2xl">Pomodoro Timer</CardTitle>
            <CardDescription>Focus, take breaks, and stay productive.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-8">
            <div className="flex gap-2 p-1 bg-background/50 rounded-lg">
                {Object.keys(modes).map((key) => (
                    <Button 
                        key={key} 
                        variant={mode === key ? 'secondary' : 'ghost'} 
                        onClick={() => handleModeChange(key as TimerMode)}
                        className="shadow-sm"
                    >
                        {modes[key as TimerMode].label}
                    </Button>
                ))}
            </div>

            <div className="relative w-64 h-64 flex items-center justify-center">
                <svg className="absolute w-full h-full -rotate-90">
                    <circle cx="50%" cy="50%" r="calc(50% - 10px)" strokeWidth="10" stroke="hsl(var(--border))" fill="none" />
                    <circle 
                        cx="50%" 
                        cy="50%" 
                        r="calc(50% - 10px)" 
                        strokeWidth="10" 
                        stroke="hsl(var(--primary))" 
                        fill="none" 
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * (128 - 10)}
                        strokeDashoffset={2 * Math.PI * (128 - 10) * (1 - progress / 100)}
                        className="transition-all duration-1000"
                    />
                </svg>
                <div className="text-center">
                    <p className="text-6xl font-bold font-mono tracking-tighter">{formatTime(timeRemaining)}</p>
                    <p className="text-muted-foreground">{modes[mode].label}</p>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button onClick={toggleTimer} size="lg" className="w-48 h-16 text-lg shadow-glow hover:shadow-glow-sm">
                {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                {isActive ? 'Pause' : 'Start'}
              </Button>
              <Button onClick={resetTimer} variant="outline" size="lg" className="h-16 w-16">
                  <RotateCcw />
              </Button>
            </div>

            <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-accent"/>
                    <span>Cycles: {completedCycles}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Coffee className="w-5 h-5 text-accent"/>
                    <span>Breaks: {Math.floor(completedCycles / 4)} long, {completedCycles - Math.floor(completedCycles / 4)} short</span>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
