
'use client';

import { useParams } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import type { ProcessQrNoteOutput } from '@/ai/flows/ai-qr-note-processor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Download, XCircle } from 'lucide-react';
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

export default function NoteDownloadPage() {
  const params = useParams();
  const [note, setNote] = useState<NotePayload | null>(null);
  const [status, setStatus] = useState<'loading' | 'generating' | 'downloading' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const noteId = params.id as string;
    if (noteId) {
      try {
        const storedNote = getNoteFromLocalStorage(noteId);
        if (storedNote) {
          setNote(storedNote);
          setStatus('generating'); 
          document.title = `Downloading Note: ${storedNote.title}`;
        } else {
          setErrorMessage('Note not found. It may have been created on another device or has been cleared from local storage.');
          setStatus('error');
        }
      } catch (e) {
         setErrorMessage('Could not retrieve the note. Local storage might be disabled or corrupted.');
         setStatus('error');
      }
    }
  }, [params.id]);

  useEffect(() => {
    if (status === 'generating' && note && pdfRef.current) {
        const generateAndDownloadPdf = async () => {
            await new Promise(resolve => setTimeout(resolve, 50)); 
            
            try {
                const canvas = await html2canvas(pdfRef.current!, {
                    scale: 2, // Higher scale for better quality
                    useCORS: true, 
                    backgroundColor: '#ffffff'
                });
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
            } catch (pdfError) {
                console.error("PDF generation failed:", pdfError);
                setErrorMessage("Sorry, there was an error creating the PDF file.");
                setStatus('error');
            }
        };
        
        generateAndDownloadPdf();
    }
  }, [status, note]);

  return (
    <div className="min-h-screen bg-background text-foreground font-body p-4 flex items-center justify-center">
      {/* This div is rendered off-screen to generate the PDF from it */}
      {note && (
        <div className="absolute top-0 -left-[9999px] w-[600px]" >
          <div ref={pdfRef} className="p-8 bg-white text-black font-sans" style={{width: '600px', fontFamily: "Arial, sans-serif"}}>
             <div style={{display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px"}}>
                 <Icons.logo className="w-8 h-8" style={{color: "#8B5CF6"}}/>
                 <h1 style={{fontSize: "20px", fontWeight: "bold"}}>Synapse Study Note</h1>
            </div>
            <h2 style={{fontSize: "28px", fontWeight: "bold", color: "#6D28D9", marginBottom: "8px"}}>{note.title}</h2>
            <p style={{fontSize: "14px", color: "#6B7280", marginBottom: "24px"}}>AI-generated summary from your notes.</p>
            
            <hr style={{margin: "24px 0", borderColor: "#E5E7EB"}}/>

            <h3 style={{fontWeight: "bold", fontSize: "18px", marginBottom: "8px"}}>Summary</h3>
            <p style={{color: "#4B5563", marginBottom: "24px", lineHeight: '1.6'}}>{note.summary}</p>
            
            <hr style={{margin: "24px 0", borderColor: "#E5E7EB"}}/>

            <h3 style={{fontWeight: "bold", fontSize: "18px", marginBottom: "8px"}}>Key Takeaways</h3>
            <div style={{display: "flex", flexWrap: "wrap", gap: "8px"}}>
                {note.keyTakeaways.map(kw => (
                    <span key={kw} style={{backgroundColor: "#EDE9FE", color: "#5B21B6", fontSize: "14px", fontWeight: "500", padding: "4px 12px", borderRadius: "9999px"}}>{kw}</span>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* This is the visible status card for the user */}
      <Card className="max-w-md w-full text-center bg-secondary/50">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Synapse Smart Note</CardTitle>
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
              <p className="text-muted-foreground">Preparing your PDF, please wait...</p>
              <p className="text-xs text-muted-foreground">The download will start automatically.</p>
            </>
          )}
          {status === 'downloading' && (
            <>
              <Download className="w-12 h-12 mx-auto text-green-500" />
              <p className="font-semibold text-foreground">Your PDF is downloading!</p>
              <p className="text-muted-foreground text-sm">You can now close this window.</p>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="w-12 h-12 mx-auto text-destructive" />
              <p className="font-semibold text-destructive">Download Failed</p>
              <p className="text-muted-foreground text-sm">{errorMessage}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
