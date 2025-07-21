
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BrainCircuit, FileText, FlaskConical, Calendar, BookOpen, Lightbulb, Calculator, Mic, FileQuestion, Timer, FolderKanban, Network, Bot, Shield, Swords, Languages, BookCopy, Zap, BellRing, BookMarked, BrainCog, TrendingUp, FilePenLine, Leaf, Music, Printer, QrCode } from 'lucide-react';
import Link from 'next/link';

const features = [
    { href: '/tools/summary-generator', label: 'AI Summary Generator', icon: BrainCircuit, description: "Generate summaries from text or images." },
    { href: '/tools/flashcard-creator', label: 'Flashcards Creator', icon: FileText, description: "Instantly create flashcards from any chapter." },
    { href: '/tools/question-bank', label: 'Exam Booster Pack', icon: Shield, description: "Generate custom mock tests for any exam." },
    { href: '/tools/doubt-locker', label: 'Doubt Solver Bot', icon: Bot, description: "Get step-by-step solutions via text or image." },
    { href: '/tools/formula-bank', label: 'Formula Bank', icon: BookCopy, description: "Dynamic formula library with visual explanations." },
    { href: '/tools/study-timetable', label: 'Smart Planner', icon: Zap, description: "Auto-generate study plans with AI suggestions." },
    { href: '/tools/math-solver', label: 'Math & Chemistry Solver', icon: Calculator, description: "Scan and solve equations with step-by-step logic." },
    { href: '/tools/time-tracker', label: 'Study Time Tracker', icon: Timer, description: "Track study sessions with a Pomodoro timer." },
    { href: '/tools/homework-organizer', label: 'Homework Auto-Organizer', icon: FolderKanban, description: "Scan and categorize homework with AI." },
    { href: '/tools/mindmap-generator', label: 'Mindmap Generator', icon: Network, description: "Convert notes into visual mind maps." },
    { href: '/tools/flashcard-battle', label: 'Flashcard Battle Mode', icon: Swords, description: "Gamify revision with solo or multiplayer battles." },
    { href: '/tools/revision-coach', label: 'Revision Reminder AI Coach', icon: BellRing, description: "Get smart revision reminders based on science." },
    { href: '/tools/lab-record-generator', label: 'Lab Record Generator', icon: FlaskConical, description: "Get AI-written practicals for your experiments." },
    { href: '/tools/reference-analyzer', label: 'Reference Analyzer', icon: BookOpen, description: "Analyze books and get AI-generated Q&A." },
    { href: '/tools/ncert-solutions', label: 'NCERT & Board Solutions', icon: BookMarked, description: "Get detailed solutions for any question." },
    { href: '/tools/blurt-board', label: 'Blurt Board', icon: BrainCog, description: "Test your active recall with an AI examiner." },
    { href: '/tools/progress-tracker', label: 'Progress Graph Tracker', icon: TrendingUp, description: "Visualize progress and get AI rank analysis." },
    { href: '/tools/focus-zen', label: 'Focus Zen Mode', icon: Leaf, description: "Enter a distraction-free, AI-powered focus zone." },
    { href: '/tools/citation-generator', label: 'AI Citation Generator', icon: FilePenLine, description: "Generate MLA, APA citations & verify authenticity." },
    { href: '/tools/handwriting-converter', label: 'Text-to-Handwriting Converter', icon: Printer, description: "Convert typed notes into realistic, printable handwriting." },
    { href: '/tools/mood-music', label: 'Study Mood Music', icon: Music, description: "Curated playlists of focus-enhancing music." },
    { href: '/tools/answer-improver', label: 'AI Answer Improver', icon: Lightbulb, description: "Get AI suggestions to improve your written answers." },
    { href: '/tools/qr-generator', label: 'QR Code for Notes', icon: QrCode, description: "Generate QR codes to link physical and digital notes." },
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
            {features.sort((a,b) => a.label.localeCompare(b.label)).map((feature) => (
              <Card key={feature.href} className="bg-secondary/30 border-primary/20 flex flex-col hover:border-accent transition-all">
                <CardHeader>
                  <CardTitle className="font-headline text-xl flex items-center gap-3">
                    <feature.icon className="w-6 h-6 text-accent" />
                    {feature.label}
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
