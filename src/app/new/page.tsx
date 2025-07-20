import AppLayout from '@/components/app-layout';
import ImageUploader from '@/components/image-uploader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, Image as ImageIcon, ArrowRight } from 'lucide-react';

export default function NewNotePage() {
  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8">
        <header className="mb-8">
          <h1 className="font-headline text-3xl md:text-4xl">Create a New Note</h1>
          <p className="text-muted-foreground mt-2">Choose how you want to start your next study session.</p>
        </header>
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <Card className="bg-secondary/30 border-primary/20">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2 text-xl"><ImageIcon className="text-accent" /> From Image</CardTitle>
              <CardDescription>Upload a textbook page and let AI do the heavy lifting.</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader />
            </CardContent>
          </Card>
          <Card className="bg-secondary/30 border-primary/20 flex flex-col items-center justify-center text-center p-8 h-full">
             <div className="flex flex-col items-center justify-center flex-1">
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2 text-xl"><FileText className="text-accent" /> From Scratch</CardTitle>
                  <CardDescription>Start with a blank canvas and type your notes manually.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/study/new" passHref>
                    <Button variant="secondary" className="shadow-glow hover:shadow-glow-sm transition-shadow">
                      Start with a Blank Note
                      <ArrowRight />
                    </Button>
                  </Link>
                </CardContent>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
