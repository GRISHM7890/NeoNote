
'use client';

import React, { useState, useRef } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { View, Loader2, Sparkles, Wand2, Printer, Columns, Scissors, FlipVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { generateFlashcards, type GenerateFlashcardsOutput } from '@/ai/flows/ai-flashcard-generator';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

type CardStyle = 'both' | 'front_only' | 'back_only';

const FlashcardPrintPreview = ({ card, style, showGuides }: { card: GenerateFlashcardsOutput['flashcards'][0], style: CardStyle, showGuides: boolean }) => (
  <div className={cn(
    "aspect-[3/2] w-full border-muted-foreground flex flex-col items-center justify-center p-2 text-center text-sm break-words",
    showGuides && "border-dashed border"
  )}>
    {style === 'both' && (
      <>
        <div className="flex-1 w-full border-b-2 border-dashed flex items-center justify-center">
            <p className="font-bold">{card.term}</p>
        </div>
        <div className="flex-1 w-full flex items-center justify-center">
            <p className="text-muted-foreground">{card.definition}</p>
        </div>
      </>
    )}
     {style === 'front_only' && <p className="font-bold">{card.term}</p>}
     {style === 'back_only' && <p className="text-muted-foreground">{card.definition}</p>}
  </div>
);


export default function PrintableGridViewPage() {
    const { toast } = useToast();
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [flashcards, setFlashcards] = useState<GenerateFlashcardsOutput['flashcards'] | null>(null);
    
    // Customization state
    const [columns, setColumns] = useState('3');
    const [showGuides, setShowGuides] = useState(true);
    const [cardStyle, setCardStyle] = useState<CardStyle>('both');

    const printableRef = useRef<HTMLDivElement>(null);

    const handleGenerate = async () => {
        if (!notes) {
            toast({ title: "Notes are empty!", description: "Please paste notes to generate flashcards.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        setFlashcards(null);

        try {
            const result = await generateFlashcards({ notes, topic: 'Printable Flashcards' });
            setFlashcards(result.flashcards);
            toast({ title: 'Flashcards Generated!', description: 'Your flashcards are ready to be printed.' });
        } catch (error) {
            console.error(error);
            toast({ title: 'Generation Failed', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <AppLayout>
            <div className="flex-1 p-4 md:p-8 space-y-8" id="printable-view-page">
                <header className="flex items-center gap-4">
                    <View className="w-10 h-10 text-accent" />
                    <div>
                        <h1 className="font-headline text-3xl md:text-4xl">Printable Flashcard View</h1>
                        <p className="text-muted-foreground mt-1">Generate and print flashcards in a customizable grid layout.</p>
                    </div>
                </header>

                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1 space-y-8">
                        <Card className="bg-secondary/30">
                            <CardHeader>
                                <CardTitle>1. Generate Cards</CardTitle>
                                <CardDescription>Paste notes to create flashcards.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={8} placeholder="Paste your study notes here..." />
                                <Button onClick={handleGenerate} disabled={isLoading || !notes} className="w-full">
                                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                                    Generate Flashcards
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="bg-secondary/30">
                            <CardHeader>
                                <CardTitle>2. Customize & Print</CardTitle>
                                <CardDescription>Adjust the layout for printing.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2"><Columns/> Columns</Label>
                                    <Select value={columns} onValueChange={setColumns}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="2">2 Columns</SelectItem>
                                            <SelectItem value="3">3 Columns</SelectItem>
                                            <SelectItem value="4">4 Columns</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                 <div className="space-y-2">
                                    <Label className="flex items-center gap-2"><FlipVertical/> Card Style</Label>
                                    <Select value={cardStyle} onValueChange={(v) => setCardStyle(v as CardStyle)}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="both">Front & Back</SelectItem>
                                            <SelectItem value="front_only">Front Only</SelectItem>
                                            <SelectItem value="back_only">Back Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                     <p className="text-xs text-muted-foreground">"Front Only" and "Back Only" are for double-sided printing.</p>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <Label htmlFor="cutting-guides" className="flex items-center gap-2"><Scissors/> Cutting Guides</Label>
                                    <Switch id="cutting-guides" checked={showGuides} onCheckedChange={setShowGuides} />
                                </div>
                                <Button onClick={handlePrint} disabled={!flashcards} className="w-full text-lg py-6 shadow-glow hover:shadow-glow-sm">
                                    <Printer className="mr-2" /> Print
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <Card className="printable-area-container">
                             <CardHeader>
                                <CardTitle>Live Preview</CardTitle>
                                <CardDescription>This is how your sheet will look when printed.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {flashcards && flashcards.length > 0 ? (
                                    <div ref={printableRef} className="printable-area bg-white p-4 text-black">
                                        <div 
                                          className="grid gap-0"
                                          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
                                        >
                                            {flashcards.map((card, i) => (
                                                <FlashcardPrintPreview key={i} card={card} style={cardStyle} showGuides={showGuides} />
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-96 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                                        <p>Generate flashcards to see a preview here.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
