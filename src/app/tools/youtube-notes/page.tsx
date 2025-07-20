
'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { youtubeNotesGenerator, type YoutubeNotesGeneratorInput, type YoutubeNotesGeneratorOutput } from '@/ai/flows/ai-youtube-notes-generator';
import { Video, Loader2, Sparkles, Wand2, Lightbulb, ListChecks, FunctionSquare, Clock, Youtube } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { saveLibraryItem } from '@/lib/library';

const Section = ({ title, icon: Icon, children }: { title: string, icon: React.ElementType, children: React.ReactNode }) => (
    <div>
        <h3 className="font-headline text-xl mb-3 flex items-center gap-2">
            <Icon className="w-5 h-5 text-primary" />
            {title}
        </h3>
        <div className="pl-2 space-y-2 text-muted-foreground prose prose-sm prose-invert max-w-none">
          {children}
        </div>
        <Separator className="mt-6" />
    </div>
);


export default function YoutubeNotesPage() {
    const { toast } = useToast();
    const [videoUrl, setVideoUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [notes, setNotes] = useState<YoutubeNotesGeneratorOutput | null>(null);

    const handleGenerateNotes = async () => {
        if (!videoUrl || !videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
            toast({
                title: 'Invalid URL',
                description: 'Please provide a valid YouTube video URL.',
                variant: 'destructive',
            });
            return;
        }
        setIsLoading(true);
        setNotes(null);

        try {
            const result = await youtubeNotesGenerator({ videoUrl });
            setNotes(result);
            saveLibraryItem({
              type: 'YouTube Video Notes',
              title: `Notes for "${result.title}"`,
              payload: { videoUrl, result },
            });
            toast({
                title: 'Notes Generated!',
                description: 'Your notes from the YouTube video are ready and saved to your library.',
            });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Generation Failed',
                description: 'The AI failed to generate notes from this video. Please try another one.',
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
                    <Video className="w-10 h-10 text-accent" />
                    <div>
                        <h1 className="font-headline text-3xl md:text-4xl">Auto-Notes From YouTube</h1>
                        <p className="text-muted-foreground mt-1">Paste a video link to get summarized notes and key points.</p>
                    </div>
                </header>

                <Card className="bg-secondary/30">
                    <CardHeader>
                        <CardTitle>1. Provide a YouTube Video Link</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                        <Input 
                            value={videoUrl} 
                            onChange={(e) => setVideoUrl(e.target.value)} 
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="bg-card"
                         />
                        <Button onClick={handleGenerateNotes} disabled={isLoading} className="shadow-glow hover:shadow-glow-sm">
                            {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                            Generate
                        </Button>
                    </CardContent>
                </Card>

                {(isLoading || notes) && (
                    <Card className='animate-in fade-in duration-500'>
                        <CardHeader>
                            <CardTitle className='font-headline text-2xl flex items-center gap-2'>
                                <Youtube className='text-accent'/>
                                AI-Generated Notes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {isLoading && (
                                <div className="flex items-center justify-center p-8 text-muted-foreground">
                                    <Loader2 className="w-8 h-8 animate-spin mr-4" />
                                    <p>The AI is watching the video and taking notes for you...</p>
                                </div>
                            )}
                            {notes && (
                                <>
                                  <h2 className="text-2xl font-bold">{notes.title}</h2>
                                  <Separator />
                                  <Section icon={Lightbulb} title="Summary">
                                    <p>{notes.summary}</p>
                                  </Section>
                                  
                                  <Section icon={ListChecks} title="Key Takeaways">
                                    <ul className="list-disc list-outside pl-5 space-y-2">
                                      {notes.keyTakeaways.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                  </Section>

                                  {notes.formulas && notes.formulas.length > 0 && (
                                      <Section icon={FunctionSquare} title="Formulas Mentioned">
                                        <div className="space-y-4">
                                          {notes.formulas.map((item, i) => (
                                            <div key={i} className="p-3 bg-background/50 rounded-md">
                                              <p className="font-semibold text-primary">{item.formula}</p>
                                              <p>{item.explanation}</p>
                                            </div>
                                          ))}
                                        </div>
                                      </Section>
                                  )}

                                  <Section icon={Clock} title="Timestamped Notes">
                                    <div className="space-y-4">
                                      {notes.timestamps.map((item, i) => (
                                        <div key={i} className="grid grid-cols-[auto_1fr] items-start gap-4">
                                          <div className="bg-primary text-primary-foreground rounded-md px-2 py-1 text-xs font-mono mt-1">
                                            {item.time}
                                          </div>
                                          <p>{item.description}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </Section>
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
