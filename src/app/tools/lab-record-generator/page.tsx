
'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FlaskConical, Loader2, Sparkles, Beaker, TestTube, Microscope, Check, ListOrdered, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { generateLabRecord, type GenerateLabRecordInput, type GenerateLabRecordOutput } from '@/ai/flows/ai-lab-record-generator';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const subjects = ['Physics', 'Chemistry', 'Biology'];
const classLevels = ['Class 9', 'Class 10', 'Class 11', 'Class 12'];
const boards = ['CBSE', 'ICSE', 'Maharashtra State Board', 'Other'];

export default function LabRecordGeneratorPage() {
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [className, setClassName] = useState('');
  const [board, setBoard] = useState('');
  const [experimentName, setExperimentName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [record, setRecord] = useState<GenerateLabRecordOutput | null>(null);

  const handleGenerateRecord = async () => {
    if (!subject || !className || !experimentName) {
      toast({
        title: 'Missing Information',
        description: 'Please select a subject, class, and provide an experiment name.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setRecord(null);

    const input: GenerateLabRecordInput = { 
        subject, 
        className,
        board: board === 'Other' ? undefined : board,
        experimentName 
    };

    try {
      const result = await generateLabRecord(input);
      setRecord(result);
      toast({
        title: 'Lab Record Generated!',
        description: `Your practical write-up for "${experimentName}" is ready.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Generation Failed',
        description: 'The AI failed to generate the lab record. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const Section = ({ title, content, icon: Icon }: { title: string, content: string | string[], icon: React.ElementType }) => {
    if (!content || (Array.isArray(content) && content.length === 0)) return null;

    return (
        <div className="space-y-3">
            <h3 className="font-headline text-xl flex items-center gap-2 text-primary"><Icon className="w-5 h-5"/>{title}</h3>
            {Array.isArray(content) ? (
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground pl-2">
                    {content.map((item, index) => <li key={index}>{item}</li>)}
                </ol>
            ) : (
                <div className="text-muted-foreground prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }}/>
            )}
            <Separator />
        </div>
    );
  };

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex items-center gap-4">
          <FlaskConical className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">Lab Record Generator</h1>
            <p className="text-muted-foreground mt-1">Get AI-written practicals with aim, apparatus, procedure, and result.</p>
          </div>
        </header>

        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle>1. Experiment Details</CardTitle>
            <CardDescription>Provide the details of your experiment to get started.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                <SelectContent>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={className} onValueChange={setClassName}>
                <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                <SelectContent>{classLevels.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
               <Select value={board} onValueChange={setBoard}>
                <SelectTrigger><SelectValue placeholder="Select Board (Optional)" /></SelectTrigger>
                <SelectContent>{boards.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Input
              value={experimentName}
              onChange={(e) => setExperimentName(e.target.value)}
              placeholder="Enter the name of the experiment (e.g., To study the characteristics of a common-emitter NPN transistor)"
            />
            <Button onClick={handleGenerateRecord} disabled={isLoading || !subject || !className || !experimentName} className="w-full text-lg py-6 shadow-glow hover:shadow-glow-sm transition-shadow">
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
              Generate Lab Record
            </Button>
          </CardContent>
        </Card>

        {(isLoading || record) && (
            <Card className='animate-in fade-in duration-500'>
                <CardHeader>
                    <CardTitle className='font-headline text-2xl flex items-center gap-2'>
                        <FlaskConical className='text-accent'/>
                        AI-Generated Practical for "{record?.aim || experimentName}"
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isLoading && (
                        <div className="flex items-center justify-center p-8 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mr-4" />
                            <p>The AI is preparing your lab record...</p>
                        </div>
                    )}
                    {record && (
                        <>
                           <Section title="Aim" content={record.aim} icon={Beaker} />
                           <Section title="Apparatus Required" content={record.apparatus} icon={TestTube} />
                           <Section title="Theory" content={record.theory} icon={Microscope} />
                           <Section title="Procedure" content={record.procedure} icon={ListOrdered} />
                           <Section title="Observation" content={record.observation} icon={Check} />
                           <Section title="Result" content={record.result} icon={Check} />
                           <Section title="Precautions" content={record.precautions} icon={AlertTriangle} />
                        </>
                    )}
                </CardContent>
            </Card>
        )}
      </div>
    </AppLayout>
  );
}
