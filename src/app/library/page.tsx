
'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Library, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Define a union type for all possible library item payloads
type LibraryItemPayload = any; // Using 'any' for simplicity, can be tightened later

export type LibraryItem = {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  payload: LibraryItemPayload;
};

const getLibraryItems = (): LibraryItem[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  const items = localStorage.getItem('synapse-library');
  return items ? JSON.parse(items) : [];
};

const saveLibraryItems = (items: LibraryItem[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('synapse-library', JSON.stringify(items));
};


const LibraryItemDisplay = ({ item }: { item: LibraryItem }) => {
    return (
        <Card className="bg-secondary/30">
            <CardHeader>
                <CardTitle className='text-xl font-headline'>{item.title}</CardTitle>
                <CardDescription>
                    {item.type} &middot; {format(new Date(item.timestamp), 'd MMM, yyyy p')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                        <AccordionTrigger>View Content</AccordionTrigger>
                        <AccordionContent>
                           <pre className="whitespace-pre-wrap text-sm bg-background/50 p-4 rounded-md">
                             {JSON.stringify(item.payload, null, 2)}
                           </pre>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    )
}


export default function LibraryPage() {
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);

  useEffect(() => {
    setLibraryItems(getLibraryItems());
  }, []);

  const clearLibrary = () => {
    saveLibraryItems([]);
    setLibraryItems([]);
  };


  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Library className="w-10 h-10 text-accent" />
            <div>
              <h1 className="font-headline text-3xl md:text-4xl">My Library</h1>
              <p className="text-muted-foreground mt-1">All your saved AI-generated content in one place.</p>
            </div>
          </div>
           {libraryItems.length > 0 && (
             <Button variant="destructive" onClick={clearLibrary}>
                <Trash2 className="mr-2"/> Clear Library
             </Button>
            )}
        </header>

        <main>
          {libraryItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {libraryItems.map(item => <LibraryItemDisplay key={item.id} item={item} />)}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-20 border-2 border-dashed rounded-lg">
              <Library className="mx-auto h-16 w-16 mb-4" />
              <h2 className='text-xl font-semibold text-foreground'>Your Library is Empty</h2>
              <p>Content you generate using the AI tools will be automatically saved here.</p>
            </div>
          )}
        </main>
      </div>
    </AppLayout>
  );
}
