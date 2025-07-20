'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Flashcard } from '@/components/flashcard';
import { MCQ } from '@/components/mcq';
import { generateFlashcards, type GenerateFlashcardsOutput } from '@/ai/flows/ai-flashcard-generator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, FileDown, Wand2, Lightbulb, ListChecks, BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function StudyPageContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [title, setTitle] = useState('Untitled Note');
  const [notes, setNotes] = useState('');
  const [topic, setTopic] = useState('');
  const [studySet, setStudySet] = useState<GenerateFlashcardsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initialText = searchParams.get('text');
    if (initialText) {
      setNotes(decodeURIComponent(initialText));
    }
  }, [searchParams]);

  const handleGenerateStudySet = async () => {
    if (!notes) {
      toast({
        title: 'Notes are empty',
        description: 'Please add some notes before generating a study set.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setStudySet(null);
    try {
      const result = await generateFlashcards({ notes, topic: topic || title });
      setStudySet(result);
      toast({
        title: 'Study set generated!',
        description: 'Your flashcards, quizzes, and concepts are ready.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Failed to generate study set',
        description: 'An error occurred with the AI. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-headline text-3xl md:text-4xl h-auto p-0 border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
            />
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a specific topic (optional)"
              className="text-sm mt-2 max-w-sm bg-transparent"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              <Lock className="mr-2" />
              Password
            </Button>
            <Button variant="outline" disabled>
              <FileDown className="mr-2" />
              Export PDF
            </Button>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle className="font-headline">Your Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={15}
                placeholder="Start typing your notes here or upload an image..."
                className="text-base"
              />
              <Button onClick={handleGenerateStudySet} disabled={isLoading} className="w-full shadow-glow hover:shadow-glow-sm transition-shadow">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2" />}
                Generate Study Set
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle className="font-headline">AI-Generated Study Set</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-48 w-full" />
                </div>
              )}
              {!isLoading && !studySet && (
                <div className="text-center text-muted-foreground py-10">
                  <Wand2 className="mx-auto h-12 w-12 mb-4" />
                  <p>Your generated study materials will appear here.</p>
                </div>
              )}
              {studySet && (
                <Accordion type="multiple" defaultValue={['concepts', 'flashcards', 'mcqs']} className="w-full">
                  <AccordionItem value="concepts">
                    <AccordionTrigger className="font-headline text-lg"><Lightbulb className="mr-2 text-accent"/>Core Concepts</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      {studySet.coreConcepts.map((concept, i) => (
                        <Badge key={i} variant="secondary">{concept}</Badge>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="flashcards">
                    <AccordionTrigger className="font-headline text-lg"><BookOpen className="mr-2 text-accent"/>Flashcards</AccordionTrigger>
                    <AccordionContent className="grid md:grid-cols-2 gap-4">
                      {studySet.flashcards.map((card, i) => (
                        <Flashcard key={i} term={card.term} definition={card.definition} />
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="mcqs">
                    <AccordionTrigger className="font-headline text-lg"><ListChecks className="mr-2 text-accent"/>Multiple Choice Questions</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      {studySet.multipleChoiceQuestions.map((mcq, i) => (
                        <div key={i}>
                          <MCQ {...mcq} />
                          {i < studySet.multipleChoiceQuestions.length -1 && <Separator className="my-4"/>}
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}


export default function StudyPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <StudyPageContent />
        </Suspense>
    )
}
