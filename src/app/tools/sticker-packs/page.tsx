
'use client';

import AppLayout from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smile } from 'lucide-react';

export default function StickerPacksPage() {
  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex items-center gap-4">
          <Smile className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">Sticker Packs for Notes</h1>
            <p className="text-muted-foreground mt-1">Decorate your notes with fun subject-based stickers.</p>
          </div>
        </header>

        <Card className="bg-secondary/30">
          <CardContent className="p-10 text-center">
            <h2 className="text-xl font-semibold">Feature Under Construction</h2>
            <p className="text-muted-foreground">This feature to add stickers to your notes is coming soon!</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
