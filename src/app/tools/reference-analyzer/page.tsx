'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { analyzeReferenceBook, checkVideoStatus, type ReferenceBookInput, type ReferenceBookOutput, type VideoStatusOutput } from '@/ai/flows/ai-reference-analyzer';
import { BookOpen, Loader2, Sparkles, Film, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

type TopicState = ReferenceBookOutput['topics'][0] & {
    status: 'pending' | 'generating' | 'completed' | 'failed';
    videoDataUri?: string;
};

export default function ReferenceAnalyzerPage() {
    const { toast } = useToast();
    const [bookTitle, setBookTitle] = useState('');
    const [author, setAuthor] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<{ difficulty: string; topics: TopicState[] } | null>(null);

    const handleAnalyzeBook = async () => {
        if (!bookTitle) {
            toast({
                title: 'Missing Information',
                description: 'Please provide a book title.',
                variant: 'destructive',
            });
            return;
        }
        setIsLoading(true);
        setAnalysisResult(null);

        const input: ReferenceBookInput = { bookTitle, author };

        try {
            const result = await analyzeReferenceBook(input);
            setAnalysisResult({
                difficulty: result.difficulty,
                topics: result.topics.map(topic => ({ ...topic, status: 'generating' })),
            });
            toast({
                title: 'Analysis Complete!',
                description: 'Now generating explanation videos for key topics.',
            });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Analysis Failed',
                description: 'The AI failed to analyze the book. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const pollVideoStatus = useCallback(async (topicIndex: number, operationName: string) => {
        try {
            const statusResult = await checkVideoStatus({ operationName });
            if (statusResult.done && statusResult.videoDataUri) {
                setAnalysisResult(prev => {
                    if (!prev) return null;
                    const newTopics = [...prev.topics];
                    newTopics[topicIndex] = { ...newTopics[topicIndex], status: 'completed', videoDataUri: statusResult.videoDataUri };
                    return { ...prev, topics: newTopics };
                });
            }
        } catch (error) {
            console.error(`Failed to get status for ${operationName}`, error);
            setAnalysisResult(prev => {
                if (!prev) return null;
                const newTopics = [...prev.topics];
                newTopics[topicIndex] = { ...newTopics[topicIndex], status: 'failed' };
                return { ...prev, topics: newTopics };
            });
        }
    }, []);

    useEffect(() => {
        if (analysisResult) {
            const intervalIds: NodeJS.Timeout[] = [];
            analysisResult.topics.forEach((topic, index) => {
                if (topic.status === 'generating') {
                    const intervalId = setInterval(() => {
                        pollVideoStatus(index, topic.operationName).then(result => {
                            // Check if the topic is completed or failed inside the then block
                            setAnalysisResult(currentAnalysis => {
                                if (currentAnalysis?.topics[index]?.status === 'completed' || currentAnalysis?.topics[index]?.status === 'failed') {
                                    clearInterval(intervalId);
                                }
                                return currentAnalysis;
                            });
                        });
                    }, 5000); // Poll every 5 seconds
                    intervalIds.push(intervalId);
                }
            });

            return () => {
                intervalIds.forEach(id => clearInterval(id));
            };
        }
    }, [analysisResult, pollVideoStatus]);


    return (
        <AppLayout>
            <div className="flex-1 p-4 md:p-8 space-y-8">
                <header className="flex items-center gap-4">
                    <BookOpen className="w-10 h-10 text-accent" />
                    <div>
                        <h1 className="font-headline text-3xl md:text-4xl">Reference Book Analyzer</h1>
                        <p className="text-muted-foreground mt-1">Analyze books and get AI-generated explanation videos.</p>
                    </div>
                </header>

                <Card className="bg-secondary/30">
                    <CardHeader>
                        <CardTitle>1. Enter Book Details</CardTitle>
                        <CardDescription>Provide the title and author of the book you want to analyze.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} placeholder="e.g., Concepts of Physics" />
                            <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="e.g., H.C. Verma (Optional)" />
                        </div>
                        <Button onClick={handleAnalyzeBook} disabled={isLoading} className="w-full text-lg py-6 shadow-glow hover:shadow-glow-sm transition-shadow">
                            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                            Analyze Book & Generate Videos
                        </Button>
                    </CardContent>
                </Card>

                {(isLoading || analysisResult) && (
                    <Card className='animate-in fade-in duration-500'>
                        <CardHeader>
                            <CardTitle className='font-headline text-2xl flex items-center gap-2'>
                                <Film className='text-accent' />
                                AI Analysis & Video Library
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading && (
                                <div className="flex items-center justify-center p-8 text-muted-foreground">
                                    <Loader2 className="w-8 h-8 animate-spin mr-4" />
                                    <p>The AI is reading and analyzing the book...</p>
                                </div>
                            )}
                            {analysisResult && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">Book Difficulty</h3>
                                        <Badge variant="outline" className="text-base">{analysisResult.difficulty}</Badge>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">Key Topics & Explainer Videos</h3>
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {analysisResult.topics.map((topic, index) => (
                                                <Card key={index} className="bg-background/50">
                                                    <CardHeader>
                                                        <CardTitle className="text-xl">{topic.topicName}</CardTitle>
                                                        <CardDescription>{topic.description}</CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        {topic.status === 'generating' && (
                                                            <div className="flex flex-col items-center justify-center text-center p-4 rounded-md bg-secondary text-muted-foreground">
                                                                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                                                <p className="text-sm font-medium">Generating Video...</p>
                                                                <p className="text-xs">(This may take a minute)</p>
                                                            </div>
                                                        )}
                                                        {topic.status === 'completed' && topic.videoDataUri && (
                                                            <video controls src={topic.videoDataUri} className="w-full rounded-md" />
                                                        )}
                                                        {topic.status === 'failed' && (
                                                            <div className="flex items-center justify-center p-4 rounded-md bg-destructive/20 text-destructive-foreground">
                                                                <p>Video generation failed.</p>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
