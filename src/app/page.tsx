import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="flex flex-1 flex-col p-4 md:p-8">
        <header className="mb-8">
          <h1 className="font-headline text-3xl md:text-4xl text-foreground">Welcome to Shreeya's AI</h1>
          <p className="text-muted-foreground mt-2">Your AI-powered study partner. Let's get started.</p>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center">
          <Card className="w-full max-w-lg bg-card/50 border-primary/20 text-center">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Create your first Smart Note</CardTitle>
              <CardDescription className="max-w-md mx-auto">
                Transform textbook pages into interactive notes, flashcards, and quizzes with a single click.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/new" passHref>
                <Button size="lg" className="shadow-glow hover:shadow-glow-sm transition-shadow">
                  <PlusCircle className="mr-2" />
                  Create New Note
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    </AppLayout>
  );
}
