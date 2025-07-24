
'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Languages, Loader2, Sparkles, Wand2, PlusCircle, X, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateBilingualFlashcards, type GenerateBilingualFlashcardsInput, type GenerateBilingualFlashcardsOutput } from '@/ai/flows/ai-bilingual-flashcard-generator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { saveLibraryItem } from '@/lib/library';

const targetLanguages = ["Hindi", "Marathi", "Spanish", "French", "German", "Japanese", "Russian", "Arabic"];

type CardInput = {
    id: number;
    term: string;
    definition: string;
};

export default function MultiLanguageFlashcardsPage() {
  const { toast } = useToast();

  const [cards, setCards] = useState<CardInput[]>([{ id: 1, term: '', definition: '' }]);
  const [targetLanguage, setTargetLanguage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateBilingualFlashcardsOutput | null>(null);

  const handleCardChange = (id: number, field: 'term' | 'definition', value: string) => {
    setCards(currentCards => currentCards.map(card => card.id === id ? { ...card, [field]: value } : card));
  };

  const addCard = () => {
    setCards(currentCards => [...currentCards, { id: Date.now(), term: '', definition: '' }]);
  };

  const removeCard = (id: number) => {
    setCards(currentCards => currentCards.filter(card => card.id !== id));
  };
  
  const canGenerate = cards.some(c => c.term && c.definition) && targetLanguage;

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast({ title: "Missing Details", description: "Please fill at least one flashcard and select a target language.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);

    const input: GenerateBilingualFlashcardsInput = {
      cards: cards.filter(c => c.term && c.definition),
      targetLanguage,
    };

    try {
      const aiResult = await generateBilingualFlashcards(input);
      setResult(aiResult);
      saveLibraryItem({
        type: 'Bilingual Flashcards',
        title: `Bilingual Flashcards for ${targetLanguage}`,
        payload: { input, result: aiResult },
      });
      toast({ title: 'Bilingual Flashcards Generated!', description: `Your flashcards have been translated to ${targetLanguage}.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Generation Failed", description: "The AI couldn't process your cards. Please try again.", variant: 'destructive'});
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
            <p className="text-muted-foreground mt-1">Create flashcards in one language and let AI translate them.</p>
          </div>
        </header>

        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle>1. Create Your Flashcards</CardTitle>
            <CardDescription>Enter your terms and definitions in your source language.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cards.map((card, index) => (
              <div key={card.id} className="flex items-center gap-2">
                <Input
                  value={card.term}
                  onChange={(e) => handleCardChange(card.id, 'term', e.target.value)}
                  placeholder={`Term ${index + 1}`}
                />
                <Input
                  value={card.definition}
                  onChange={(e) => handleCardChange(card.id, 'definition', e.target.value)}
                  placeholder={`Definition ${index + 1}`}
                />
                <Button variant="ghost" size="icon" onClick={() => removeCard(card.id)} disabled={cards.length <= 1}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={addCard}>
                <PlusCircle className="mr-2" /> Add Card
              </Button>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger className="w-full max-w-xs"><SelectValue placeholder="Select Target Language" /></SelectTrigger>
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
                    <CardDescription>Your flashcards, translated to {targetLanguage}.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoading && (
                        <div className="flex items-center justify-center p-8 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mr-4" />
                            <p>The AI is translating your flashcards...</p>
                        </div>
                    )}
                    {result?.bilingualCards && result.bilingualCards.map((bCard, index) => (
                        <div key={index} className="p-4 rounded-lg bg-secondary/50">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground">Source</h4>
                                    <p className="font-bold">{bCard.sourceTerm}</p>
                                    <p className="text-sm">{bCard.sourceDefinition}</p>
                                </div>
                                 <div>
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
