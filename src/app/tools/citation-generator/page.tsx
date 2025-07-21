
'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePenLine, Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateCitations, type GenerateCitationsInput, type GenerateCitationsOutput } from '@/ai/flows/ai-citation-generator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const citationStyles = ['MLA', 'APA', 'Chicago', 'Harvard'];

const CitationCard = ({ citation }: { citation: GenerateCitationsOutput['citations'][0] }) => {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(citation.formattedCitation);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="p-4 bg-secondary/30 rounded-lg">
            <p className="text-sm text-muted-foreground prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: citation.formattedCitation }} />
            <div className="text-xs text-accent mt-2">
                <span className='font-bold'>Note:</span> {citation.verificationNotes}
            </div>
            <div className="flex justify-end mt-2">
                <Button size="sm" variant="ghost" onClick={handleCopy}>
                    {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Copied!' : 'Copy'}
                </Button>
            </div>
        </div>
    )
}

export default function CitationGeneratorPage() {
  const { toast } = useToast();

  // Inputs
  const [text, setText] = useState('');
  const [style, setStyle] = useState('MLA');

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateCitationsOutput | null>(null);

  const canSubmit = text && style;

  const handleGenerate = async () => {
    if (!canSubmit) {
      toast({ title: "Missing Details", description: "Please paste some text and select a citation style.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);

    const input: GenerateCitationsInput = {
      text,
      style: style as any,
    };

    try {
      const aiResult = await generateCitations(input);
      setResult(aiResult);
      toast({ title: 'Citations Generated!', description: 'The AI has analyzed your text and created citations.' });
    } catch (error) {
      console.error(error);
      toast({ title: "Generation Failed", description: "The AI couldn't process your text. Please try again.", variant: 'destructive'});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex items-center gap-4">
          <FilePenLine className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">AI Citation Generator</h1>
            <p className="text-muted-foreground mt-1">Generate citations from any text and verify authenticity.</p>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <Card className="bg-secondary/30">
            <CardHeader>
              <CardTitle>1. Paste Your Content</CardTitle>
              <CardDescription>Provide the text and select your desired citation style.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the paragraph or content you need to cite here..."
                rows={12}
              />
              <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger><SelectValue placeholder="Select Citation Style" /></SelectTrigger>
                  <SelectContent>{citationStyles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <Button onClick={handleGenerate} disabled={!canSubmit || isLoading} className="w-full text-lg py-6 shadow-glow hover:shadow-glow-sm transition-shadow">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                Generate Citations
              </Button>
            </CardContent>
          </Card>

          {(isLoading || result) && (
            <Card className='animate-in fade-in duration-500 sticky top-8'>
                <CardHeader>
                    <CardTitle className='font-headline text-2xl'>AI-Generated Citations</CardTitle>
                    <CardDescription>Citations are formatted in {style} style. Click to copy.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[75vh] overflow-y-auto pr-4">
                    {isLoading && (
                        <div className="flex items-center justify-center p-8 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mr-4" />
                            <p>Analyzing sources and formatting citations...</p>
                        </div>
                    )}
                    {result?.citations && result.citations.length > 0 && (
                        result.citations.map((citation, index) => (
                            <CitationCard key={index} citation={citation} />
                        ))
                    )}
                    {result?.citations && result.citations.length === 0 && (
                         <div className="text-center text-muted-foreground py-10">No citable sources were found in the provided text.</div>
                    )}
                </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
