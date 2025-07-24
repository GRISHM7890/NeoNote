
'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookText, Loader2, Sparkles, FileText, StickyNote, HelpCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { generateChapterFullPackage, type GenerateChapterFullPackageInput, type GenerateChapterFullPackageOutput } from '@/ai/flows/ai-chapter-full-generator';
import { Input } from '@/components/ui/input';
import { saveLibraryItem } from '@/lib/library';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const boards = ['CBSE', 'ICSE', 'Maharashtra State Board', 'Other'];
const classLevels = ['Class 9', 'Class 10', 'Class 11', 'Class 12'];
const subjects = ['Physics', 'Mathematics', 'Chemistry', 'Biology', 'History', 'Geography', 'Civics', 'Economics', 'English', 'Computer Science'];

export default function ChapterFullAiPage() {
  const { toast } = useToast();
  // Form State
  const [board, setBoard] = useState('');
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [chapterName, setChapterName] = useState('');
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateChapterFullPackageOutput | null>(null);

  const canGenerate = board && className && subject && chapterName;

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast({ title: 'Missing Information', description: 'Please fill out all fields.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setResult(null);

    const input: GenerateChapterFullPackageInput = { board, className, subject, chapterName };

    try {
      const aiResult = await generateChapterFullPackage(input);
      setResult(aiResult);
      saveLibraryItem({
        type: 'Chapter Study Package',
        title: `Study Package for ${chapterName}`,
        payload: { input, result: aiResult },
      });
      toast({ title: 'Study Package Generated!', description: `Your full study package for ${chapterName} is ready and saved.` });
    } catch (error) {
      console.error(error);
      toast({ title: 'Generation Failed', description: 'The AI could not generate the study package. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex items-center gap-4">
          <BookText className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">Chapter Full AI</h1>
            <p className="text-muted-foreground mt-1">Get a complete summary, notes, and PYQs for any chapter.</p>
          </div>
        </header>

        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle>1. Chapter Details</CardTitle>
            <CardDescription>Provide the details of the chapter you want to master.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
               <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                <SelectContent>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <Input value={chapterName} onChange={(e) => setChapterName(e.target.value)} placeholder="Chapter Name (e.g., Light - Reflection)" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
               <Select value={className} onValueChange={setClassName}>
                <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                <SelectContent>{classLevels.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={board} onValueChange={setBoard}>
                <SelectTrigger><SelectValue placeholder="Select Board" /></SelectTrigger>
                <SelectContent>{boards.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerate} disabled={isLoading || !canGenerate} className="w-full text-lg py-6 shadow-glow hover:shadow-glow-sm transition-shadow">
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
              Generate Full Chapter Package
            </Button>
          </CardContent>
        </Card>

        {(isLoading || result) && (
          <Card className='animate-in fade-in duration-500'>
            <CardHeader>
              <CardTitle className='font-headline text-2xl flex items-center gap-2'>
                <BookText className='text-accent' />
                AI-Generated Study Package for "{chapterName}"
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex items-center justify-center p-8 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin mr-4" />
                  <p>The AI is preparing your study materials...</p>
                </div>
              )}
              {result && (
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="summary"><FileText className="mr-2"/> Summary</TabsTrigger>
                    <TabsTrigger value="notes"><StickyNote className="mr-2"/> Detailed Notes</TabsTrigger>
                    <TabsTrigger value="pyqs"><HelpCircle className="mr-2"/> PYQs</TabsTrigger>
                  </TabsList>
                  <TabsContent value="summary" className="p-4 bg-background/50 rounded-b-md border border-t-0 max-h-[60vh] overflow-y-auto">
                     <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: result.summary.replace(/\n/g, '<br />') }} />
                  </TabsContent>
                  <TabsContent value="notes" className="p-4 bg-background/50 rounded-b-md border border-t-0 max-h-[60vh] overflow-y-auto">
                     <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: result.notes.replace(/\n/g, '<br />') }} />
                  </TabsContent>
                  <TabsContent value="pyqs" className="p-2 bg-background/50 rounded-b-md border border-t-0 max-h-[60vh] overflow-y-auto">
                    <Accordion type="single" collapsible className="w-full">
                      {result.pyqs.map((item, index) => (
                          <AccordionItem key={index} value={`item-${index}`} className="bg-background/30 rounded-lg border px-4">
                              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                                Q{index + 1}: {item.question}
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: item.answer.replace(/\n/g, '<br />') }} />
                              </AccordionContent>
                          </AccordionItem>
                      ))}
                    </Accordion>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
