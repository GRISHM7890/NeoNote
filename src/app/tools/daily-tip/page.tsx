
'use client';

import AppLayout from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

export default function DailyTipPage() {
  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex items-center gap-4">
          <Star className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">Daily Smart Tip</h1>
            <p className="text-muted-foreground mt-1">Get a new study or memory tip every day.</p>
          </div>
        </header>

        <Card className="bg-secondary/30">
          <CardContent className="p-10 text-center">
            <h2 className="text-xl font-semibold">Feature Under Construction</h2>
            <p className="text-muted-foreground">Check back soon for daily study tips!</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
