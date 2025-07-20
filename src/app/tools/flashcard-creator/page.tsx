
'use client';

import { useState, useRef, type ChangeEvent, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Flashcard } from '@/components/flashcard';
import { MCQ } from '@/components/mcq';
import { generateFlashcards, type GenerateFlashcardsOutput } from '@/ai/flows/ai-flashcard-generator';
import { imageToText } from '@/ai/flows/image-to-text';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Lightbulb, ListChecks, BookOpen, UploadCloud, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

function FlashcardCreatorContent() {
  const { toast } = useToast();

  const [notes, setNotes] = useState('');
  const [topic, setTopic] = useState('');
  const [studySet, setStudySet] = useState<GenerateFlashcardsOutput | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  
  const [imageData, setImageData] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreview(URL.createObjectURL(file));
        setImageData(dataUrl);
        setNotes('');
        setStudySet(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtractText = async () => {
    if (!imageData) return;
    setIsExtracting(true);
    try {
      const result = await imageToText({ photoDataUri: imageData });
      setNotes(result.extractedText);
      toast({
        title: 'Text Extracted!',
        description: 'Text from the image has been placed in the input field.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Extraction Failed',
        description: 'Could not extract text from the image.',
        variant: 'destructive',
      });
    } finally {
      setIsExtracting(false);
    }
  };

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
      const result = await generateFlashcards({ notes, topic: topic || 'General' });
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
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex items-center gap-4">
          <FileText className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">Chapter-wise Flashcards Creator</h1>
            <p className="text-muted-foreground mt-1">Take a photo of any chapter to instantly create flashcards.</p>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <Card className="bg-secondary/30">
            <CardHeader>
              <CardTitle>1. Provide Notes</CardTitle>
              <CardDescription>Upload an image or paste your text to get started.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full">
                <UploadCloud className="mr-2" /> {imagePreview ? "Change Image" : "Upload Image"}
              </Button>

              {imagePreview && (
                <div className='space-y-2'>
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                    <Image src={imagePreview} alt="Uploaded preview" layout="fill" objectFit="contain" />
                  </div>
                  <Button onClick={handleExtractText} disabled={isExtracting || !imageData} className="w-full">
                    {isExtracting ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2" />}
                    Extract Text from Image
                  </Button>
                </div>
              )}

              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={10}
                placeholder="Paste your text here or extract it from an image..."
                className="text-base bg-card"
              />

              <Button onClick={handleGenerateStudySet} disabled={isLoading || !notes} className="w-full text-lg py-6 shadow-glow hover:shadow-glow-sm transition-shadow">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2" />}
                Generate Study Set
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-secondary/30 sticky top-8">
            <CardHeader>
              <CardTitle className="font-headline">2. AI-Generated Study Set</CardTitle>
              <CardDescription>Review your concepts, flashcards, and quizzes.</CardDescription>
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
                <Accordion type="multiple" defaultValue={['concepts', 'flashcards', 'mcqs']} className="w-full max-h-[60vh] overflow-y-auto pr-4">
                  <AccordionItem value="concepts">
                    <AccordionTrigger className="font-headline text-lg"><Lightbulb className="mr-2 text-accent"/>Core Concepts</AccordionTrigger>
                    <AccordionContent className="flex flex-wrap gap-2">
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
                          {i < studySet.multipleChoiceQuestions.length - 1 && <Separator className="my-4"/>}
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

export default function FlashcardCreatorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FlashcardCreatorContent />
    </Suspense>
  )
}
