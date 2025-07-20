
'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileQuestion, Loader2, Sparkles, CheckSquare, Edit, MessageSquare } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { generateQuestions, type GenerateQuestionsInput, type GenerateQuestionsOutput } from '@/ai/flows/ai-question-generator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { MCQ } from '@/components/mcq';
import { Separator } from '@/components/ui/separator';

const subjects = ['Physics', 'Mathematics', 'Chemistry', 'Biology', 'History', 'Geography', 'Civics'];

export default function QuestionBankPage() {
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [questionTypes, setQuestionTypes] = useState({
    mcq: true,
    short: true,
    long: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [questionSet, setQuestionSet] = useState<GenerateQuestionsOutput | null>(null);

  const handleQuestionTypeChange = (type: keyof typeof questionTypes) => {
    setQuestionTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };
  
  const hasSelectedQuestionType = Object.values(questionTypes).some(v => v);

  const handleGenerateQuestions = async () => {
    if (!subject || !topic || !hasSelectedQuestionType) {
      toast({
        title: 'Missing Information',
        description: 'Please select a subject, provide a topic, and choose at least one question type.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setQuestionSet(null);

    const types = (Object.keys(questionTypes) as Array<keyof typeof questionTypes>).filter(k => questionTypes[k]);

    const input: GenerateQuestionsInput = { 
        subject, 
        topic,
        questionCount,
        questionTypes: types,
    };

    try {
      const result = await generateQuestions(input);
      setQuestionSet(result);
      toast({
        title: 'Questions Generated!',
        description: `Your question bank for ${topic} is ready.`,
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
  
  const QuestionDisplay = ({ title, questions, icon: Icon, questionNumberStart = 1 }: { title: string, questions: { question: string, answer: string }[], icon: React.ElementType, questionNumberStart?: number }) => (
    <AccordionItem value={title.toLowerCase().replace(/\s/g, '-')}>
      <AccordionTrigger className="font-headline text-lg"><Icon className="mr-2 text-accent"/>{title} ({questions.length})</AccordionTrigger>
      <AccordionContent className="space-y-4">
        {questions.map((q, i) => (
          <div key={i} className="space-y-2 rounded-md border p-4 bg-background/50">
            <p className="font-semibold">{questionNumberStart + i}. {q.question}</p>
            <Separator />
            <div className="text-sm text-muted-foreground prose prose-invert max-w-none">
                <p className='font-bold text-accent'>Answer:</p>
                <div dangerouslySetInnerHTML={{ __html: q.answer.replace(/\n/g, '<br />') }} />
            </div>
          </div>
        ))}
      </AccordionContent>
    </AccordionItem>
  );

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex items-center gap-4">
          <FileQuestion className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">AI-Generated Question Bank</h1>
            <p className="text-muted-foreground mt-1">Generates questions with answers for any subject/chapter.</p>
          </div>
        </header>

        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle>1. Define Your Question Bank</CardTitle>
            <CardDescription>Select a subject, topic, and the types of questions you want.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid md:grid-cols-2 gap-4">
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
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Photosynthesis, The Mughal Empire"
                />
             </div>
             <div className="space-y-2">
                <Label>Question Types</Label>
                <div className="grid md:grid-cols-3 gap-2">
                    <Label className="flex items-center gap-2 p-3 rounded-md border border-input has-[:checked]:border-primary transition-colors cursor-pointer">
                        <Checkbox id="mcq" checked={questionTypes.mcq} onCheckedChange={() => handleQuestionTypeChange('mcq')} /> Multiple Choice
                    </Label>
                    <Label className="flex items-center gap-2 p-3 rounded-md border border-input has-[:checked]:border-primary transition-colors cursor-pointer">
                        <Checkbox id="short" checked={questionTypes.short} onCheckedChange={() => handleQuestionTypeChange('short')} /> Short Answer
                    </Label>
                    <Label className="flex items-center gap-2 p-3 rounded-md border border-input has-[:checked]:border-primary transition-colors cursor-pointer">
                        <Checkbox id="long" checked={questionTypes.long} onCheckedChange={() => handleQuestionTypeChange('long')} /> Long Answer
                    </Label>
                </div>
             </div>
             <div className="space-y-2">
                <Label htmlFor="q_count">Number of Questions (per type)</Label>
                <Input id="q_count" type="number" value={questionCount} onChange={(e) => setQuestionCount(Math.max(1, parseInt(e.target.value, 10)))} min="1" max="50" />
             </div>
             <Button onClick={handleGenerateQuestions} disabled={isLoading || !subject || !topic || !hasSelectedQuestionType} className="w-full text-lg py-6 shadow-glow hover:shadow-glow-sm transition-shadow">
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
              Generate Questions
            </Button>
          </CardContent>
        </Card>

        {(isLoading || questionSet) && (
            <Card className='animate-in fade-in duration-500'>
                <CardHeader>
                    <CardTitle className='font-headline text-2xl flex items-center gap-2'>
                        <FileQuestion className='text-accent'/>
                        AI-Generated Questions for {topic}
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
                        <Accordion type="multiple" defaultValue={['mcqs']} className="space-y-2">
                           {questionSet.multipleChoiceQuestions && questionSet.multipleChoiceQuestions.length > 0 && (
                               <AccordionItem value="mcqs">
                                   <AccordionTrigger className="font-headline text-lg"><CheckSquare className="mr-2 text-accent"/>Multiple Choice Questions ({questionSet.multipleChoiceQuestions.length})</AccordionTrigger>
                                   <AccordionContent className="space-y-4">
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
                                <QuestionDisplay title="Short Answer Questions" questions={questionSet.shortAnswerQuestions} icon={Edit} questionNumberStart={questionSet.multipleChoiceQuestions?.length || 0 + 1} />
                           )}
                           {questionSet.longAnswerQuestions && questionSet.longAnswerQuestions.length > 0 && (
                                <QuestionDisplay title="Long Answer Questions" questions={questionSet.longAnswerQuestions} icon={MessageSquare} questionNumberStart={(questionSet.multipleChoiceQuestions?.length || 0) + (questionSet.shortAnswerQuestions?.length || 0) + 1} />
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
