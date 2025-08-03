
'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AudioLines, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { textToSpeech, type TextToSpeechInput, type TextToSpeechOutput } from '@/ai/flows/ai-text-to-speech';
import { Textarea } from '@/components/ui/textarea';
import { saveLibraryItem } from '@/lib/library';

export default function TextToSpeechPage() {
  const { toast } = useToast();

  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TextToSpeechOutput | null>(null);

  const handleGenerate = async () => {
    if (!text) {
      toast({ title: "Text is empty", description: "Please enter some text to generate audio.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);

    const input: TextToSpeechInput = { text };

    try {
      const aiResult = await textToSpeech(input);
      setResult(aiResult);
      if (aiResult.audioUrl) {
        saveLibraryItem({
          type: 'Text to Speech',
          title: `Audio for "${text.substring(0, 30)}..."`,
          payload: { input, result: aiResult },
        });
        toast({ title: 'Audio Generated!', description: 'Your high-quality audio is ready to be played.' });
      } else {
        toast({ title: 'Generation Failed', description: "The AI couldn't generate audio for this text.", variant: 'destructive' });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "An Error Occurred", description: "Something went wrong. Please try again.", variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex items-center gap-4">
          <AudioLines className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">AI Text to Speech</h1>
            <p className="text-muted-foreground mt-1">Convert your notes into a high-quality audiobook.</p>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <Card className="bg-secondary/30">
            <CardHeader>
              <CardTitle>1. Paste Your Text</CardTitle>
              <CardDescription>Enter the content you want the AI to read aloud.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the notes or content you want to listen to here..."
                rows={12}
              />
              <Button onClick={handleGenerate} disabled={isLoading || !text} className="w-full text-lg py-6 shadow-glow hover:shadow-glow-sm transition-shadow">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                Generate Audio
              </Button>
            </CardContent>
          </Card>

          {(isLoading || result) && (
            <Card className='animate-in fade-in duration-500 sticky top-8'>
              <CardHeader>
                <CardTitle className='font-headline text-2xl'>2. Listen to Your Notes</CardTitle>
                <CardDescription>Your generated audio will appear here.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading && (
                  <div className="flex items-center justify-center p-8 text-muted-foreground min-h-[150px]">
                    <Loader2 className="w-8 h-8 animate-spin mr-4" />
                    <p>The AI is warming up its vocal cords...</p>
                  </div>
                )}
                {result?.audioUrl && (
                  <div className="space-y-4">
                    <audio controls src={result.audioUrl} className="w-full">
                      Your browser does not support the audio element.
                    </audio>
                    <p className="text-xs text-muted-foreground text-center">This audio has been saved to your library.</p>
                  </div>
                )}
                {result && !result.audioUrl && !isLoading && (
                  <div className="text-center text-muted-foreground py-10 min-h-[150px]">
                    Audio generation failed. Please try again.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
