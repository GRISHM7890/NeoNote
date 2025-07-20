
'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Network, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateMindmap, type MindmapNode } from '@/ai/flows/ai-mindmap-generator';
import { Textarea } from '@/components/ui/textarea';
import { MindmapDisplay } from '@/components/mindmap';
import { saveLibraryItem } from '@/lib/library';

export default function MindmapGeneratorPage() {
  const { toast } = useToast();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mindmapData, setMindmapData] = useState<MindmapNode | null>(null);

  const handleGenerateMindmap = async () => {
    if (!inputText) {
      toast({
        title: 'Input text is empty',
        description: 'Please provide some text to generate a mindmap.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setMindmapData(null);

    try {
      const result = await generateMindmap({ text: inputText });
      setMindmapData(result.root);
      saveLibraryItem({
        type: 'Mindmap',
        title: `Mindmap for ${result.root.title}`,
        payload: result,
      });
      toast({
        title: 'Mindmap Generated!',
        description: 'Your AI-powered mindmap is ready and saved to your library.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Generation Failed',
        description: 'The AI failed to create a mindmap. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex items-center gap-4">
          <Network className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">AI Mindmap Generator</h1>
            <p className="text-muted-foreground mt-1">Convert notes into visual mind maps for quick revision.</p>
          </div>
        </header>

        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle>1. Provide Your Notes</CardTitle>
            <CardDescription>Paste the text content you want to visualize as a mindmap.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={10}
              placeholder="Paste your chapter notes, summary, or any text here..."
              className="text-base bg-card"
            />
            <Button onClick={handleGenerateMindmap} disabled={isLoading} className="w-full text-lg py-6 shadow-glow hover:shadow-glow-sm transition-shadow">
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2" />}
              Generate Mindmap
            </Button>
          </CardContent>
        </Card>

        {(isLoading || mindmapData) && (
          <Card className='animate-in fade-in duration-500'>
            <CardHeader>
              <CardTitle className='font-headline text-2xl flex items-center gap-2'>
                <Sparkles className='text-accent' />
                Your AI-Generated Mindmap
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {isLoading && (
                <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin mr-4 mb-4" />
                  <p>The AI is structuring your knowledge...</p>
                </div>
              )}
              {mindmapData && (
                <div className="overflow-x-auto p-4">
                    <MindmapDisplay node={mindmapData} />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
