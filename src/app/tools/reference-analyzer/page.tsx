'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { analyzeReferenceBook, type ReferenceBookInput, type ReferenceBookOutput } from '@/ai/flows/ai-reference-analyzer';
import { BookOpen, Loader2, Sparkles, FileQuestion, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MCQ } from '@/components/mcq';
import { Separator } from '@/components/ui/separator';

export default function ReferenceAnalyzerPage() {
    const { toast } = useToast();
    const [bookTitle, setBookTitle] = useState('');
    const [author, setAuthor] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<ReferenceBookOutput | null>(null);

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
            setAnalysisResult(result);
            toast({
                title: 'Analysis Complete!',
                description: 'Your study questions are ready.',
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

    return (
        <AppLayout>
            <div className="flex-1 p-4 md:p-8 space-y-8">
                <header className="flex items-center gap-4">
                    <BookOpen className="w-10 h-10 text-accent" />
                    <div>
                        <h1 className="font-headline text-3xl md:text-4xl">Reference Book Analyzer</h1>
                        <p className="text-muted-foreground mt-1">Analyze a book to get key topics and AI-generated study questions.</p>
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
                            Analyze Book & Generate Q&A
                        </Button>
                    </CardContent>
                </Card>

                {(isLoading || analysisResult) && (
                    <Card className='animate-in fade-in duration-500'>
                        <CardHeader>
                            <CardTitle className='font-headline text-2xl flex items-center gap-2'>
                                <FileQuestion className='text-accent' />
                                AI Analysis & Study Questions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading && (
                                <div className="flex items-center justify-center p-8 text-muted-foreground">
                                    <Loader2 className="w-8 h-8 animate-spin mr-4" />
                                    <p>The AI is reading and preparing your study guide...</p>
                                </div>
                            )}
                            {analysisResult && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">Book Difficulty Assessment</h3>
                                        <Badge variant="outline" className="text-base">{analysisResult.difficulty}</Badge>
                                    </div>
                                    <Separator />
                                    <div>
                                        <h3 className="font-semibold text-lg mb-4">Key Topics & Questions</h3>
                                        <Accordion type="multiple" className="space-y-4">
                                            {analysisResult.topicsWithQuestions.map((topic, index) => (
                                                <AccordionItem key={index} value={`topic-${index}`} className="bg-background/50 rounded-lg border px-4">
                                                    <AccordionTrigger className="font-headline text-lg hover:no-underline">
                                                        {topic.topicName}
                                                    </AccordionTrigger>
                                                    <AccordionContent className="space-y-6 pt-4">
                                                        <p className="text-sm text-muted-foreground italic">{topic.description}</p>
                                                        
                                                        <div className="space-y-4">
                                                            <h4 className='font-semibold'>Multiple Choice Questions</h4>
                                                            {topic.multipleChoiceQuestions.map((mcq, mcqIndex) => (
                                                                <MCQ key={mcqIndex} {...mcq} />
                                                            ))}
                                                        </div>

                                                        <div className="space-y-4">
                                                            <h4 className='font-semibold'>Short Answer Questions</h4>
                                                            {topic.shortAnswerQuestions.map((saq, saqIndex) => (
                                                                <div key={saqIndex} className="space-y-2 rounded-md border p-4 bg-secondary/40">
                                                                    <p className="font-semibold">{saq.question}</p>
                                                                    <Separator />
                                                                    <div className="text-sm text-muted-foreground prose prose-invert max-w-none">
                                                                        <p className='font-bold text-accent'>Answer:</p>
                                                                        <div dangerouslySetInnerHTML={{ __html: saq.answer.replace(/\n/g, '<br />') }} />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
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
