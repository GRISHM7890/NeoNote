
'use client';

import { useParams } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import type { ProcessQrNoteOutput } from '@/ai/flows/ai-qr-note-processor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BrainCircuit, Key, Download, Loader2 } from 'lucide-react';
import { Icons } from '@/components/icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const [status, setStatus] = useState<'loading' | 'generating' | 'downloading' | 'error'>('loading');
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const noteId = params.id as string;
    if (noteId) {
      const storedNote = getNoteFromLocalStorage(noteId);
      if (storedNote) {
        setNote(storedNote);
        setStatus('generating');
        document.title = `Downloading Note: ${storedNote.title}`;
      } else {
        setError('Note not found. It may have been created on a different device or browser.');
        setStatus('error');
      }
    }
  }, [params.id]);

  useEffect(() => {
    if (status === 'generating' && note && pdfRef.current) {
        const generatePdf = async () => {
            await new Promise(resolve => setTimeout(resolve, 50)); // Small delay for render
            const canvas = await html2canvas(pdfRef.current!, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            const fileName = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
            pdf.save(fileName);
            setStatus('downloading');
        };
        generatePdf();
    }
  }, [status, note]);

  return (
    <div className="min-h-screen bg-background text-foreground font-body p-4 flex items-center justify-center">
      {/* Hidden div for PDF generation */}
      {note && (
        <div className="absolute top-0 left-0 -z-50" style={{ left: '-9999px' }}>
          <div ref={pdfRef} className="p-8 bg-white text-black" style={{width: '600px'}}>
             <div className="flex items-center gap-3 mb-4">
                 <Icons.logo className="w-8 h-8 text-purple-600" />
                 <h1 className="text-xl font-bold">Synapse Study Note</h1>
            </div>
            <h2 className="text-3xl font-bold text-purple-700 mb-2">{note.title}</h2>
            <p className="text-sm text-gray-500 mb-6">AI-generated summary from your notes.</p>
            
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">Summary</h3>
            <p className="text-gray-700 mb-6">{note.summary}</p>
            
            <hr className="my-6" />

            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">Key Takeaways</h3>
            <div className="flex flex-wrap gap-2">
                {note.keyTakeaways.map(kw => (
                    <span key={kw} className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">{kw}</span>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Visible status card */}
      <Card className="max-w-md w-full text-center bg-secondary/50">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Synapse Study Note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <>
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-accent" />
              <p className="text-muted-foreground">Loading your note...</p>
            </>
          )}
          {status === 'generating' && (
            <>
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-accent" />
              <p className="text-muted-foreground">Generating your PDF, please wait...</p>
            </>
          )}
          {status === 'downloading' && (
            <>
              <Download className="w-12 h-12 mx-auto text-green-500" />
              <p className="font-semibold text-foreground">Your PDF is downloading!</p>
              <p className="text-muted-foreground text-sm">If the download doesn't start, please check your browser settings.</p>
            </>
          )}
          {status === 'error' && (
            <>
              <CardTitle className="text-2xl text-destructive font-headline">Note Not Found</CardTitle>
              <p className="text-muted-foreground">{error}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
