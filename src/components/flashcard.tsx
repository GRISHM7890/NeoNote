'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type FlashcardProps = {
  term: string;
  definition: string;
};

export function Flashcard({ term, definition }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flip-card h-48 w-full cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
      <Card className={cn('flip-card-inner rounded-lg transition-transform duration-500 group-hover:scale-105', { 'flipped': isFlipped })}>
        <div className="flip-card-front rounded-lg bg-primary/20 border-primary/30">
          <h3 className="font-headline text-xl text-foreground">{term}</h3>
        </div>
        <div className="flip-card-back rounded-lg bg-secondary/80 border-secondary/60">
          <p className="text-muted-foreground">{definition}</p>
        </div>
      </Card>
    </div>
  );
}
