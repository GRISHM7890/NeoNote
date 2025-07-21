
'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Loader2, Sparkles, Wand2, Download, Link as LinkIcon, Book } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { processQrNote, type ProcessQrNoteInput, type ProcessQrNoteOutput } from '@/ai/flows/ai-qr-note-processor';
import { Textarea } from '@/components/ui/textarea';
import QRCode from 'qrcode';
import { saveLibraryItem } from '@/lib/library';
import { Badge } from '@/components/ui/badge';

type NoteData = {
    id: string;
    payload: ProcessQrNoteOutput;
};

const saveNoteToLocalStorage = (data: NoteData) => {
    if (typeof window === 'undefined') return;
    const notes = JSON.parse(localStorage.getItem('qr-notes') || '{}');
    notes[data.id] = data.payload;
    localStorage.setItem('qr-notes', JSON.stringify(notes));
};

export default function QrGeneratorPage() {
  const { toast } = useToast();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ note: ProcessQrNoteOutput, qrCodeUrl: string, noteUrl: string } | null>(null);

  const handleGenerate = async () => {
    if (!inputText) {
      toast({ title: "Input text is empty", description: "Please provide some notes to generate a QR code.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);

    try {
      const aiResult = await processQrNote({ text: inputText });
      const noteId = new Date().getTime().toString();
      const noteUrl = `${window.location.origin}/note/${noteId}`;
      
      const qrCodeDataUrl = await QRCode.toDataURL(noteUrl, { width: 300, margin: 2 });
      
      const noteData: NoteData = { id: noteId, payload: aiResult };
      saveNoteToLocalStorage(noteData);

      setResult({ note: aiResult, qrCodeUrl: qrCodeDataUrl, noteUrl });
      
      saveLibraryItem({
        type: 'QR Code Note',
        title: `QR Note: ${aiResult.title}`,
        payload: { input: inputText, result: aiResult, noteUrl },
      });
      
      toast({ title: 'QR Code Generated!', description: 'Your smart note and QR code are ready and saved to your library.' });
    } catch (error) {
      console.error(error);
      toast({ title: "Generation Failed", description: "The AI couldn't process your notes. Please try again.", variant: 'destructive'});
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.qrCodeUrl;
    link.download = `qr-note-${result.note.title.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleCopyLink = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.noteUrl);
    toast({title: "Link Copied!", description: "The link to your note has been copied."})
  }

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex items-center gap-4">
          <QrCode className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">AI QR Code Generator for Notes</h1>
            <p className="text-muted-foreground mt-1">Generate smart QR codes that link physical notes to AI-powered digital summaries.</p>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <Card className="bg-secondary/30">
            <CardHeader>
              <CardTitle>1. Paste Your Notes</CardTitle>
              <CardDescription>Provide the text you want the QR code to link to. The AI will summarize it.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste the notes or content here... The AI will create a smart summary and link it to the QR code."
                rows={12}
              />
              <Button onClick={handleGenerate} disabled={isLoading || !inputText} className="w-full text-lg py-6 shadow-glow hover:shadow-glow-sm transition-shadow">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                Generate Smart QR Code
              </Button>
            </CardContent>
          </Card>

          {(isLoading || result) && (
            <Card className='animate-in fade-in duration-500 sticky top-8'>
                <CardHeader>
                    <CardTitle className='font-headline text-2xl'>2. Your Generated QR Note</CardTitle>
                     <CardDescription>Download the QR code to use in your physical notes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoading && (
                        <div className="flex items-center justify-center p-8 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mr-4" />
                            <p>Analyzing notes and generating QR code...</p>
                        </div>
                    )}
                    {result && (
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            <div className="flex-shrink-0 text-center space-y-2">
                                <img src={result.qrCodeUrl} alt="Generated QR Code" className="w-40 h-40 rounded-lg border p-1 bg-white mx-auto"/>
                                <Button onClick={handleDownload} size="sm" variant="outline"><Download className="mr-2"/> Download</Button>
                                <Button onClick={handleCopyLink} size="sm" variant="ghost"><LinkIcon className="mr-2"/> Copy Link</Button>
                            </div>
                            <div className="border-l-0 md:border-l pl-0 md:pl-6 w-full">
                                <h3 className="font-bold text-lg text-primary">{result.note.title}</h3>
                                <p className="text-sm text-muted-foreground mt-2">{result.note.summary}</p>
                                <div className="mt-4 space-y-2">
                                    <h4 className="font-semibold text-sm">Key Takeaways:</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {result.note.keyTakeaways.map(kw => <Badge key={kw}>{kw}</Badge>)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
