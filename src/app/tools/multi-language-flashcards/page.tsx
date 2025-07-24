
'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Languages, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateBilingualFlashcards, type GenerateBilingualFlashcardsInput, type GenerateBilingualFlashcardsOutput } from '@/ai/flows/ai-bilingual-flashcard-generator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saveLibraryItem } from '@/lib/library';
import { Label } from '@/components/ui/label';

const targetLanguages = ["Hindi", "Marathi", "Spanish", "French", "German", "Japanese", "Russian", "Arabic"];

export default function MultiLanguageFlashcardsPage() {
  const { toast } = useToast();

  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [targetLanguage, setTargetLanguage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateBilingualFlashcardsOutput | null>(null);

  const canGenerate = topic && targetLanguage && questionCount > 0;

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast({ title: "Missing Details", description: "Please provide a topic and select a target language.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);

    const input: GenerateBilingualFlashcardsInput = {
      topic,
      questionCount,
      targetLanguage,
    };

    try {
      const aiResult = await generateBilingualFlashcards(input);
      setResult(aiResult);
      saveLibraryItem({
        type: 'Bilingual Flashcards',
        title: `Bilingual Flashcards for ${topic}`,
        payload: { input, result: aiResult },
      });
      toast({ title: 'Bilingual Flashcards Generated!', description: `Your flashcards for ${topic} have been translated to ${targetLanguage}.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Generation Failed", description: "The AI couldn't process your request. Please try again.", variant: 'destructive'});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex items-center gap-4">
          <Languages className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">AI Bilingual Flashcard Creator</h1>
            <p className="text-muted-foreground mt-1">Enter a topic and let AI generate and translate flashcards for you.</p>
          </div>
        </header>

        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle>1. Define Your Study Set</CardTitle>
            <CardDescription>Tell the AI what you want to learn about.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Input 
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., 'The Solar System', 'Human Anatomy'"
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="q_count">Number of Flashcards</Label>
                    <Input 
                        id="q_count" 
                        type="number" 
                        value={questionCount} 
                        onChange={(e) => setQuestionCount(Math.max(1, parseInt(e.target.value, 10)))} 
                        min="1" 
                        max="15" 
                    />
                </div>
            </div>
            
            <div className="space-y-2">
              <Label>Translate To</Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger><SelectValue placeholder="Select Target Language" /></SelectTrigger>
                  <SelectContent>{targetLanguages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            
            <Button onClick={handleGenerate} disabled={!canGenerate || isLoading} className="w-full text-lg py-6 shadow-glow hover:shadow-glow-sm transition-shadow">
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
              Generate Bilingual Flashcards
            </Button>
          </CardContent>
        </Card>

        {(isLoading || result) && (
            <Card className='animate-in fade-in duration-500'>
                <CardHeader>
                    <CardTitle className='font-headline text-2xl'>AI-Generated Bilingual Flashcards</CardTitle>
                    <CardDescription>Your flashcards for "{topic}", translated to {targetLanguage}.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
                    {isLoading && (
                        <div className="flex items-center justify-center p-8 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mr-4" />
                            <p>The AI is creating and translating your flashcards...</p>
                        </div>
                    )}
                    {result?.bilingualCards && result.bilingualCards.map((bCard, index) => (
                        <div key={index} className="p-4 rounded-lg bg-background/50 border">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground">Source (English)</h4>
                                    <p className="font-bold">{bCard.sourceTerm}</p>
                                    <p className="text-sm">{bCard.sourceDefinition}</p>
                                </div>
                                 <div className="border-t md:border-t-0 md:border-l md:pl-4 pt-2 md:pt-0">
                                    <h4 className="font-semibold text-sm text-muted-foreground">{targetLanguage}</h4>
                                    <p className="font-bold text-primary">{bCard.translatedTerm}</p>
                                    <p className="text-sm">{bCard.translatedDefinition}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        )}
      </div>
    </AppLayout>
  );
}
