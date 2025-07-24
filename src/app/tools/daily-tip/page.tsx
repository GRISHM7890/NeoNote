
'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Loader2, Sparkles, Wand2, Brain, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateSmartTip, type GenerateSmartTipInput, type GenerateSmartTipOutput } from '@/ai/flows/ai-smart-tip-generator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const challenges = [
    "Procrastination",
    "Memorizing Formulas",
    "Understanding Complex Concepts",
    "Staying Focused",
    "Exam Anxiety",
    "Note Taking",
    "Time Management"
];

const subjects = ['General', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Mathematics', 'English'];

const TipCard = ({ tip }: { tip: GenerateSmartTipOutput }) => (
    <Card className="bg-secondary/30 animate-in fade-in duration-500">
        <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <Sparkles className="text-accent"/>
                Your Personalized Smart Tip
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="p-4 bg-primary/10 rounded-lg">
                <h3 className="font-bold text-lg text-primary">{tip.tipTitle}</h3>
            </div>
            <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2"><Lightbulb/> The Tip</h4>
                <p className="text-muted-foreground prose-sm max-w-none">{tip.tipContent}</p>
            </div>
             <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2"><Brain/> The Rationale</h4>
                <p className="text-muted-foreground prose-sm max-w-none">{tip.rationale}</p>
            </div>
        </CardContent>
    </Card>
);

export default function DailyTipPage() {
    const { toast } = useToast();
    const [subject, setSubject] = useState('General');
    const [challenge, setChallenge] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [tip, setTip] = useState<GenerateSmartTipOutput | null>(null);

    const canGenerate = challenge && subject;

    const handleGenerateTip = async () => {
        if (!canGenerate) {
            toast({ title: "Missing details", description: "Please select your challenge.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        setTip(null);
        
        const input: GenerateSmartTipInput = { subject, challenge };

        try {
            const result = await generateSmartTip(input);
            setTip(result);
            toast({ title: "Smart Tip Generated!", description: "Here is your personalized advice from the AI coach." });
        } catch (error) {
            console.error(error);
            toast({ title: "Generation Failed", description: "Could not get a tip from the AI. Please try again.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex items-center gap-4">
          <Lightbulb className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">Personalized Smart Tip</h1>
            <p className="text-muted-foreground mt-1">Get AI-powered study advice tailored to your current challenge.</p>
          </div>
        </header>

        <Card className="bg-secondary/30">
            <CardHeader>
                <CardTitle>What's your current study challenge?</CardTitle>
                <CardDescription>Tell the AI coach what you need help with to get a personalized tip.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Subject (Optional)</Label>
                        <Select value={subject} onValueChange={setSubject}>
                            <SelectTrigger><SelectValue placeholder="Select Subject"/></SelectTrigger>
                            <SelectContent>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Primary Challenge</Label>
                        <Select value={challenge} onValueChange={setChallenge}>
                            <SelectTrigger><SelectValue placeholder="Select Challenge"/></SelectTrigger>
                            <SelectContent>{challenges.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </div>
                <Button onClick={handleGenerateTip} disabled={!canGenerate || isLoading} className="w-full text-lg py-6 shadow-glow hover:shadow-glow-sm">
                    {isLoading ? <Loader2 className="animate-spin mr-2"/> : <Wand2 className="mr-2"/>}
                    Get My Smart Tip
                </Button>
            </CardContent>
        </Card>

        {isLoading && (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mr-4" />
                <p>The AI Coach is thinking of the perfect advice...</p>
            </div>
        )}

        {tip && <TipCard tip={tip} />}

      </div>
    </AppLayout>
  );
}
