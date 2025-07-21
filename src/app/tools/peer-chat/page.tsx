
'use client';

import AppLayout from '@/components/app-layout';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

export default function PlaceholderPage() {
  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8">
        <header className="flex items-center gap-4 mb-8">
            <MessageCircle className="w-10 h-10 text-accent" />
            <div>
              <h1 className="font-headline text-3xl md:text-4xl">Academic Peer Chatroom</h1>
              <p className="text-muted-foreground mt-1">This feature is coming soon!</p>
            </div>
        </header>
        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle>Under Construction</CardTitle>
            <CardDescription>
              This tool will allow you to join secure, moderated chatrooms to discuss specific subjects or topics with fellow learners.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </AppLayout>
  );
}
