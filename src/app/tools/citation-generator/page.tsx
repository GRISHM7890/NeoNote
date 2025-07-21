
'use client';

import AppLayout from '@/components/app-layout';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FilePenLine } from 'lucide-react';

export default function PlaceholderPage() {
  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8">
        <header className="flex items-center gap-4 mb-8">
            <FilePenLine className="w-10 h-10 text-accent" />
            <div>
              <h1 className="font-headline text-3xl md:text-4xl">AI Citation Generator</h1>
              <p className="text-muted-foreground mt-1">This feature is coming soon!</p>
            </div>
        </header>
        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle>Under Construction</CardTitle>
            <CardDescription>
              This tool will auto-generate proper MLA, APA, or Harvard citations from any paragraph or pasted content, and cross-check its authenticity with trusted sources.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </AppLayout>
  );
}
