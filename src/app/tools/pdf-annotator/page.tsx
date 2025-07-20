
'use client';

import React, { useState, useCallback, useRef, ChangeEvent } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FilePenLine, Loader2, UploadCloud, ChevronLeft, ChevronRight, MessageSquare, User, Sparkles } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { useResizeDetector } from 'react-resize-detector';
import { Textarea } from '@/components/ui/textarea';
import { chatWithPdf, type ChatWithPdfInput, type ChatWithPdfOutput } from '@/ai/flows/ai-pdf-analyzer';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function PdfAnnotatorPage() {
  const { toast } = useToast();
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { width, ref: resizeRef } = useResizeDetector();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(1);
    setMessages([]);
  };
  
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPdfData(reader.result as string);
        toast({ title: 'PDF Loaded', description: 'You can now view and chat with your document.' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input || !pdfData) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const result = await chatWithPdf({ query: input, pdfDataUri: pdfData });
        const assistantMessage: Message = { role: 'assistant', content: result.answer };
        setMessages(prev => [...prev, assistantMessage]);
    } catch(error) {
        console.error(error);
        toast({ title: 'Error', description: 'Failed to get a response from the AI.', variant: 'destructive'});
    } finally {
        setIsLoading(false);
    }
  };
  
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, numPages));

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex items-center gap-4">
          <FilePenLine className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">Smart PDF Annotator</h1>
            <p className="text-muted-foreground mt-1">Chat with your documents, get summaries, and ask questions.</p>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <Card className="bg-secondary/30">
            <CardHeader>
              <CardTitle>PDF Viewer</CardTitle>
            </CardHeader>
            <CardContent ref={resizeRef}>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" className="hidden" />
              {!pdfData ? (
                <div 
                    className="border-2 border-dashed border-muted-foreground/50 hover:border-accent transition-colors duration-300 cursor-pointer h-96 flex flex-col items-center justify-center text-center"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <UploadCloud className="w-12 h-12 text-accent mb-4" />
                    <p className="font-semibold text-foreground">Click to upload a PDF</p>
                    <p className="text-xs text-muted-foreground">Your document stays local</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border rounded-md overflow-hidden min-h-[500px] flex items-center justify-center">
                    {width ? (
                       <Document 
                            file={pdfData} 
                            onLoadSuccess={onDocumentLoadSuccess} 
                            loading={<div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>}
                        >
                            <Page pageNumber={currentPage} width={width} loading=""/>
                        </Document>
                    ) : null}
                  </div>
                  {numPages > 1 && (
                     <div className="flex justify-between items-center">
                        <Button onClick={goToPrevPage} disabled={currentPage <= 1} variant="outline"><ChevronLeft /> Prev</Button>
                        <p className="text-sm text-muted-foreground">Page {currentPage} of {numPages}</p>
                        <Button onClick={goToNextPage} disabled={currentPage >= numPages} variant="outline">Next <ChevronRight /></Button>
                    </div>
                  )}
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full">Change PDF</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-secondary/30 sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageSquare className="text-accent"/> Chat with your PDF</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-[70vh]">
                <ScrollArea className="flex-1 pr-4 -mr-4 mb-4">
                    <div className="space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-muted-foreground pt-16">
                                <MessageSquare className="mx-auto h-12 w-12 mb-4" />
                                <p className='text-lg font-semibold'>Ready to analyze.</p>
                                <p>Ask a question about the document to begin.</p>
                            </div>
                        )}
                        {messages.map((message, index) => (
                          <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                             {message.role === 'assistant' && (
                                <Avatar className="border border-accent/50 w-8 h-8">
                                    <AvatarFallback><Sparkles className="text-accent w-4 h-4" /></AvatarFallback>
                                </Avatar>
                            )}
                             <div className={`rounded-lg p-3 text-sm max-w-xl ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                                <p className="whitespace-pre-wrap">{message.content}</p>
                            </div>
                            {message.role === 'user' && (
                                <Avatar className='w-8 h-8'>
                                    <AvatarFallback><User className='w-4 h-4'/></AvatarFallback>
                                </Avatar>
                            )}
                          </div>
                        ))}
                         {isLoading && (
                            <div className="flex items-start gap-3">
                                 <Avatar className="border border-accent/50 w-8 h-8">
                                    <AvatarFallback><Sparkles className="text-accent w-4 h-4" /></AvatarFallback>
                                </Avatar>
                                <div className="rounded-lg p-3 max-w-xl bg-background">
                                   <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <form onSubmit={handleSendMessage} className="relative mt-auto">
                    <Textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={!pdfData ? "Upload a PDF first..." : "Ask a question..."}
                        className="pr-20"
                        disabled={!pdfData || isLoading}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                    />
                    <Button type="submit" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2" disabled={!pdfData || isLoading || !input}>
                        {isLoading ? <Loader2 className="animate-spin" /> : "Ask"}
                    </Button>
                </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </AppLayout>
  );
}
