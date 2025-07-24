
'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Puzzle, Loader2, Sparkles, Wand2, Lightbulb, Check, X, Timer, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { generateFlashcards, type GenerateFlashcardsOutput } from '@/ai/flows/ai-flashcard-generator';
import { DndContext, useDraggable, useDroppable, type DragEndEvent } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { saveLibraryItem } from '@/lib/library';

type GameState = 'setup' | 'generating' | 'playing' | 'results';
type FlashcardItem = { id: number; term: string; definition: string };

const shuffleArray = <T,>(array: T[]): T[] => {
    return array.sort(() => Math.random() - 0.5);
};

// Draggable Tile Component
const DraggableTile = ({ id, content, isMatched }: { id: string, content: string, isMatched: boolean }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id, disabled: isMatched });
    const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <div className={cn(
                "p-3 rounded-lg border bg-secondary text-left cursor-grab active:cursor-grabbing",
                isMatched && "opacity-50 cursor-not-allowed",
            )}>
                {content}
            </div>
        </div>
    );
};

// Droppable Target Component
const DroppableTarget = ({ id, content, children, isMatched }: { id: string, content: string, children: React.ReactNode, isMatched: boolean }) => {
    const { isOver, setNodeRef } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className="flex items-center gap-2">
            <Card className={cn("p-3 w-1/2 min-h-[50px] flex items-center justify-center text-center", isMatched && "border-green-500 bg-green-500/10")}>
                <p>{content}</p>
            </Card>
            <div className={cn(
                "w-1/2 min-h-[50px] border-2 border-dashed rounded-lg transition-colors flex items-center justify-center",
                isOver && "bg-primary/20 border-primary",
                isMatched && "bg-green-500/10 border-green-500"
            )}>
                {children}
            </div>
        </div>
    );
};

