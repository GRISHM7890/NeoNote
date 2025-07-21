
'use client';

import AppLayout from '@/components/app-layout';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music } from 'lucide-react';

export default function PlaceholderPage() {
  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8">
        <header className="flex items-center gap-4 mb-8">
            <Music className="w-10 h-10 text-accent" />
            <div>
              <h1 className="font-headline text-3xl md:text-4xl">Study Mood Music</h1>
              <p className="text-muted-foreground mt-1">This feature is coming soon!</p>
            </div>
        </header>
        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle>Under Construction</CardTitle>
            <CardDescription>
              This tool will provide a curated playlist of focus-enhancing, brainwave-tuned music, which can sync with the Pomodoro mode or active learning sessions.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </AppLayout>
  );
}
