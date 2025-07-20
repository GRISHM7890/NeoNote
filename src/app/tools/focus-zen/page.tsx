
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Loader2, Sparkles, Wand2, Timer, Settings, Play, Music, MessageCircle, Info, Wind } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateFocusAmbiance, type GenerateFocusAmbianceInput, type GenerateFocusAmbianceOutput } from '@/ai/flows/ai-focus-ambiance-generator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const moods = ["Calm", "Energetic", "Mysterious", "Uplifting", "Focused"];
const durations = [15, 25, 45, 60];

type SessionState = 'setup' | 'generating' | 'active' | 'finished';

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export default function FocusZenPage() {
  const { toast } = useToast();
  const [sessionState, setSessionState] = useState<SessionState>('setup');

  // Setup State
  const [topic, setTopic] = useState('');
  const [mood, setMood] = useState('Focused');
  const [duration, setDuration] = useState(25);
  
  // Active State
  const [ambiance, setAmbiance] = useState<GenerateFocusAmbianceOutput | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (sessionState === 'active' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (sessionState === 'active' && timeRemaining === 0) {
      setSessionState('finished');
      toast({ title: "Session Complete!", description: "Great work! You've completed your focus session." });
    }
    return () => { if(interval) clearInterval(interval); };
  }, [sessionState, timeRemaining, toast]);
  
  // Affirmation rotation logic
  const [currentAffirmationIndex, setCurrentAffirmationIndex] = useState(0);
  useEffect(() => {
    if (sessionState !== 'active' || !ambiance?.affirmations?.length) return;
    const interval = setInterval(() => {
        setCurrentAffirmationIndex(prev => (prev + 1) % ambiance.affirmations.length);
    }, 15000); // Change affirmation every 15 seconds
    return () => clearInterval(interval);
  }, [sessionState, ambiance]);

  const handleStartSession = async () => {
    if (!topic || !mood || !duration) {
      toast({ title: 'Missing Details', description: 'Please fill out all fields to start.', variant: 'destructive' });
      return;
    }
    setSessionState('generating');
    setAmbiance(null);

    try {
      const result = await generateFocusAmbiance({ topic, mood, durationMinutes: duration });
      setAmbiance(result);
      setTimeRemaining(duration * 60);
      setSessionState('active');
    } catch (error) {
      console.error(error);
      toast({ title: 'AI Error', description: 'Failed to generate a focus ambiance.', variant: 'destructive' });
      setSessionState('setup');
    }
  };
  
  const resetSession = () => {
    setSessionState('setup');
    setAmbiance(null);
    setTopic('');
  }

  const backgroundImageUrl = useMemo(() => {
    if (!ambiance?.imagePrompt) return `https://placehold.co/1920x1080.png`;
    const keywords = ambiance.imagePrompt.split(" ").slice(0,2).join('+');
    return `https://source.unsplash.com/1920x1080/?${keywords}`;
  }, [ambiance]);

  if (sessionState === 'generating' || sessionState === 'active' || sessionState === 'finished') {
    return (
        <div className="relative w-screen h-screen bg-black">
            <AnimatePresence>
                <motion.div
                    key={backgroundImageUrl}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 z-0"
                >
                    <Image src={backgroundImageUrl} layout="fill" objectFit="cover" alt={ambiance?.imagePrompt || "Focus background"} data-ai-hint={ambiance?.imagePrompt || "nature landscape"}/>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                </motion.div>
            </AnimatePresence>

            <div className="relative z-10 flex flex-col items-center justify-center h-full text-white p-8">
                {sessionState === 'generating' && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-center space-y-4">
                        <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary"/>
                        <p className="text-2xl font-semibold">Crafting your Zen space...</p>
                        <p className="text-muted-foreground">The AI is personalizing your focus session.</p>
                    </motion.div>
                )}

                {(sessionState === 'active' || sessionState === 'finished') && ambiance && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex flex-col items-center justify-between h-full w-full">
                        <header className="text-center">
                            <h1 className="text-3xl font-bold">Focusing on: {topic}</h1>
                            <p className="text-lg text-primary">{mood}</p>
                        </header>
                        
                        <main className="flex flex-col items-center justify-center gap-8">
                            <p className="font-mono text-8xl md:text-9xl font-bold tracking-tighter">
                                {formatTime(timeRemaining)}
                            </p>
                            
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={currentAffirmationIndex}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.8 }}
                                    className="text-xl md:text-2xl text-center max-w-2xl italic text-white/80"
                                >
                                    "{ambiance.affirmations[currentAffirmationIndex]}"
                                </motion.p>
                            </AnimatePresence>
                        </main>

                        <footer className="text-center">
                            <div className="flex items-center gap-2 text-white/70">
                                <Music className="w-4 h-4"/>
                                <p>Music suggestion: {ambiance.musicKeywords.join(', ')}</p>
                            </div>
                        </footer>
                    </motion.div>
                )}
                
                {sessionState === 'finished' && (
                     <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20 text-center p-8"
                    >
                        <h2 className="text-5xl font-bold mb-4">Session Complete!</h2>
                        <p className="text-xl text-muted-foreground mb-8">You focused for {duration} minutes on {topic}. Great work!</p>
                        <Button onClick={resetSession} size="lg" className="shadow-glow hover:shadow-glow-sm">Start Another Session</Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex items-center gap-4">
          <Leaf className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">Focus Zen Mode</h1>
            <p className="text-muted-foreground mt-1">Enter a distraction-free, AI-powered focus zone.</p>
          </div>
        </header>

        <Card className="bg-secondary/30 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Configure Your Focus Session</CardTitle>
            <CardDescription>Tell the AI how you want to focus, and it will create the perfect ambiance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic">What are you studying?</Label>
              <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Quantum Physics, The Renaissance" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="mood">Desired Mood</Label>
                    <Select value={mood} onValueChange={setMood}>
                        <SelectTrigger id="mood"><SelectValue placeholder="Select Mood" /></SelectTrigger>
                        <SelectContent>
                            {moods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="duration">Session Duration (minutes)</Label>
                    <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
                        <SelectTrigger id="duration"><SelectValue placeholder="Select Duration" /></SelectTrigger>
                        <SelectContent>
                            {durations.map(d => <SelectItem key={d} value={String(d)}>{d} minutes</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            <Button onClick={handleStartSession} disabled={!topic} className="w-full text-lg py-6 shadow-glow hover:shadow-glow-sm transition-shadow">
              <Play className="mr-2" />
              Enter the Zen Zone
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
