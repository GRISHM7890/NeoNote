'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Languages, Loader2, Sparkles, ArrowRightLeft, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { translateText, type TranslateTextInput, type TranslateTextOutput } from '@/ai/flows/ai-language-translator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const targetLanguages = ["Hindi", "Marathi", "Spanish", "French", "German", "Japanese", "Russian", "Arabic"];

export default function LanguageTranslatorPage() {
  const { toast } = useToast();

  const [inputText, setInputText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TranslateTextOutput | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!inputText || !targetLanguage) {
      toast({
        title: 'Missing Information',
        description: 'Please provide text and select a target language.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setResult(null);

    try {
      const aiResult = await translateText({ text: inputText, targetLanguage });
      setResult(aiResult);
      toast({ title: 'Translation Complete!', description: `Text translated to ${targetLanguage}.` });
    } catch (error) {
      console.error(error);
      toast({ title: 'Translation Failed', description: 'The AI could not process your request.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopy = () => {
    if(!result?.translatedText) return;
    navigator.clipboard.writeText(result.translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex items-center gap-4">
          <Languages className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">AI Language Translator</h1>
            <p className="text-muted-foreground mt-1">Translate your notes into various regional and foreign languages.</p>
          </div>
        </header>

        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle>Translate Your Text</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste the text you want to translate here..."
                rows={8}
              />
              <div className="flex flex-col items-center gap-4">
                 <ArrowRightLeft className="w-8 h-8 text-accent hidden lg:block" />
                 <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger className="w-full max-w-sm">
                        <SelectValue placeholder="Select Target Language" />
                    </SelectTrigger>
                    <SelectContent>
                        {targetLanguages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                    </SelectContent>
                 </Select>
                 <ArrowRightLeft className="w-8 h-8 text-accent rotate-90 lg:hidden" />
              </div>
            </div>
             <Button onClick={handleTranslate} disabled={isLoading || !inputText || !targetLanguage} className="w-full text-lg py-6 shadow-glow hover:shadow-glow-sm transition-shadow">
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
              Translate with AI
            </Button>
          </CardContent>
        </Card>

        {(isLoading || result) && (
          <Card className='animate-in fade-in duration-500'>
            <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <CardTitle className='font-headline text-2xl flex items-center gap-2'>
                  <Sparkles className='text-accent' />
                  Translation Result
                </CardTitle>
                <CardDescription>
                  {result?.detectedSourceLanguage && `Detected source language: ${result.detectedSourceLanguage}`}
                </CardDescription>
              </div>
              {result && (
                <Button variant="outline" onClick={handleCopy}>
                    {copied ? <Check className="mr-2 text-green-500"/> : <Copy className="mr-2"/>}
                    {copied ? 'Copied' : 'Copy'}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex items-center justify-center p-8 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin mr-4" />
                  <p>The AI is translating your text...</p>
                </div>
              )}
              {result && (
                <div className="p-4 bg-background rounded-md min-h-[200px] whitespace-pre-wrap">
                  {result.translatedText}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
