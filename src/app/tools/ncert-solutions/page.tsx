
'use client';

import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookMarked, Loader2, Sparkles, Wand2, Lightbulb, TrendingUp, BookCopy, CheckCircle, FileQuestion } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { findSolution, type FindSolutionInput, type FindSolutionOutput } from '@/ai/flows/ai-solution-finder';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const boards = ['NCERT', 'CBSE', 'ICSE', 'Maharashtra State Board', 'Other'];
const classLevels = ['Class 9', 'Class 10', 'Class 11', 'Class 12'];
const subjects = ['Physics', 'Mathematics', 'Chemistry', 'Biology'];

export default function NCETrSolutionsPage() {
  const { toast } = useToast();
  // Form State
  const [board, setBoard] = useState('');
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [query, setQuery] = useState('');
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [solution, setSolution] = useState<FindSolutionOutput | null>(null);

  const handleFindSolution = async () => {
    if (!board || !className || !subject || !chapter || !query) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out all the fields to find a solution.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setSolution(null);

    const input: FindSolutionInput = { board, className, subject, chapter, query };

    try {
      const result = await findSolution(input);
      setSolution(result);
      toast({
        title: 'Solution Found!',
        description: `The AI has generated a detailed solution and analysis.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Generation Failed',
        description: 'The AI could not find a solution. Please check your query and try again.',
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
          <BookMarked className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">NCERT & Board Solutions</h1>
            <p className="text-muted-foreground mt-1">Get detailed solutions and exam analysis for any question.</p>
          </div>
        </header>

        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle>1. Find Your Question</CardTitle>
            <CardDescription>Provide the details of the textbook problem you're stuck on.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Select value={board} onValueChange={setBoard}>
                <SelectTrigger><SelectValue placeholder="Select Board" /></SelectTrigger>
                <SelectContent>{boards.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={className} onValueChange={setClassName}>
                <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                <SelectContent>{classLevels.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                <SelectContent>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
             <Input value={chapter} onChange={(e) => setChapter(e.target.value)} placeholder="Enter Chapter Name (e.g., Light - Reflection and Refraction)" />
             <Textarea value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Enter Question Number or paste the question text here..." rows={3}/>
            <Button onClick={handleFindSolution} disabled={isLoading} className="w-full text-lg py-6 shadow-glow hover:shadow-glow-sm transition-shadow">
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
              Find Solution
            </Button>
          </CardContent>
        </Card>

        {(isLoading || solution) && (
          <Card className='animate-in fade-in duration-500'>
            <CardHeader>
              <CardTitle className='font-headline text-2xl flex items-center gap-2'>
                <Wand2 className='text-accent' />
                AI Generated Solution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading && (
                <div className="flex items-center justify-center p-8 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin mr-4" />
                  <p>The AI is searching the archives and solving the problem...</p>
                </div>
              )}
              {solution && (
                <>
                  <Section icon={FileQuestion} title="Problem Statement">
                    <p className="p-4 bg-background rounded-md text-muted-foreground whitespace-pre-wrap">{solution.problemStatement}</p>
                  </Section>
                  <Section icon={Wand2} title="Step-by-Step Solution">
                     <ol className="list-decimal list-inside space-y-4">
                        {solution.stepByStepSolution.map((step, index) => (
                            <li key={index} className="p-3 bg-background rounded-md text-muted-foreground">
                                <BlockMath math={step}/>
                            </li>
                        ))}
                    </ol>
                  </Section>
                   <Section icon={CheckCircle} title="Final Answer">
                        <div className="p-4 bg-primary/10 rounded-md text-primary-foreground font-bold text-lg">
                           <BlockMath math={solution.finalAnswer} />
                        </div>
                    </Section>
                   <Section icon={Lightbulb} title="Concepts Involved">
                       <div className="flex flex-wrap gap-2">
                            {solution.conceptsInvolved.map(concept => <Badge key={concept}>{concept}</Badge>)}
                       </div>
                  </Section>
                   <Section icon={BookCopy} title="Similar Problems for Practice">
                        <div className="space-y-4">
                            {solution.similarProblems.map((p, i) => (
                                <div key={i} className="p-3 bg-background rounded-md">
                                    <p className="font-semibold whitespace-pre-wrap">{i+1}. {p.problem}</p>
                                    <p className="text-sm text-accent whitespace-pre-wrap">Answer: {p.answer}</p>
                                </div>
                            ))}
                        </div>
                  </Section>
                   <Section icon={TrendingUp} title="Past Paper Analysis">
                       <div className="p-4 bg-background rounded-md space-y-3">
                           <div className="flex items-center gap-4">
                               <p>Frequency:</p>
                               <Badge variant={solution.pastPaperAnalysis.frequency === 'High' ? 'default' : 'secondary'} className="text-base">{solution.pastPaperAnalysis.frequency}</Badge>
                           </div>
                           <div className="flex items-center gap-4">
                                <p>Seen In Years:</p>
                                <div className="flex flex-wrap gap-2">
                                {solution.pastPaperAnalysis.years.map(year => <Badge key={year} variant="outline">{year}</Badge>)}
                                </div>
                           </div>
                           <p className="text-muted-foreground pt-2 border-t border-border whitespace-pre-wrap">{solution.pastPaperAnalysis.notes}</p>
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


const Section = ({ title, icon: Icon, children }: { title: string, icon: React.ElementType, children: React.ReactNode }) => (
    <div>
        <h3 className="font-headline text-xl mb-3 flex items-center gap-2">
            <Icon className="w-5 h-5 text-primary" />
            {title}
        </h3>
        {children}
        <Separator className="mt-6" />
    </div>
);
