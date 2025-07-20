
'use client';

import React, { useState, useRef, useEffect } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Square, Loader2, Wand2, Bot, FilePlus, ShieldQuestion } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { processVoiceNote } from '@/ai/flows/ai-voice-note-processor';
import { parseVoiceCommand, type ParseCommandOutput } from '@/ai/flows/ai-voice-command-parser';

type CommandStatus = 'idle' | 'listening' | 'transcribing' | 'parsing' | 'understood' | 'error';

const StatusIndicator = ({ status, text }: { status: CommandStatus, text?: string }) => {
    let content;
    switch(status) {
        case 'listening':
            content = <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Listening...</>;
            break;
        case 'transcribing':
            content = <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Transcribing...</>;
            break;
        case 'parsing':
            content = <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Understanding...</>;
            break;
        case 'understood':
            content = <>Command: "{text}"</>;
            break;
        case 'error':
            content = <>Could not understand command. Please try again.</>;
            break;
        default:
            content = <>Tap the button and speak your command.</>
    }
    return <div className="text-center text-muted-foreground min-h-[28px]">{content}</div>;
};

const CommandResult = ({ result }: { result: ParseCommandOutput }) => {
    let icon;
    let title = '';
    let details: { label: string; value: string | number | undefined }[] = [];

    switch(result.action) {
        case 'create_notes':
            icon = <FilePlus className="w-8 h-8 text-accent" />;
            title = "Action: Create Notes";
            details.push({ label: "Topic", value: result.topic });
            break;
        case 'create_quiz':
            icon = <ShieldQuestion className="w-8 h-8 text-accent" />;
            title = "Action: Create Quiz";
            details.push({ label: "Topic", value: result.topic });
            if (result.questionCount) {
                details.push({ label: "Count", value: result.questionCount });
            }
            break;
        case 'open_tool':
            icon = <Wand2 className="w-8 h-8 text-accent" />;
            title = "Action: Open Tool";
            details.push({ label: "Tool", value: result.toolName });
            break;
        default:
            icon = <Bot className="w-8 h-8 text-destructive" />;
            title = "Action: Unknown";
            details.push({ label: "Command", value: result.originalCommand });
            break;
    }

    return (
        <Card className="bg-secondary/50 w-full max-w-md animate-in fade-in duration-500">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
                {icon}
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                {details.map(d => (
                    <p key={d.label}><span className="font-semibold text-muted-foreground">{d.label}:</span> {d.value}</p>
                ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default function VoiceCommandsPage() {
  const { toast } = useToast();
  const [status, setStatus] = useState<CommandStatus>('idle');
  const [transcribedText, setTranscribedText] = useState('');
  const [commandResult, setCommandResult] = useState<ParseCommandOutput | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStatus('listening');
      setCommandResult(null);
      setTranscribedText('');
      audioChunksRef.current = [];
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await handleTranscription(audioBlob);
      };
      mediaRecorderRef.current.start();
    } catch (err) {
      toast({ title: 'Microphone Error', description: 'Could not access the microphone.', variant: 'destructive' });
      setStatus('idle');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === 'listening') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleTranscription = async (audioBlob: Blob) => {
    setStatus('transcribing');
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const result = await processVoiceNote({ audioDataUri: base64Audio });
        setTranscribedText(result.rawTranscript);
        await handleParsing(result.rawTranscript);
      };
    } catch (error) {
      toast({ title: 'Transcription Failed', description: 'Could not convert audio to text.', variant: 'destructive' });
      setStatus('error');
    }
  };

  const handleParsing = async (text: string) => {
    if(!text) {
        setStatus('error');
        return;
    }
    setStatus('parsing');
    try {
        const result = await parseVoiceCommand({ commandText: text });
        setCommandResult(result);
        setStatus('understood');
    } catch (error) {
        toast({ title: 'Command Parsing Failed', description: 'Could not understand the command.', variant: 'destructive' });
        setStatus('error');
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8 flex flex-col items-center justify-center">
        <header className="text-center">
          <h1 className="font-headline text-3xl md:text-4xl">Voice-Activated Commands</h1>
          <p className="text-muted-foreground mt-1">Control the app with your voice. Just tap and speak.</p>
        </header>
        
        <Card className="w-full max-w-lg bg-secondary/30">
            <CardContent className='flex flex-col items-center gap-6 p-10'>
                 <Button 
                    onClick={status === 'listening' ? stopRecording : startRecording} 
                    size="lg" 
                    className="w-32 h-32 rounded-full shadow-glow hover:shadow-glow-sm transition-all duration-300 data-[state=listening]:bg-red-600"
                    data-state={status === 'listening' ? 'listening' : 'idle'}
                 >
                    {status === 'listening' ? <Square size={48} /> : <Mic size={48} />}
                </Button>
                <StatusIndicator status={status} text={transcribedText} />
                {commandResult && <CommandResult result={commandResult} />}
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
