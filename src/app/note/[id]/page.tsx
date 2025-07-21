
'use client';

import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import type { ProcessQrNoteOutput } from '@/ai/flows/ai-qr-note-processor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Book, BrainCircuit, Key } from 'lucide-react';
import { Icons } from '@/components/icons';

type NotePayload = ProcessQrNoteOutput;

const getNoteFromLocalStorage = (id: string): NotePayload | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const notes = JSON.parse(localStorage.getItem('qr-notes') || '{}');
  return notes[id] || null;
};

export default function NotePage() {
  const params = useParams();
  const [note, setNote] = useState<NotePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const noteId = params.id as string;
    if (noteId) {
      const storedNote = getNoteFromLocalStorage(noteId);
      if (storedNote) {
        setNote(storedNote);
      } else {
        setError('Note not found. Make sure you are using the same device and browser where the QR code was generated.');
      }
    }
  }, [params.id]);
  
  if (error) {
     return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="max-w-lg w-full text-center bg-secondary/50">
                <CardHeader>
                    <CardTitle className="text-2xl text-destructive">Note Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{error}</p>
                </CardContent>
            </Card>
        </div>
    );
  }


  if (!note) {
    return <div className="flex items-center justify-center min-h-screen bg-background">Loading note...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
        <header className="p-4 border-b bg-secondary/30">
            <div className="container mx-auto flex items-center gap-3">
                 <Icons.logo className="w-8 h-8 text-accent" />
                 <h1 className="text-xl font-headline">Shreeya's AI Note</h1>
            </div>
        </header>
        <main className="container mx-auto p-4 md:p-8 max-w-4xl">
            <Card className="bg-secondary/30">
                <CardHeader>
                    <CardTitle className="text-3xl md:text-4xl font-headline text-primary">{note.title}</CardTitle>
                    <CardDescription>This is an AI-generated summary from your notes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h2 className="font-semibold text-xl mb-3 flex items-center gap-2"><BrainCircuit className="text-accent" /> Summary</h2>
                        <p className="text-muted-foreground prose prose-sm max-w-none">{note.summary}</p>
                    </div>
                    <Separator/>
                    <div>
                        <h2 className="font-semibold text-xl mb-3 flex items-center gap-2"><Key className="text-accent" /> Key Takeaways</h2>
                        <div className="flex flex-wrap gap-2">
                           {note.keyTakeaways.map(kw => <Badge key={kw} variant="secondary" className="text-base px-3 py-1">{kw}</Badge>)}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
