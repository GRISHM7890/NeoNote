
'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Loader2, Sparkles, Wand2, Youtube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { recommendMusic, type RecommendMusicInput, type RecommendMusicOutput } from '@/ai/flows/ai-music-recommender';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saveLibraryItem } from '@/lib/library';
import Link from 'next/link';

const moods = ["Calm", "Focused", "Energetic", "Creative", "Relaxed"];
const genres = ["Lofi", "Classical", "Ambient", "Instrumental", "Binaural Beats", "Nature Sounds"];

const SuggestionCard = ({ suggestion }: { suggestion: RecommendMusicOutput['recommendations'][0] }) => {
    const youtubeLink = `https://www.youtube.com/results?search_query=${encodeURIComponent(suggestion.youtubeSearchQuery)}`;
    return (
        <Card className="bg-background/50 hover:border-accent transition-colors flex flex-col">
            <CardHeader>
                <CardTitle>{suggestion.title}</CardTitle>
                <CardDescription>{suggestion.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
                <Button asChild className="w-full">
                    <Link href={youtubeLink} target="_blank" rel="noopener noreferrer">
                        <Youtube className="mr-2" /> Find on YouTube
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
};


export default function MoodMusicPage() {
  const { toast } = useToast();

  // Inputs
  const [topic, setTopic] = useState('');
  const [mood, setMood] = useState('');
  const [genre, setGenre] = useState('');

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RecommendMusicOutput | null>(null);

  const canSubmit = topic && mood && genre;

  const handleGenerate = async () => {
    if (!canSubmit) {
      toast({ title: "Missing Details", description: "Please fill out all the fields.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);

    const input: RecommendMusicInput = { topic, mood, genre };

    try {
      const aiResult = await recommendMusic(input);
      setResult(aiResult);
      saveLibraryItem({
        type: 'Music Recommendations',
        title: `Music for ${topic}`,
        payload: { input, result: aiResult },
      });
      toast({ title: 'Music Curated!', description: 'Your personalized study playlist suggestions are ready.' });
    } catch (error) {
      console.error(error);
      toast({ title: "Curation Failed", description: "The AI couldn't find music for you. Please try again.", variant: 'destructive'});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex items-center gap-4">
          <Music className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">AI Study Mood Music</h1>
            <p className="text-muted-foreground mt-1">Get personalized music recommendations for your study sessions.</p>
          </div>
        </header>

        <Card className="bg-secondary/30">
            <CardHeader>
                <CardTitle>1. Set Your Study Ambiance</CardTitle>
                <CardDescription>Tell the AI what you're studying and how you want to feel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                    <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="What are you studying?"/>
                    <Select value={mood} onValueChange={setMood}>
                        <SelectTrigger><SelectValue placeholder="Select a Mood" /></SelectTrigger>
                        <SelectContent>{moods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                    </Select>
                     <Select value={genre} onValueChange={setGenre}>
                        <SelectTrigger><SelectValue placeholder="Select a Genre" /></SelectTrigger>
                        <SelectContent>{genres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <Button onClick={handleGenerate} disabled={!canSubmit || isLoading} className="w-full text-lg py-6 shadow-glow hover:shadow-glow-sm transition-shadow">
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                    Find My Focus Fuel
                </Button>
            </CardContent>
        </Card>

        {(isLoading || result) && (
             <div className="animate-in fade-in duration-500">
                <h2 className="font-headline text-2xl mb-4">AI-Powered Recommendations</h2>
                {isLoading && (
                    <div className="flex items-center justify-center p-8 text-muted-foreground bg-secondary/30 rounded-lg">
                        <Loader2 className="w-8 h-8 animate-spin mr-4" />
                        <p>The AI DJ is crafting your perfect study playlist...</p>
                    </div>
                )}
                 {result?.recommendations && result.recommendations.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {result.recommendations.map((rec, index) => (
                           <SuggestionCard key={index} suggestion={rec} />
                        ))}
                    </div>
                )}
             </div>
        )}
      </div>
    </AppLayout>
  );
}
