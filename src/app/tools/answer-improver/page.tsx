
'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Loader2, Sparkles, Wand2, Check, X, Star, FileCheck, BrainCog } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { improveAnswer, type ImproveAnswerInput, type ImproveAnswerOutput } from '@/ai/flows/ai-answer-improver';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { saveLibraryItem } from '@/lib/library';

const subjects = ['Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Political Science', 'Economics', 'English'];
const examLevels = ['School Exam (Class 9-10)', 'Board Exam (Class 12)', 'NEET', 'JEE Main', 'JEE Advanced'];

const Section = ({ title, icon: Icon, children }: { title: string, icon: React.ElementType, children: React.ReactNode }) => (
    <div className="space-y-3">
        <h3 className="font-headline text-xl flex items-center gap-2 text-primary"><Icon className="w-5 h-5"/>{title}</h3>
        <div className="prose prose-sm prose-invert max-w-none text-muted-foreground">{children}</div>
        <Separator className="!mt-6" />
    </div>
);


export default function AnswerImproverPage() {
  const { toast } = useToast();

  // Inputs
  const [question, setQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [subject, setSubject] = useState('');
  const [examLevel, setExamLevel] = useState('');
  const [totalMarks, setTotalMarks] = useState<number | ''>(5);

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImproveAnswerOutput | null>(null);

  const canSubmit = question && userAnswer && subject && examLevel && totalMarks;

  const handleImproveAnswer = async () => {
    if (!canSubmit) {
      toast({ title: "Missing Details", description: "Please fill out all the fields.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);

    const input: ImproveAnswerInput = {
      question,
      userAnswer,
      subject,
      examLevel,
      totalMarks: +totalMarks,
    };

    try {
      const aiResult = await improveAnswer(input);
      setResult(aiResult);
      saveLibraryItem({
        type: 'Answer Improver Analysis',
        title: `Feedback for "${question.substring(0,30)}..."`,
        payload: { input, result: aiResult },
      });
      toast({ title: 'Feedback Generated!', description: 'Your detailed answer analysis is ready.' });
    } catch (error) {
      console.error(error);
      toast({ title: "Analysis Failed", description: "The AI couldn't process your answer. Please try again.", variant: 'destructive'});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex items-center gap-4">
          <Lightbulb className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">AI Answer Improver</h1>
            <p className="text-muted-foreground mt-1">Get god-tier feedback to turn your answers into top-scoring masterpieces.</p>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <Card className="bg-secondary/30">
            <CardHeader>
              <CardTitle>1. Your Answer & Question Context</CardTitle>
              <CardDescription>Provide all details for the most accurate AI feedback.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">Original Question</Label>
                <Textarea id="question" value={question} onChange={e => setQuestion(e.target.value)} placeholder="What is the law of thermodynamics?" rows={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userAnswer">Your Answer</Label>
                <Textarea id="userAnswer" value={userAnswer} onChange={e => setUserAnswer(e.target.value)} placeholder="Paste your complete answer here..." rows={6} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select value={subject} onValueChange={setSubject}>
                        <SelectTrigger id="subject"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                        <SelectContent>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="examLevel">Exam Level</Label>
                    <Select value={examLevel} onValueChange={setExamLevel}>
                        <SelectTrigger id="examLevel"><SelectValue placeholder="Select Level" /></SelectTrigger>
                        <SelectContent>{examLevels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                    </Select>
                 </div>
              </div>
               <div className="space-y-2">
                  <Label htmlFor="totalMarks">Total Marks</Label>
                  <Input id="totalMarks" type="number" value={totalMarks} onChange={e => setTotalMarks(e.target.value === '' ? '' : +e.target.value)} placeholder="e.g., 5" />
              </div>
              <Button onClick={handleImproveAnswer} disabled={!canSubmit || isLoading} className="w-full text-lg py-6 shadow-glow hover:shadow-glow-sm transition-shadow">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                Get Expert Feedback
              </Button>
            </CardContent>
          </Card>

          {(isLoading || result) && (
            <Card className='animate-in fade-in duration-500 sticky top-8'>
                <CardHeader>
                    <CardTitle className='font-headline text-2xl flex items-center gap-2'>
                        <Wand2 className='text-accent'/>
                        AI-Generated Feedback
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 max-h-[75vh] overflow-y-auto pr-4">
                    {isLoading && (
                        <div className="flex items-center justify-center p-8 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mr-4" />
                            <p>The AI examiner is grading your answer...</p>
                        </div>
                    )}
                    {result && (
                        <>
                            <div className="p-4 bg-primary/10 rounded-lg text-center">
                                <p className="text-muted-foreground font-semibold">Predicted Score</p>
                                <p className="text-4xl font-bold text-primary">{result.predictedScore} <span className="text-xl text-muted-foreground">/ {totalMarks}</span></p>
                            </div>
                             <Separator />

                            <Section title="God-Tier Model Answer" icon={FileCheck}>
                                <div dangerouslySetInnerHTML={{ __html: result.modelAnswer.replace(/\n/g, '<br />') }}/>
                            </Section>
                            
                            <Section title="Your Strengths" icon={Check}>
                                 <ul className="list-disc pl-5 space-y-2">
                                    {result.strengths.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </Section>

                            <Section title="Areas for Improvement" icon={X}>
                                <ul className="list-disc pl-5 space-y-2">
                                    {result.areasForImprovement.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </Section>

                             <Section title="Detailed Feedback" icon={BrainCog}>
                                 <p>{result.detailedFeedback}</p>
                            </Section>
                        </>
                    )}
                </CardContent>
            </Card>
        )}
        </div>
      </div>
    </AppLayout>
  );
}
