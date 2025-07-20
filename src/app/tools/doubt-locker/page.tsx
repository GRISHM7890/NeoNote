
'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { solveDoubt, type SolveDoubtInput, type SolveDoubtOutput } from '@/ai/flows/ai-doubt-solver';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Loader2, Send, ImagePlus, User, Sparkles, BrainCircuit } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  imagePreview?: string;
  relatedConcepts?: string[];
};

export default function DoubtLockerPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [imageData, setImageData] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input && !imageData) return;

    const userMessage: Message = { role: 'user', content: input, imagePreview: imagePreview || undefined };
    setMessages(prev => [...prev, userMessage]);
    
    setIsLoading(true);

    const doubtInput: SolveDoubtInput = {
      query: input,
      ...(imageData && { photoDataUri: imageData }),
    };
    
    setInput('');
    setImageData(null);
    setImagePreview(null);

    try {
      const result = await solveDoubt(doubtInput);
      const assistantMessage: Message = {
        role: 'assistant',
        content: result.explanation,
        relatedConcepts: result.relatedConcepts
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Doubt solving failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to get an answer from the AI. Please try again.',
        variant: 'destructive',
      });
      setMessages(prev => prev.slice(0, -1)); // Remove the user message if AI fails
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-1rem)] p-4 md:p-8">
        <header className="mb-4 flex items-center gap-4">
          <Lightbulb className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">Doubt Locker</h1>
            <p className="text-muted-foreground mt-1">Ask any doubt. Get instant, step-by-step AI answers.</p>
          </div>
        </header>

        <Card className="flex-1 flex flex-col bg-secondary/30">
          <CardContent className="flex-1 p-4 overflow-y-auto space-y-6">
            {messages.length === 0 && (
                 <div className="text-center text-muted-foreground py-20">
                    <Lightbulb className="mx-auto h-12 w-12 mb-4" />
                    <p className='text-lg font-semibold'>Your personal AI Tutor is ready.</p>
                    <p>Ask a question about any subject to get started.</p>
                </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'assistant' && (
                  <Avatar className="border border-accent/50">
                    <AvatarFallback><Sparkles className="text-accent" /></AvatarFallback>
                  </Avatar>
                )}
                <div className={`rounded-lg p-4 max-w-2xl ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                  {message.imagePreview && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border mb-2">
                      <Image src={message.imagePreview} alt="User upload" layout="fill" objectFit="contain" />
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.relatedConcepts && (
                    <div className='mt-4'>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-accent"/>Related Concepts</h4>
                        <div className="flex flex-wrap gap-2">
                        {message.relatedConcepts.map(concept => (
                            <Badge key={concept} variant="secondary">{concept}</Badge>
                        ))}
                        </div>
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <Avatar>
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isLoading && (
                <div className="flex items-start gap-4">
                     <Avatar className="border border-accent/50">
                        <AvatarFallback><Sparkles className="text-accent" /></AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-4 max-w-2xl bg-background">
                       <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                </div>
            )}
          </CardContent>

          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question here..."
                rows={2}
                className="pr-24"
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                    }
                }}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                 <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                    <ImagePlus className={cn(imagePreview && "text-accent")} />
                 </Button>
                 <Button type="submit" variant="ghost" size="icon" disabled={isLoading}>
                    <Send />
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
