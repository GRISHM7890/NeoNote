
'use client';

import React, { useState, useRef, useEffect } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCog, Loader2, Sparkles, Wand2, Mic, Square, Check, X, Book, MessageSquare, Goal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { processBlurt, type ProcessBlurtInput, type ProcessBlurtOutput } from '@/ai/flows/ai-blurt-processor';
import { processVoiceNote } from '@/ai/flows/ai-voice-note-processor';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

type RecordingStatus = 'idle' | 'recording' | 'stopped' | 'transcribing';

const BlurtAnalysis = ({ analysis }: { analysis: ProcessBlurtOutput }) => (
    <Card className='bg-secondary/30 animate-in fade-in duration-500'>
        <CardHeader>
            <CardTitle className="font-headline text-2xl">Recall Analysis</CardTitle>
            <CardDescription>Here's how you did on your active recall session.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
            <div>
                <div className='flex justify-between items-center mb-2'>
                    <Label className="text-muted-foreground">Recall Score</Label>
                    <span className="text-xl font-bold text-primary">{analysis.recallScore}%</span>
                </div>
                <Progress value={analysis.recallScore} />
            </div>
            <Separator />
            <div className='grid md:grid-cols-2 gap-6'>
                <div className='space-y-3'>
                    <h4 className='font-semibold flex items-center gap-2 text-green-400'><Check /> Concepts Mentioned</h4>
                    <div className="flex flex-wrap gap-2">
                        {analysis.keyConceptsMentioned.map(concept => <Badge key={concept} variant="secondary">{concept}</Badge>)}
                        {analysis.keyConceptsMentioned.length === 0 && <p className='text-sm text-muted-foreground'>No key concepts were mentioned.</p>}
                    </div>
                </div>
                 <div className='space-y-3'>
                    <h4 className='font-semibold flex items-center gap-2 text-red-400'><X /> Concepts Missed</h4>
                    <div className="flex flex-wrap gap-2">
                        {analysis.keyConceptsMissed.map(concept => <Badge key={concept} variant="destructive">{concept}</Badge>)}
                         {analysis.keyConceptsMissed.length === 0 && <p className='text-sm text-muted-foreground'>Great job! You didn't miss any key concepts.</p>}
                    </div>
                </div>
            </div>
            <Separator />
            <div className='space-y-3'>
                 <h4 className='font-semibold flex items-center gap-2 text-accent'><MessageSquare /> AI Feedback</h4>
                 <p className='text-muted-foreground prose-sm max-w-none'>{analysis.feedback}</p>
            </div>
        </CardContent>
    </Card>
);


export default function BlurtBoardPage() {
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [blurtText, setBlurtText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ProcessBlurtOutput | null>(null);

  // Voice recording state
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setRecordingStatus('recording');
      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        setRecordingStatus('transcribing');
        
        try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = reader.result as string;
                const result = await processVoiceNote({ audioDataUri: base64Audio });
                setBlurtText(result.rawTranscript);
                toast({ title: "Transcription complete!", description: "Your spoken words are now ready for analysis." });
                setRecordingStatus('stopped');
            }
        } catch (error) {
            toast({ title: 'Transcription Failed', description: 'Could not convert your audio to text.', variant: 'destructive' });
            setRecordingStatus('idle');
        }
      };
      mediaRecorderRef.current.start();
    } catch (err) {
      toast({ title: 'Microphone Error', description: 'Could not access the microphone.', variant: 'destructive' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingStatus === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleAnalyzeBlurt = async () => {
    if (!topic || !blurtText) {
      toast({ title: 'Missing Information', description: 'Please provide a topic and your blurt text.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setAnalysis(null);

    try {
      const result = await processBlurt({ topic, blurtText });
      setAnalysis(result);
      toast({ title: 'Analysis Complete!', description: 'Your recall score is ready.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Analysis Failed', description: 'The AI could not process your blurt.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex items-center gap-4">
          <BrainCog className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">Blurt Board</h1>
            <p className="text-muted-foreground mt-1">Test your active recall and get an AI-powered score.</p>
          </div>
        </header>

        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle>1. Start Your Blurt Session</CardTitle>
            <CardDescription>Enter a topic, then write or speak everything you remember about it.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Photosynthesis, The Cold War" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="blurt-text">Blurt Content</Label>
                <Textarea id="blurt-text" value={blurtText} onChange={(e) => setBlurtText(e.target.value)} rows={10} placeholder="Write everything you remember here..." />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
                {recordingStatus === 'idle' || recordingStatus === 'stopped' ? (
                    <Button variant="outline" onClick={startRecording}><Mic className="mr-2" /> Record & Blurt</Button>
                ) : recordingStatus === 'recording' ? (
                    <Button variant="destructive" onClick={stopRecording}><Square className="mr-2" /> Stop Recording</Button>
                ) : (
                    <Button variant="outline" disabled><Loader2 className="mr-2 animate-spin" /> Transcribing...</Button>
                )}
                <Button onClick={handleAnalyzeBlurt} disabled={isLoading || !topic || !blurtText} className="flex-1 shadow-glow hover:shadow-glow-sm">
                    {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                    Analyze My Recall
                </Button>
            </div>
          </CardContent>
        </Card>

        {analysis && <BlurtAnalysis analysis={analysis} />}
      </div>
    </AppLayout>
  );
}
