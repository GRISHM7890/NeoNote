
'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileQuestion, Loader2, Sparkles, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateConceptQuiz, type GenerateConceptQuizInput, type GenerateConceptQuizOutput } from '@/ai/flows/ai-concept-quiz-generator';
import { Textarea } from '@/components/ui/textarea';

export default function ConceptQuizzerPage() {
  const { toast } = useToast();

  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateConceptQuizOutput | null>(null);

  const canSubmit = notes.trim().length > 0;

  const handleGenerateQuiz = async () => {
    if (!canSubmit) {
      toast({ title: "Notes are empty", description: "Please paste some notes to generate a quiz.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);

    const input: GenerateConceptQuizInput = { notes };

    try {
      const aiResult = await generateConceptQuiz(input);
      setResult(aiResult);
      toast({ title: 'Quiz Generated!', description: 'Your conceptual questions are ready.' });
    } catch (error) {
      console.error(error);
      toast({ title: "Quiz Generation Failed", description: "The AI couldn't process your notes. Please try again.", variant: 'destructive'});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex items-center gap-4">
          <FileQuestion className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">Quick Concept Quizzer</h1>
            <p className="text-muted-foreground mt-1">Test your understanding with AI-generated conceptual questions.</p>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <Card className="bg-secondary/30">
            <CardHeader>
              <CardTitle>1. Paste Your Notes</CardTitle>
              <CardDescription>Provide the study material you want to be quizzed on.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste the chapter notes, a summary, or any paragraph here..."
                rows={12}
              />
              <Button onClick={handleGenerateQuiz} disabled={!canSubmit || isLoading} className="w-full text-lg py-6 shadow-glow hover:shadow-glow-sm transition-shadow">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                Generate Conceptual Quiz
              </Button>
            </CardContent>
          </Card>

          {(isLoading || result) && (
            <Card className='animate-in fade-in duration-500 sticky top-8'>
                <CardHeader>
                    <CardTitle className='font-headline text-2xl'>AI-Generated Quiz</CardTitle>
                     <CardDescription>Can you answer these questions based on your notes?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[75vh] overflow-y-auto pr-4">
                    {isLoading && (
                        <div className="flex items-center justify-center p-8 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mr-4" />
                            <p>The AI is thinking of some tough questions...</p>
                        </div>
                    )}
                    {result?.questions && result.questions.length > 0 && (
                       <ul className="space-y-4">
                         {result.questions.map((question, index) => (
                           <li key={index} className="flex items-start gap-3 p-4 bg-background/50 rounded-lg">
                             <HelpCircle className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                             <p className="text-muted-foreground">{question}</p>
                           </li>
                         ))}
                       </ul>
                    )}
                     {result?.questions && result.questions.length === 0 && !isLoading && (
                         <div className="text-center text-muted-foreground py-10">The AI couldn't generate any questions from the provided text.</div>
                    )}
                </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
