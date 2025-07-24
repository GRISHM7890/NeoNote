
'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sticker, Loader2, Sparkles, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateStickers, type GenerateStickersInput, type GenerateStickersOutput } from '@/ai/flows/ai-sticker-generator';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

const StickerSheetDisplay = ({ stickerUrl, topic }: { stickerUrl: string, topic: string }) => {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = stickerUrl;
        link.download = `sticker-sheet-${topic.replace(/\s+/g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Card className="bg-secondary/30">
            <CardContent className="p-4 space-y-4">
                 <div className="aspect-square w-full relative rounded-lg overflow-hidden border">
                    <Image src={stickerUrl} alt={`Generated sticker sheet for ${topic}`} layout="fill" objectFit="contain"/>
                 </div>
                 <Button onClick={handleDownload} className="w-full">
                    <Download className="mr-2"/> Download Sticker Sheet
                </Button>
            </CardContent>
        </Card>
    );
};


export default function StickerGeneratorPage() {
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateStickersOutput | null>(null);

  const handleGenerate = async () => {
    if (!topic) {
      toast({ title: "Topic is empty", description: "Please provide a topic to generate stickers.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);

    const input: GenerateStickersInput = { topic };

    try {
      const aiResult = await generateStickers(input);
      setResult(aiResult);
      toast({ title: 'Stickers Generated!', description: 'Your AI-powered sticker pack is ready.' });
    } catch (error) {
      console.error(error);
      toast({ title: "Generation Failed", description: "The AI couldn't create stickers for this topic. Please try again.", variant: 'destructive'});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex items-center gap-4">
          <Sticker className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">AI Sticker Pack Generator</h1>
            <p className="text-muted-foreground mt-1">Generate custom, downloadable stickers for any study topic.</p>
          </div>
        </header>

        <Card className="bg-secondary/30">
            <CardHeader>
                <CardTitle>1. Enter a Topic</CardTitle>
                <CardDescription>Tell the AI what subject you want stickers for.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
                 <Input 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., 'Photosynthesis', 'World War II', 'Shakespeare'"
                 />
                 <Button onClick={handleGenerate} disabled={isLoading} className="shadow-glow hover:shadow-glow-sm">
                    {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                    Generate
                </Button>
            </CardContent>
        </Card>

        {(isLoading || result) && (
             <div className="animate-in fade-in duration-500">
                <h2 className="font-headline text-2xl mb-4">Your Custom Sticker Sheet</h2>
                {isLoading && (
                    <div className="flex items-center justify-center p-8 text-muted-foreground bg-secondary/30 rounded-lg min-h-[300px]">
                        <Loader2 className="w-8 h-8 animate-spin mr-4" />
                        <p>The AI is illustrating your stickers... this may take a moment.</p>
                    </div>
                )}
                 {result?.stickerSheetUrl && (
                    <div className="max-w-xl mx-auto">
                        <StickerSheetDisplay stickerUrl={result.stickerSheetUrl} topic={topic}/>
                    </div>
                )}
                 {result && !result.stickerSheetUrl && !isLoading && (
                    <div className="text-center text-muted-foreground py-10 bg-secondary/30 rounded-lg">
                        The AI was unable to generate stickers for this topic. Please try another one.
                    </div>
                 )}
             </div>
        )}
      </div>
    </AppLayout>
  );
}
