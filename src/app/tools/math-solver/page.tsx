'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Loader2, Sparkles, UploadCloud, BrainCircuit, CheckCircle, Wand2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { solveEquation, type SolveEquationInput, type SolveEquationOutput } from '@/ai/flows/ai-equation-solver';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function MathSolverPage() {
  const { toast } = useToast();
  const [subject, setSubject] = useState<'Mathematics' | 'Chemistry' | ''>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [solution, setSolution] = useState<SolveEquationOutput | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreview(URL.createObjectURL(file));
        setImageData(dataUrl);
        setSolution(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSolve = async () => {
    if (!subject || !imageData) {
      toast({
        title: 'Missing Information',
        description: 'Please select a subject and upload an image of the problem.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setSolution(null);

    const input: SolveEquationInput = {
      subject,
      photoDataUri: imageData,
    };

    try {
      const result = await solveEquation(input);
      setSolution(result);
      toast({
        title: 'Problem Solved!',
        description: 'The AI has generated a step-by-step solution.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Solving Failed',
        description: 'The AI failed to solve the problem. Please try again with a clearer image.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetState = () => {
    setSubject('');
    setImageData(null);
    setImagePreview(null);
    setSolution(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex items-center gap-4">
          <Calculator className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">Math & Chemistry Solver</h1>
            <p className="text-muted-foreground mt-1">Scan an equation to get a step-by-step solution from AI.</p>
          </div>
        </header>

        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle>1. Upload Your Problem</CardTitle>
            <CardDescription>Select the subject and upload a clear image of the equation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Select value={subject} onValueChange={(v) => setSubject(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                </SelectContent>
              </Select>
               <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden"/>
               <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full">
                <UploadCloud className="mr-2" /> {imagePreview ? "Change Image" : "Upload Image"}
              </Button>
            </div>

            {imagePreview && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                    <Image src={imagePreview} alt="Uploaded problem" layout="fill" objectFit="contain" />
                </div>
            )}
            
            <Button onClick={handleSolve} disabled={isLoading || !subject || !imageData} className="w-full text-lg py-6 shadow-glow hover:shadow-glow-sm transition-shadow">
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
              Solve with AI
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
            <CardContent>
              {isLoading && (
                <div className="flex items-center justify-center p-8 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin mr-4" />
                  <p>The AI is calculating the solution...</p>
                </div>
              )}
              {solution && (
                <div className="space-y-6">
                    <div>
                        <h3 className="font-headline text-lg mb-2">Problem Statement</h3>
                        <p className="text-muted-foreground p-4 bg-background rounded-md">{solution.problemStatement}</p>
                    </div>
                     <Separator />
                    <div>
                        <h3 className="font-headline text-lg mb-2">Solution Steps</h3>
                        <ol className="list-decimal list-inside space-y-4">
                            {solution.solutionSteps.map((step, index) => (
                                <li key={index} className="p-3 bg-background rounded-md text-muted-foreground">
                                    <BlockMath math={step}/>
                                </li>
                            ))}
                        </ol>
                    </div>
                    <Separator />
                    <div>
                        <h3 className="font-headline text-lg mb-2 text-primary flex items-center gap-2"><CheckCircle />Final Answer</h3>
                        <div className="p-4 bg-primary/10 rounded-md text-primary-foreground font-bold text-lg">
                           <BlockMath math={solution.finalAnswer} />
                        </div>
                    </div>
                    <Separator />
                    <div>
                        <h3 className="font-headline text-lg mb-2 flex items-center gap-2"><BrainCircuit />Explanation</h3>
                        <p className="text-muted-foreground prose prose-sm prose-invert max-w-none">{solution.explanation}</p>
                    </div>

                    {solution.relatedConcepts && solution.relatedConcepts.length > 0 && (
                        <>
                        <Separator />
                        <div>
                            <h3 className="font-headline text-lg mb-2">Related Concepts</h3>
                            <div className="flex flex-wrap gap-2">
                                {solution.relatedConcepts.map(concept => (
                                    <Badge key={concept} variant="secondary">{concept}</Badge>
                                ))}
                            </div>
                        </div>
                        </>
                    )}
                    <Button onClick={resetState} variant="outline" className="w-full mt-4">Solve Another Problem</Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
