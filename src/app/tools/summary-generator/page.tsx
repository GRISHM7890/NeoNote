
'use client';

import { useState, type ChangeEvent } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Loader2, Sparkles, UploadCloud, Wand2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { generateSummary, type GenerateSummaryInput, type GenerateSummaryOutput } from '@/ai/flows/ai-summary-generator';
import { imageToText } from '@/ai/flows/image-to-text';
import Image from 'next/image';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function SummaryGeneratorPage() {
  const { toast } = useToast();
  const [inputText, setInputText] = useState('');
  const [studyLevel, setStudyLevel] = useState<'simple' | 'advanced'>('advanced');
  const [summaryGoal, setSummaryGoal] = useState('quick_review');
  const [outputFormat, setOutputFormat] = useState('paragraph');
  
  const [imageData, setImageData] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [summary, setSummary] = useState<GenerateSummaryOutput | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreview(URL.createObjectURL(file));
        setImageData(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtractText = async () => {
    if (!imageData) return;
    setIsExtracting(true);
    try {
      const result = await imageToText({ photoDataUri: imageData });
      setInputText(result.extractedText);
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

  const handleGenerateSummary = async () => {
    if (!inputText) {
      toast({
        title: 'Input text is empty',
        description: 'Please provide some text to summarize.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setSummary(null);

    const input: GenerateSummaryInput = {
      text: inputText,
      studyLevel,
      goal: summaryGoal,
      outputFormat,
    };

    try {
      const result = await generateSummary(input);
      setSummary(result);
      toast({
        title: 'Summary Generated!',
        description: 'Your personalized summary is ready.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Generation Failed',
        description: 'The AI failed to generate a summary. Please try again.',
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
          <BrainCircuit className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">AI Summary Generator</h1>
            <p className="text-muted-foreground mt-1">Generate precise, personalized summaries from any text or image.</p>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Input Section */}
          <Card className="bg-secondary/30">
            <CardHeader>
              <CardTitle>1. Provide Your Content</CardTitle>
              <CardDescription>Paste your text or upload an image of your notes.</CardDescription>
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
                    <UploadCloud className="mr-2" /> Upload Image
                </Button>

                {imagePreview && (
                  <div className='space-y-2'>
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                      <Image src={imagePreview} alt="Uploaded preview" layout="fill" objectFit="contain" />
                    </div>
                     <Button onClick={handleExtractText} disabled={isExtracting} className="w-full">
                        {isExtracting ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2" />}
                        Extract Text from Image
                    </Button>
                  </div>
                )}
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={12}
                placeholder="Paste your text here..."
                className="text-base bg-card"
              />
            </CardContent>
          </Card>

          {/* Configuration Section */}
          <Card className="bg-secondary/30">
            <CardHeader>
              <CardTitle>2. Personalize Your Summary</CardTitle>
              <CardDescription>Tell the AI how you want to learn.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Study Level</Label>
                <RadioGroup value={studyLevel} onValueChange={(v) => setStudyLevel(v as any)} className="flex gap-4">
                  <Label className="flex items-center gap-2 p-3 rounded-md border border-input has-[:checked]:border-primary transition-colors cursor-pointer flex-1">
                    <RadioGroupItem value="simple" id="simple" />
                    <div>
                        <p className='font-semibold'>Simple</p>
                        <p className='text-xs text-muted-foreground'>For primary students.</p>
                    </div>
                  </Label>
                  <Label className="flex items-center gap-2 p-3 rounded-md border border-input has-[:checked]:border-primary transition-colors cursor-pointer flex-1">
                    <RadioGroupItem value="advanced" id="advanced" />
                    <div>
                        <p className='font-semibold'>Advanced</p>
                        <p className='text-xs text-muted-foreground'>For competitive exams.</p>
                    </div>
                  </Label>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">Learning Goal</Label>
                <Select value={summaryGoal} onValueChange={setSummaryGoal}>
                  <SelectTrigger id="goal" className="w-full">
                    <SelectValue placeholder="Select a goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quick_review">Quick Review</SelectItem>
                    <SelectItem value="deep_understanding">Deep Understanding</SelectItem>
                    <SelectItem value="exam_preparation">Exam Preparation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Output Format</Label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger id="format" className="w-full">
                    <SelectValue placeholder="Select a format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paragraph">Paragraph</SelectItem>
                    <SelectItem value="bullet_points">Bullet Points</SelectItem>
                    <SelectItem value="key_takeaways">Key Takeaways</SelectItem>
                  </SelectContent>
                </Select>
              </div>

               <Button onClick={handleGenerateSummary} disabled={isLoading || !inputText} className="w-full text-lg py-6 shadow-glow hover:shadow-glow-sm transition-shadow">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                Generate God-Tier Summary
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Output Section */}
        {(isLoading || summary) && (
            <Card className='animate-in fade-in duration-500'>
                <CardHeader>
                    <CardTitle className='font-headline text-2xl flex items-center gap-2'>
                        <Sparkles className='text-accent'/>
                        Your Personalized Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading && (
                        <div className="flex items-center justify-center p-8 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mr-4" />
                            <p>The AI is crafting your masterpiece...</p>
                        </div>
                    )}
                    {summary && (
                        <div className="space-y-6">
                            {summary.title && <h2 className="text-xl font-bold text-primary">{summary.title}</h2>}
                            <div className="prose prose-invert prose-p:text-foreground/80 prose-li:text-foreground/80 whitespace-pre-wrap">
                                {summary.content}
                            </div>
                            {summary.keywords && summary.keywords.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-2 text-accent">Keywords</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {summary.keywords.map((kw, i) => (
                                            <span key={i} className="px-3 py-1 text-sm rounded-full bg-secondary text-secondary-foreground">{kw}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        )}
      </div>
    </AppLayout>
  );
}