export default function PuzzleGamePage() {
    const { toast } = useToast();
    const [gameState, setGameState] = useState<GameState>('setup');
    const [isLoading, setIsLoading] = useState(false);
    const [notes, setNotes] = useState('');
    
    // Game state
    const [terms, setTerms] = useState<FlashcardItem[]>([]);
    const [definitions, setDefinitions] = useState<FlashcardItem[]>([]);
    const [matchedPairs, setMatchedPairs] = useState<Record<number, number>>({});
    const [score, setScore] = useState(0);
    const [time, setTime] = useState(0);

     useEffect(() => {
        let timer: NodeJS.Timeout;
        if (gameState === 'playing') {
            timer = setInterval(() => {
                setTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [gameState]);

    const handleGeneratePuzzle = async () => {
        if (!notes) {
            toast({ title: "Notes are empty!", description: "Please provide some notes to generate a puzzle.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        setGameState('generating');
        try {
            const result = await generateFlashcards({ notes, topic: 'Puzzle Game' });
            if (result.flashcards.length < 3) {
                toast({ title: "Not enough content", description: "AI could not generate enough flashcards for a puzzle. Try with more detailed notes.", variant: "destructive" });
                setIsLoading(false);
                setGameState('setup');
                return;
            }
            const flashcards = result.flashcards.map((fc, i) => ({ ...fc, id: i }));
            setTerms(shuffleArray([...flashcards]));
            setDefinitions(shuffleArray([...flashcards]));
            setMatchedPairs({});
            setScore(0);
            setTime(0);
            setGameState('playing');
            saveLibraryItem({
                type: 'Flashcard Set',
                title: `Puzzle game cards for "${notes.substring(0, 20)}..."`,
                payload: result,
            });
            toast({ title: "Puzzle Generated!", description: "The flashcards for this puzzle have been saved to your library."});
        } catch (error) {
            console.error(error);
            toast({ title: "Generation failed", variant: "destructive" });
            setGameState('setup');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDragEnd = (event: DragEndEvent) => {
        const { over, active } = event;
        if (over) {
            const termId = Number(over.id.replace('term-', ''));
            const defId = Number(active.id.replace('def-', ''));

            if (termId === defId) { // Correct match
                setMatchedPairs(prev => ({ ...prev, [termId]: defId }));
                setScore(prev => prev + 10);
                toast({ title: "Correct!", description: "You found a match!", className: "bg-green-500/20 border-green-500" });
            } else { // Incorrect match
                setScore(prev => prev - 2);
                toast({ title: "Not quite!", description: "That's not the right definition.", variant: "destructive" });
            }
        }
    };

    useEffect(() => {
        if (terms.length > 0 && Object.keys(matchedPairs).length === terms.length) {
            setGameState('results');
        }
    }, [matchedPairs, terms]);
    
    const resetGame = () => {
        setGameState('setup');
        setNotes('');
        setTerms([]);
        setDefinitions([]);
    }

    return (
        <AppLayout>
            <div className="flex-1 p-4 md:p-8 space-y-8">
                <header className="flex items-center gap-4">
                    <Puzzle className="w-10 h-10 text-accent" />
                    <div>
                        <h1 className="font-headline text-3xl md:text-4xl">Flashcard Puzzle Game</h1>
                        <p className="text-muted-foreground mt-1">Turn your flashcards into a fun matching game.</p>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {gameState === 'setup' && (
                        <motion.div key="setup" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                            <Card className="bg-secondary/30">
                                <CardHeader>
                                    <CardTitle>Generate a New Puzzle</CardTitle>
                                    <CardDescription>Paste your notes and the AI will create a matching puzzle for you.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={10} placeholder="Paste your study notes here..." />
                                    <Button onClick={handleGeneratePuzzle} disabled={isLoading} className="w-full text-lg py-6 shadow-glow hover:shadow-glow-sm">
                                        <Wand2 className="mr-2" /> Create Puzzle
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {(gameState === 'generating' || gameState === 'playing') && (
                        <motion.div key="playing" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                             <Card className="bg-secondary/30">
                                <CardHeader>
                                     <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle>Match the Pairs!</CardTitle>
                                            <CardDescription>Drag the definitions to the correct terms.</CardDescription>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="text-center">
                                                <p className="font-bold text-2xl text-primary">{score}</p>
                                                <p className="text-xs text-muted-foreground">SCORE</p>
                                            </div>
                                             <div className="text-center">
                                                <p className="font-bold text-2xl">{new Date(time * 1000).toISOString().substr(14, 5)}</p>
                                                <p className="text-xs text-muted-foreground">TIME</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <div className="flex flex-col items-center justify-center p-10 text-muted-foreground">
                                            <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                            <p>AI is building your puzzle...</p>
                                        </div>
                                    ) : (
                                        <DndContext onDragEnd={handleDragEnd}>
                                            <div className="grid md:grid-cols-2 gap-8">
                                                <div className="space-y-2">
                                                    <h3 className="font-semibold text-center mb-2">TERMS</h3>
                                                    {terms.map(term => (
                                                        <DroppableTarget key={term.id} id={`term-${term.id}`} content={term.term} isMatched={matchedPairs[term.id] !== undefined}>
                                                            {matchedPairs[term.id] !== undefined && (
                                                                <DraggableTile id={`def-${matchedPairs[term.id]}`} content={definitions.find(d => d.id === matchedPairs[term.id])!.definition} isMatched={true} />
                                                            )}
                                                        </DroppableTarget>
                                                    ))}
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="font-semibold text-center mb-2">DEFINITIONS</h3>
                                                    {definitions
                                                        .filter(def => matchedPairs[def.id] === undefined)
                                                        .map(def => (
                                                            <DraggableTile key={def.id} id={`def-${def.id}`} content={def.definition} isMatched={false} />
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        </DndContext>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                    
                    {gameState === 'results' && (
                        <motion.div key="results" initial={{opacity: 0, scale: 0.8}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.8}}>
                            <Card className="bg-secondary/30 text-center">
                                <CardHeader>
                                    <Trophy className="w-16 h-16 mx-auto text-yellow-400"/>
                                    <CardTitle className="text-4xl">Puzzle Complete!</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <p className="text-xl text-muted-foreground">Great job! Here are your results:</p>
                                     <div className="flex justify-center gap-8">
                                        <div className="p-4 bg-background rounded-lg">
                                            <p className="text-3xl font-bold text-primary">{score}</p>
                                            <p className="text-sm text-muted-foreground">Final Score</p>
                                        </div>
                                        <div className="p-4 bg-background rounded-lg">
                                            <p className="text-3xl font-bold">{new Date(time * 1000).toISOString().substr(14, 5)}</p>
                                            <p className="text-sm text-muted-foreground">Total Time</p>
                                        </div>
                                    </div>
                                    <Button onClick={resetGame} size="lg" className="shadow-glow hover:shadow-glow-sm">Play Another Puzzle</Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AppLayout>
    );
}
