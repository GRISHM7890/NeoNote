
'use client';

import React, { useState, useRef, useEffect } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Square, Play, Loader2, Sparkles, Wand2, FileText, Redo } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { processVoiceNote } from '@/ai/flows/ai-voice-note-processor';

type RecordingStatus = 'idle' | 'recording' | 'stopped';

export default function VoiceNoteConverterPage() {
  const { toast } = useToast();
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [formattedNotes, setFormattedNotes] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStatus('recording');
      setAudioBlob(null);
      setAudioUrl(null);
      setFormattedNotes(null);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setStatus('stopped');
        stream.getTracks().forEach(track => track.stop()); // Stop the mic access
      };
      mediaRecorderRef.current.start();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({
        title: 'Microphone Error',
        description: 'Could not access the microphone. Please check your browser permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };
  
  const reset = () => {
    setStatus('idle');
    setAudioBlob(null);
    if(audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setFormattedNotes(null);
  }

  const handleProcessNote = async () => {
    if (!audioBlob) return;
    setIsLoading(true);
    setFormattedNotes(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        try {
            const result = await processVoiceNote({ audioDataUri: base64Audio });
            setFormattedNotes(result.formattedNotes);
            toast({
                title: "Notes Generated!",
                description: "Your voice note has been converted and formatted."
            })
        } catch (aiError) {
             console.error('AI processing failed:', aiError);
             toast({
                title: 'AI Error',
                description: 'Failed to process the audio. Please try again.',
                variant: 'destructive',
             });
        } finally {
            setIsLoading(false);
        }
      };
    } catch (error) {
      console.error('File reading error:', error);
      toast({
        title: 'Error',
        description: 'Could not process the recording. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex items-center gap-4">
          <Mic className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">Voice Note to Study Notes Converter</h1>
            <p className="text-muted-foreground mt-1">Record spoken explanations and convert them to formatted notes.</p>
          </div>
        </header>
        
        <Card className="bg-secondary/30">
            <CardHeader>
                <CardTitle>1. Record Your Voice Note</CardTitle>
                <CardDescription>Click the record button to start. Click stop when you're done.</CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col items-center gap-4'>
                {status === 'recording' ? (
                     <Button onClick={stopRecording} size="lg" className="bg-red-600 hover:bg-red-700 w-48 h-16 text-lg">
                        <Square className="mr-2" /> Stop Recording
                    </Button>
                ) : (
                    <Button onClick={startRecording} size="lg" className="w-48 h-16 text-lg shadow-glow hover:shadow-glow-sm">
                        <Mic className="mr-2" /> Start Recording
                    </Button>
                )}

                {status === 'stopped' && audioUrl && (
                    <div className='w-full max-w-md space-y-4 animate-in fade-in duration-500'>
                        <audio controls src={audioUrl} className='w-full'></audio>
                        <div className="flex gap-2">
                             <Button onClick={handleProcessNote} disabled={isLoading} className='w-full'>
                                {isLoading ? <Loader2 className='animate-spin mr-2'/> : <Wand2 className='mr-2'/>}
                                Generate Notes
                            </Button>
                            <Button onClick={reset} variant="outline">
                                <Redo className="mr-2"/> Record Again
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>

        {(isLoading || formattedNotes) && (
            <Card className='animate-in fade-in duration-500'>
                <CardHeader>
                    <CardTitle className='font-headline text-2xl flex items-center gap-2'>
                        <FileText className='text-accent'/>
                        Your AI-Formatted Study Notes
                    </Ttle>
                </CardHeader>
                <CardContent>
                    {isLoading && (
                        <div className="flex items-center justify-center p-8 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mr-4" />
                            <p>The AI is transcribing and formatting your notes...</p>
                        </div>
                    )}
                    {formattedNotes && (
                        <div 
                            className="prose prose-sm prose-invert max-w-none prose-headings:text-accent prose-strong:text-foreground"
                            dangerouslySetInnerHTML={{ __html: formattedNotes.replace(/\n/g, '<br />') }} 
                        />
                    )}
                </CardContent>
            </Card>
        )}

      </div>
    </AppLayout>
  );
}
