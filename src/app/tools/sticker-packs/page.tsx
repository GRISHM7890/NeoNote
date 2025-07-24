
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

const StickerCard = ({ stickerUrl, index }: { stickerUrl: string, index: number }) => {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = stickerUrl;
        link.download = `sticker-${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Card className="relative group bg-secondary/30">
            <CardContent className="p-2 aspect-square flex items-center justify-center">
                 <Image src={stickerUrl} alt={`Generated sticker ${index + 1}`} width={200} height={200} className="object-contain"/>
            </CardContent>
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button onClick={handleDownload} variant="secondary">
                    <Download className="mr-2"/> Download
                </Button>
            </div>
        </Card>
    );
};


export default function StickerGeneratorPage() {
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stickers, setStickers] = useState<GenerateStickersOutput | null>(null);

  const handleGenerate = async () => {
    if (!topic) {
      toast({ title: "Topic is empty", description: "Please provide a topic to generate stickers.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setStickers(null);

    const input: GenerateStickersInput = { topic };

    try {
      const result = await generateStickers(input);
      setStickers(result);
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

        {(isLoading || stickers) && (
             <div className="animate-in fade-in duration-500">
                <h2 className="font-headline text-2xl mb-4">Your Custom Sticker Pack</h2>
                {isLoading && (
                    <div className="flex items-center justify-center p-8 text-muted-foreground bg-secondary/30 rounded-lg">
                        <Loader2 className="w-8 h-8 animate-spin mr-4" />
                        <p>The AI is illustrating your stickers... this may take a moment.</p>
                    </div>
                )}
                 {stickers?.stickerUrls && stickers.stickerUrls.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {stickers.stickerUrls.map((url, index) => (
                           <StickerCard key={index} stickerUrl={url} index={index} />
                        ))}
                    </div>
                )}
                 {stickers && stickers.stickerUrls.length === 0 && !isLoading && (
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
