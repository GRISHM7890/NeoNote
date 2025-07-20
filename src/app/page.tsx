import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BrainCircuit, FileText, FlaskConical, Calendar, BookOpen, Lightbulb, Calculator, Mic, FileQuestion } from 'lucide-react';
import Link from 'next/link';

const features = [
  { href: '/tools/summary-generator', title: 'AI Summary Generator', description: 'Generate summaries from textbook photos or PDFs.', icon: BrainCircuit, },
  { href: '/tools/flashcard-creator', title: 'Chapter-wise Flashcards', description: 'Instantly create flashcards from a photo of any chapter.', icon: FileText, },
  { href: '/tools/formula-bank', title: 'Smart Formula Bank', description: 'Categorized formulas with explanations and derivations.', icon: Calculator, },
  { href: '/tools/question-bank', title: 'AI Question Bank', description: 'Generate practice questions for any subject and exam type.', icon: FileQuestion, },
  { href: '/tools/lab-record-generator', title: 'Lab Record Generator', description: 'Get AI-written practicals for your experiments.', icon: FlaskConical, },
  { href: '/tools/study-timetable', title: 'Auto Study Timetable', description: 'Build a personalized study plan in seconds.', icon: Calendar, },
  { href: '/tools/reference-analyzer', title: 'Reference Book Analyzer', description: 'Analyze books and get AI-generated video explanations.', icon: BookOpen, },
  { href: '/tools/doubt-locker', title: 'Doubt Locker', description: 'Get instant answers to your study questions.', icon: Lightbulb, },
  { href: '/tools/math-solver', title: 'Math & Chemistry Solver', description: 'Scan and solve equations with step-by-step logic.', icon: Calculator, },
  { href: '/tools/voice-notes', title: 'Voice Note Converter', description: 'Convert spoken lectures into formatted study notes.', icon: Mic, },
];

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8">
        <header className="mb-8">
          <h1 className="font-headline text-3xl md:text-4xl text-foreground">Welcome to Shreeya's AI</h1>
          <p className="text-muted-foreground mt-2">Your complete AI-powered study toolkit. Select a tool to get started.</p>
        </header>
        <main>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.href} className="bg-secondary/30 border-primary/20 flex flex-col hover:border-accent transition-all">
                <CardHeader>
                  <CardTitle className="font-headline text-xl flex items-center gap-3">
                    <feature.icon className="w-6 h-6 text-accent" />
                    {feature.title}
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <Link href={feature.href} passHref>
                    <Button variant="secondary" className="w-full">
                      Open Tool <ArrowRight />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </AppLayout>
  );
}