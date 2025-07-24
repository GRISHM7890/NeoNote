
'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Diagram, Loader2, Sparkles, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateDiagram, type GenerateDiagramInput, type GenerateDiagramOutput } from '@/ai/flows/ai-diagram-generator';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { saveLibraryItem } from '@/lib/library';

const DiagramDisplay = ({ diagramUrl, topic }: { diagramUrl: string, topic: string }) => {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = diagramUrl;
        link.download = `diagram-${topic.replace(/\s+/g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Card className="bg-secondary/30">
            <CardContent className="p-4 space-y-4">
                 <div className="aspect-square w-full relative rounded-lg overflow-hidden border bg-white">
                    <Image src={diagramUrl} alt={`Generated diagram for ${topic}`} layout="fill" objectFit="contain"/>
                 </div>
                 <Button onClick={handleDownload} className="w-full">
                    <Download className="mr-2"/> Download Diagram
                </Button>
            </CardContent>
        </Card>
    );
};


export default function DiagramGeneratorPage() {
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateDiagramOutput | null>(null);

  const handleGenerate = async () => {
    if (!topic) {
      toast({ title: "Topic is empty", description: "Please provide a topic to generate a diagram.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);

    const input: GenerateDiagramInput = { topic };

    try {
      const aiResult = await generateDiagram(input);
      setResult(aiResult);
      if(aiResult.diagramUrl) {
        saveLibraryItem({
            type: 'Diagram',
            title: `Diagram for ${topic}`,
            payload: { input, result: aiResult },
        });
        toast({ title: 'Diagram Generated!', description: 'Your AI-powered diagram is ready and saved to your library.' });
      } else {
        toast({ title: 'Generation Failed', description: "The AI couldn't create a diagram for this topic. Please try a different one.", variant: 'destructive' });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "An Error Occurred", description: "Something went wrong. Please try again.", variant: 'destructive'});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex items-center gap-4">
          <Diagram className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">Any Subject Diagram Generator</h1>
            <p className="text-muted-foreground mt-1">Generate a visually appealing diagram for any topic.</p>
          </div>
        </header>

        <Card className="bg-secondary/30">
            <CardHeader>
                <CardTitle>1. Enter a Topic</CardTitle>
                <CardDescription>Tell the AI what you want a diagram of.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
                 <Input 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., 'The structure of a plant cell', 'The water cycle', 'How a car engine works'"
                 />
                 <Button onClick={handleGenerate} disabled={isLoading} className="shadow-glow hover:shadow-glow-sm">
                    {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                    Generate
                </Button>
            </CardContent>
        </Card>

        {(isLoading || result) && (
             <div className="animate-in fade-in duration-500">
                <h2 className="font-headline text-2xl mb-4">Your Custom Diagram</h2>
                {isLoading && (
                    <div className="flex items-center justify-center p-8 text-muted-foreground bg-secondary/30 rounded-lg min-h-[300px]">
                        <Loader2 className="w-8 h-8 animate-spin mr-4" />
                        <p>The AI is illustrating your diagram... this may take a moment.</p>
                    </div>
                )}
                 {result?.diagramUrl && (
                    <div className="max-w-xl mx-auto">
                        <DiagramDisplay diagramUrl={result.diagramUrl} topic={topic}/>
                    </div>
                )}
                 {result && !result.diagramUrl && !isLoading && (
                    <div className="text-center text-muted-foreground py-10 bg-secondary/30 rounded-lg">
                        The AI was unable to generate a diagram for this topic. Please try another one.
                    </div>
                 )}
             </div>
        )}
      </div>
    </AppLayout>
  );
}
