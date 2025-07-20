
'use client';

import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Loader2, Sparkles, BookCheck, FunctionSquare } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { generateFormulas, type GenerateFormulasInput, type GenerateFormulasOutput } from '@/ai/flows/ai-formula-generator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { saveLibraryItem } from '@/lib/library';

const subjects = ['Physics', 'Mathematics', 'Chemistry'];

export default function FormulaBankPage() {
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [formulaSet, setFormulaSet] = useState<GenerateFormulasOutput | null>(null);

  const handleGenerateFormulas = async () => {
    if (!subject || !topic) {
      toast({
        title: 'Missing Information',
        description: 'Please select a subject and provide a topic.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setFormulaSet(null);

    const input: GenerateFormulasInput = { subject, topic };

    try {
      const result = await generateFormulas(input);
      setFormulaSet(result);
      saveLibraryItem({
        type: 'Formula Bank',
        title: `Formulas for ${topic}`,
        payload: { input, result },
      });
      toast({
        title: 'Formulas Generated!',
        description: `Your formula bank for ${topic} is ready and saved to your library.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Generation Failed',
        description: 'The AI failed to generate formulas. Please try again.',
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
          <Calculator className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">Smart Formula Bank</h1>
            <p className="text-muted-foreground mt-1">Get categorized formulas with explanations and derivations.</p>
          </div>
        </header>

        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle>1. Define Your Search</CardTitle>
            <CardDescription>Select a subject and enter a topic to find the formulas you need.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
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
              placeholder="e.g., Kinematics, Integration, Stoichiometry"
              className="md:col-span-2"
            />
             <Button onClick={handleGenerateFormulas} disabled={isLoading || !subject || !topic} className="w-full md:col-span-3 text-lg py-6 shadow-glow hover:shadow-glow-sm transition-shadow">
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
              Generate Formula Bank
            </Button>
          </CardContent>
        </Card>

        {(isLoading || formulaSet) && (
            <Card className='animate-in fade-in duration-500'>
                <CardHeader>
                    <CardTitle className='font-headline text-2xl flex items-center gap-2'>
                        <FunctionSquare className='text-accent'/>
                        AI-Generated Formulas for {topic}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading && (
                        <div className="flex items-center justify-center p-8 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mr-4" />
                            <p>The AI is searching the archives of knowledge...</p>
                        </div>
                    )}
                    {formulaSet && formulaSet.formulas.length > 0 ? (
                        <Accordion type="multiple" className="space-y-4">
                          {formulaSet.formulas.map((item, index) => (
                             <AccordionItem key={index} value={`item-${index}`} className="bg-secondary/30 rounded-lg px-4 border-b-0">
                                <AccordionTrigger className="font-headline text-lg hover:no-underline">
                                    {item.name}
                                </AccordionTrigger>
                                <AccordionContent className="space-y-6">
                                    <div className="bg-background/50 rounded-md p-4">
                                      <h4 className="font-semibold text-accent mb-2">Formula</h4>
                                      <div className='text-xl'>
                                        <BlockMath math={item.formula} />
                                      </div>
                                    </div>
                                    <div className="bg-background/50 rounded-md p-4">
                                      <h4 className="font-semibold text-accent mb-2">Explanation</h4>
                                      <p className="text-muted-foreground">{item.explanation}</p>
                                    </div>
                                    {item.derivation && item.derivation.length > 0 && (
                                       <div className="bg-background/50 rounded-md p-4">
                                          <h4 className="font-semibold text-accent mb-2">Derivation Steps</h4>
                                          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                                            {item.derivation.map((step, i) => <li key={i}>{step}</li>)}
                                          </ol>
                                      </div>
                                    )}
                                </AccordionContent>
                             </AccordionItem>
                          ))}
                        </Accordion>
                    ) : (
                      !isLoading && <div className="text-center py-10 text-muted-foreground">No formulas found for this topic.</div>
                    )}
                </CardContent>
            </Card>
        )}
      </div>
    </AppLayout>
  );
}
