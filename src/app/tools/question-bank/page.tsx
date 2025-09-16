
'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileQuestion, Loader2, Sparkles, CheckSquare, Edit, MessageSquare, PencilLine, Binary } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { generateQuestions, type GenerateQuestionsInput, type GenerateQuestionsOutput } from '@/ai/flows/ai-question-generator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { MCQ } from '@/components/mcq';
import { Separator } from '@/components/ui/separator';
import { saveLibraryItem } from '@/lib/library';
import { cn } from '@/lib/utils';

const subjects = ['Physics', 'Mathematics', 'Chemistry', 'Biology', 'History', 'Geography', 'Civics', 'Economics', 'English', 'Computer Science'];
const classLevels = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

type QuestionType = 'mcq' | 'short' | 'long' | 'fill_in_the_blanks' | 'true_or_false';

const questionTypeConfig: Record<QuestionType, { label: string, icon: React.ElementType }> = {
    mcq: { label: 'Multiple Choice', icon: CheckSquare },
    short: { label: 'Short Answer', icon: Edit },
    long: { label: 'Long Answer', icon: MessageSquare },
    fill_in_the_blanks: { label: 'Fill in the Blanks', icon: PencilLine },
    true_or_false: { label: 'True / False', icon: Binary },
};

export default function QuestionBankPage() {
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [className, setClassName] = useState('');
  const [topic, setTopic] = useState('');
  const [questionCounts, setQuestionCounts] = useState<Record<QuestionType, number>>({
    mcq: 5,
    short: 3,
    long: 0,
    fill_in_the_blanks: 0,
    true_or_false: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [questionSet, setQuestionSet] = useState<GenerateQuestionsOutput | null>(null);
  
  const hasSelectedQuestionType = Object.values(questionCounts).some(count => count > 0);

  const handleGenerateQuestions = async () => {
    if (!subject || !topic || !hasSelectedQuestionType) {
      toast({
        title: 'Missing Information',
        description: 'Please select a subject, provide a topic, and set a count for at least one question type.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setQuestionSet(null);
    
    const input: GenerateQuestionsInput = { 
        subject, 
        topic,
        className: className || undefined,
        counts: {
            mcq: questionCounts.mcq > 0 ? questionCounts.mcq : undefined,
            short: questionCounts.short > 0 ? questionCounts.short : undefined,
            long: questionCounts.long > 0 ? questionCounts.long : undefined,
            fill_in_the_blanks: questionCounts.fill_in_the_blanks > 0 ? questionCounts.fill_in_the_blanks : undefined,
            true_or_false: questionCounts.true_or_false > 0 ? questionCounts.true_or_false : undefined,
        }
    };

    try {
      const result = await generateQuestions(input);
      setQuestionSet(result);
      saveLibraryItem({
        type: 'Question Bank',
        title: `Test for ${topic}`,
        payload: { input, result },
      });
      toast({
        title: 'Questions Generated!',
        description: `Your question bank for ${topic} is ready and saved to your library.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Generation Failed',
        description: 'The AI failed to generate questions. Please try again.',
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
          <FileQuestion className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">Exam Booster Pack</h1>
            <p className="text-muted-foreground mt-1">Generate custom mock tests with answers for any subject/chapter.</p>
          </div>
        </header>

        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle>1. Define Your Mock Test</CardTitle>
            <CardDescription>Select a subject, topic, and the types of questions you want.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="grid md:grid-cols-3 gap-4">
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                 <Select value={className} onValueChange={setClassName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class (Optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {classLevels.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Photosynthesis"
                />
             </div>
             <div className="space-y-4">
                <Label>Question Types & Counts</Label>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(Object.keys(questionTypeConfig) as QuestionType[]).map((type) => (
                       <div key={type} className={cn("p-3 rounded-md border border-input transition-colors", questionCounts[type] > 0 ? "border-primary bg-primary/5" : "")}>
                            <div className="flex items-center justify-between">
                                <Label htmlFor={`check-${type}`} className="flex items-center gap-2 cursor-pointer">
                                    <Checkbox id={`check-${type}`} checked={questionCounts[type] > 0} onCheckedChange={(checked) => setQuestionCounts(prev => ({...prev, [type]: checked ? 5 : 0}))} />
                                    {questionTypeConfig[type].label}
                                </Label>
                                <Input 
                                    type="number" 
                                    className="w-16 h-8"
                                    min={0}
                                    max={20}
                                    value={questionCounts[type]}
                                    onChange={(e) => setQuestionCounts(prev => ({...prev, [type]: parseInt(e.target.value, 10)}))}
                                />
                            </div>
                       </div>
                    ))}
                </div>
             </div>
             <Button onClick={handleGenerateQuestions} disabled={isLoading || !subject || !topic || !hasSelectedQuestionType} className="w-full text-lg py-6 shadow-glow hover:shadow-glow-sm transition-shadow">
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
              Generate Mock Test
            </Button>
          </CardContent>
        </Card>

        {(isLoading || questionSet) && (
            <Card className='animate-in fade-in duration-500'>
                <CardHeader>
                    <CardTitle className='font-headline text-2xl flex items-center gap-2'>
                        <FileQuestion className='text-accent'/>
                        AI-Generated Mock Test for {topic}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading && (
                        <div className="flex items-center justify-center p-8 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mr-4" />
                            <p>The AI is crafting your questions...</p>
                        </div>
                    )}
                    {questionSet && (
                        <Accordion type="multiple" defaultValue={['mcq']} className="w-full space-y-2">
                           {questionSet.multipleChoiceQuestions && questionSet.multipleChoiceQuestions.length > 0 && (
                               <AccordionItem value="mcq" className="bg-secondary/30 rounded-lg px-4 border-b-0">
                                   <AccordionTrigger className="font-headline text-lg hover:no-underline"><CheckSquare className="mr-2 text-accent"/>Multiple Choice</AccordionTrigger>
                                   <AccordionContent className="space-y-4 pt-4">
                                      {questionSet.multipleChoiceQuestions.map((q, i) => (
                                         <div key={i}>
                                            <MCQ {...q} questionNumber={i+1} />
                                            {i < questionSet.multipleChoiceQuestions.length - 1 && <Separator className="my-4"/>}
                                         </div>
                                      ))}
                                   </AccordionContent>
                               </AccordionItem>
                           )}
                            {questionSet.shortAnswerQuestions && questionSet.shortAnswerQuestions.length > 0 && (
                               <AccordionItem value="short" className="bg-secondary/30 rounded-lg px-4 border-b-0">
                                   <AccordionTrigger className="font-headline text-lg hover:no-underline"><Edit className="mr-2 text-accent"/>Short Answer</AccordionTrigger>
                                   <AccordionContent className="space-y-4 pt-4">
                                      {questionSet.shortAnswerQuestions.map((q, i) => (
                                         <div key={i} className="p-4 bg-background rounded-md space-y-2"><p className="font-semibold">Q: {q.question}</p><p><span className="font-bold text-primary">A:</span> {q.answer}</p></div>
                                      ))}
                                   </AccordionContent>
                               </AccordionItem>
                           )}
                           {questionSet.longAnswerQuestions && questionSet.longAnswerQuestions.length > 0 && (
                                <AccordionItem value="long" className="bg-secondary/30 rounded-lg px-4 border-b-0">
                                   <AccordionTrigger className="font-headline text-lg hover:no-underline"><MessageSquare className="mr-2 text-accent"/>Long Answer</AccordionTrigger>
                                   <AccordionContent className="space-y-4 pt-4">
                                      {questionSet.longAnswerQuestions.map((q, i) => (
                                         <div key={i} className="p-4 bg-background rounded-md space-y-2"><p className="font-semibold">Q: {q.question}</p><div className="prose prose-sm prose-invert max-w-none"><p className='font-bold text-primary'>A:</p><div dangerouslySetInnerHTML={{ __html: q.answer.replace(/\n/g, '<br />') }} /></div></div>
                                      ))}
                                   </AccordionContent>
                               </AccordionItem>
                           )}
                           {questionSet.fillInTheBlanksQuestions && questionSet.fillInTheBlanksQuestions.length > 0 && (
                                <AccordionItem value="fill_in_the_blanks" className="bg-secondary/30 rounded-lg px-4 border-b-0">
                                   <AccordionTrigger className="font-headline text-lg hover:no-underline"><PencilLine className="mr-2 text-accent"/>Fill in the Blanks</AccordionTrigger>
                                   <AccordionContent className="space-y-4 pt-4">
                                      {questionSet.fillInTheBlanksQuestions.map((q, i) => (
                                         <div key={i} className="p-4 bg-background rounded-md space-y-2"><p className="font-semibold">{i+1}. {q.question}</p><p><span className="font-bold text-primary">Answer:</span> {q.answer}</p></div>
                                      ))}
                                   </AccordionContent>
                               </AccordionItem>
                           )}
                            {questionSet.trueOrFalseQuestions && questionSet.trueOrFalseQuestions.length > 0 && (
                                <AccordionItem value="true_or_false" className="bg-secondary/30 rounded-lg px-4 border-b-0">
                                   <AccordionTrigger className="font-headline text-lg hover:no-underline"><Binary className="mr-2 text-accent"/>True / False</AccordionTrigger>
                                   <AccordionContent className="space-y-4 pt-4">
                                      {questionSet.trueOrFalseQuestions.map((q, i) => (
                                         <div key={i} className="p-4 bg-background rounded-md space-y-2">
                                            <p className="font-semibold">{i+1}. {q.statement}</p>
                                            <p><span className="font-bold text-primary">Answer:</span> {q.isTrue ? "True" : "False"}. <span className="text-muted-foreground">{q.explanation}</span></p>
                                        </div>
                                      ))}
                                   </AccordionContent>
                               </AccordionItem>
                           )}
                        </Accordion>
                    )}
                </CardContent>
            </Card>
        )}
      </div>
    </AppLayout>
  );
}
