
'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Swords, Sparkles, Wand2, CheckCircle, XCircle, ArrowRight, ShieldQuestion, Star } from 'lucide-react';
import { generateBattleQuestions, type BattleQuestion, type GenerateBattleQuestionsInput } from '@/ai/flows/ai-battle-question-generator';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

type GameState = 'setup' | 'playing' | 'results';

export default function FlashcardBattlePage() {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>('setup');
  const [isLoading, setIsLoading] = useState(false);

  // Setup State
  const [notes, setNotes] = useState('');
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(5);

  // Playing State
  const [questions, setQuestions] = useState<BattleQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleStartBattle = async () => {
    if (!notes && !topic) {
      toast({ title: 'Missing Content', description: 'Please provide notes or a topic to start.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);

    try {
      const input: GenerateBattleQuestionsInput = {
        questionCount,
        notes: notes || undefined,
        topic: topic || undefined
      };
      const result = await generateBattleQuestions(input);
      if (result.questions.length === 0) {
        toast({ title: 'Generation Failed', description: 'The AI could not generate questions. Please try again.', variant: 'destructive' });
        setIsLoading(false);
        return;
      }
      setQuestions(result.questions.map(q => ({...q, options: q.options.sort(() => Math.random() - 0.5)}))); // Shuffle options
      setGameState('playing');
      toast({ title: "Let the battle begin!", description: "Answer the questions to the best of your ability."});
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to generate battle questions.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAnswerSubmit = () => {
    if (!selectedAnswer) return;
    setIsAnswered(true);
    if(selectedAnswer === questions[currentQuestionIndex].correctAnswer) {
        setScore(s => s + 1);
    }
  };

  const handleNextQuestion = () => {
    setIsAnswered(false);
    setSelectedAnswer(null);
    if(currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(i => i + 1);
    } else {
        setGameState('results');
    }
  };

  const resetGame = () => {
    setGameState('setup');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedAnswer(null);
  };
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex / questions.length) * 100;

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex items-center gap-4">
          <Swords className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">Flashcard Battle Mode</h1>
            <p className="text-muted-foreground mt-1">Gamify your revision with a solo quiz battle.</p>
          </div>
        </header>

        {gameState === 'setup' && (
          <Card className="bg-secondary/30 animate-in fade-in duration-500">
            <CardHeader>
              <CardTitle>1. Prepare Your Battle</CardTitle>
              <CardDescription>Provide notes or a topic for the AI to generate questions from.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={8}
                placeholder="Paste your notes here..."
              />
              <p className="text-center text-sm text-muted-foreground">OR</p>
              <Input 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="Enter a topic, e.g., 'The French Revolution'"
              />
               <div className="space-y-2">
                <Label htmlFor="q_count">Number of Questions</Label>
                <Input id="q_count" type="number" value={questionCount} onChange={(e) => setQuestionCount(Math.max(3, parseInt(e.target.value, 10)))} min="3" max="20" />
             </div>
              <Button onClick={handleStartBattle} disabled={isLoading} className="w-full text-lg py-6 shadow-glow hover:shadow-glow-sm">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Swords className="mr-2" />}
                Start Battle
              </Button>
            </CardContent>
          </Card>
        )}

        {gameState === 'playing' && currentQuestion && (
           <Card className="bg-secondary/30 animate-in fade-in duration-500 max-w-3xl mx-auto">
             <CardHeader>
                <div className="flex justify-between items-center mb-2">
                    <CardTitle className="font-headline">Question {currentQuestionIndex + 1} / {questions.length}</CardTitle>
                    <div className="flex items-center gap-2 text-lg font-bold text-accent">
                        <Star /> {score}
                    </div>
                </div>
                <Progress value={progress} className="w-full" />
             </CardHeader>
             <CardContent className="space-y-6">
                <div className="p-4 bg-background rounded-md min-h-[100px] flex items-center justify-center text-center">
                    <p className="text-lg font-semibold">{currentQuestion.question}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = selectedAnswer === option;
                        const isCorrect = currentQuestion.correctAnswer === option;
                        
                        return (
                            <Button 
                                key={index} 
                                variant="outline" 
                                size="lg"
                                className={cn(
                                    "h-auto py-4 whitespace-normal justify-start text-left",
                                    isAnswered && isCorrect && "bg-green-500/20 border-green-500 hover:bg-green-500/30",
                                    isAnswered && isSelected && !isCorrect && "bg-red-500/20 border-red-500 hover:bg-red-500/30",
                                    isSelected && !isAnswered && "border-primary"
                                )}
                                onClick={() => !isAnswered && setSelectedAnswer(option)}
                                disabled={isAnswered}
                            >
                                {option}
                            </Button>
                        )
                    })}
                </div>
                <div className="flex justify-end">
                    {isAnswered ? (
                         <Button onClick={handleNextQuestion} className="shadow-glow hover:shadow-glow-sm">
                            {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Battle"}
                            <ArrowRight />
                        </Button>
                    ): (
                         <Button onClick={handleAnswerSubmit} disabled={!selectedAnswer}>Check Answer</Button>
                    )}
                </div>
             </CardContent>
           </Card>
        )}

        {gameState === 'results' && (
            <Card className="bg-secondary/30 animate-in fade-in duration-500 max-w-3xl mx-auto text-center">
                <CardHeader>
                    <CardTitle className="font-headline text-4xl">Battle Over!</CardTitle>
                    <CardDescription>Here's how you performed.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-8 bg-primary/10 rounded-lg">
                        <p className="text-muted-foreground">Final Score</p>
                        <p className="text-6xl font-bold text-primary">{score} <span className="text-2xl text-muted-foreground">/ {questions.length}</span></p>
                    </div>
                    <Button onClick={resetGame} size="lg" className="shadow-glow hover:shadow-glow-sm">
                        Play Again
                    </Button>
                </CardContent>
            </Card>
        )}
      </div>
    </AppLayout>
  );
}
