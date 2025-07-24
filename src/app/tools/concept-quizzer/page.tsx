
'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileQuestion, Loader2, Sparkles, HelpCircle, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateConceptQuiz, type GenerateConceptQuizInput, type GenerateConceptQuizOutput } from '@/ai/flows/ai-concept-quiz-generator';
import { Textarea } from '@/components/ui/textarea';
import { AnimatePresence, motion } from 'framer-motion';

export default function ConceptQuizzerPage() {
  const { toast } = useToast();

  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateConceptQuizOutput | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);

  const canSubmit = notes.trim().length > 0;
  
  const resetQuiz = () => {
    setResult(null);
    setCurrentIndex(0);
    setIsAnswerVisible(false);
  };

  const handleGenerateQuiz = async () => {
    if (!canSubmit) {
      toast({ title: "Notes are empty", description: "Please paste some notes to generate a quiz.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    resetQuiz();

    const input: GenerateConceptQuizInput = { notes };

    try {
      const aiResult = await generateConceptQuiz(input);
      if (aiResult.questions.length === 0) {
        toast({ title: 'No Questions Generated', description: 'The AI could not create questions from the provided text. Please try with more detailed notes.', variant: 'destructive' });
      } else {
        setResult(aiResult);
        toast({ title: 'Quiz Generated!', description: 'Your conceptual questions are ready.' });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Quiz Generation Failed", description: "The AI couldn't process your notes. Please try again.", variant: 'destructive'});
    } finally {
      setIsLoading(false);
    }
  };
  
  const goToNext = () => {
    if (result && currentIndex < result.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsAnswerVisible(false);
    }
  }
  
  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsAnswerVisible(false);
    }
  }
  
  const currentQuizItem = result?.questions[currentIndex];

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

          <div className="sticky top-8">
             {(isLoading || result) && (
              <Card className='animate-in fade-in duration-500'>
                  <CardHeader>
                      <CardTitle className='font-headline text-2xl'>AI-Generated Quiz</CardTitle>
                       <CardDescription>
                         {result ? `Question ${currentIndex + 1} of ${result.questions.length}`: 'Generating questions...'}
                       </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 min-h-[300px] flex flex-col justify-between">
                      {isLoading && (
                          <div className="flex items-center justify-center p-8 text-muted-foreground flex-1">
                              <Loader2 className="w-8 h-8 animate-spin mr-4" />
                              <p>The AI is thinking of some tough questions...</p>
                          </div>
                      )}
                      
                      <AnimatePresence mode="wait">
                      {currentQuizItem && (
                          <motion.div 
                            key={currentIndex}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                          >
                               <div className="p-4 bg-background/50 rounded-lg space-y-4">
                                  <div className="flex items-start gap-3">
                                    <HelpCircle className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                                    <p className="text-muted-foreground font-semibold">{currentQuizItem.question}</p>
                                  </div>
                                  
                                  <AnimatePresence>
                                  {isAnswerVisible && (
                                    <motion.div
                                       initial={{ opacity: 0, height: 0 }}
                                       animate={{ opacity: 1, height: 'auto' }}
                                       exit={{ opacity: 0, height: 0 }}
                                       className="overflow-hidden"
                                    >
                                      <div className="border-t pt-4">
                                          <h4 className="font-bold text-accent mb-2">Model Answer</h4>
                                          <p className="text-sm prose prose-sm prose-invert max-w-none">{currentQuizItem.modelAnswer}</p>
                                      </div>
                                    </motion.div>
                                  )}
                                  </AnimatePresence>
                               </div>
                               <Button variant="outline" onClick={() => setIsAnswerVisible(!isAnswerVisible)} className="w-full">
                                    {isAnswerVisible ? <EyeOff className="mr-2"/> : <Eye className="mr-2"/>}
                                    {isAnswerVisible ? 'Hide Answer' : 'Reveal Answer'}
                                </Button>
                          </motion.div>
                       )}
                       </AnimatePresence>

                       {result && result.questions.length > 0 && (
                          <div className="flex justify-between items-center pt-4">
                              <Button variant="ghost" onClick={goToPrev} disabled={currentIndex === 0}><ChevronLeft/> Prev</Button>
                              <Button variant="ghost" onClick={goToNext} disabled={currentIndex === result.questions.length - 1}>Next <ChevronRight/></Button>
                          </div>
                       )}

                       {result && result.questions.length === 0 && !isLoading && (
                           <div className="text-center text-muted-foreground py-10 flex-1 flex items-center justify-center">The AI couldn't generate any questions from the provided text.</div>
                      )}
                  </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
