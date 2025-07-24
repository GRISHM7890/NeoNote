
'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Library, Trash2, FileText, BrainCircuit, Shield, BookCopy, Zap, Calculator, FolderKanban, Network, Swords, BellRing, FlaskConical, BookOpen, BookMarked, BrainCog, TrendingUp, Leaf, Languages, Puzzle, Sticker, HelpCircle, Music, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import { Flashcard } from '@/components/flashcard';
import { MCQ } from '@/components/mcq';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MindmapDisplay } from '@/components/mindmap';
import type { GenerateFlashcardsOutput } from '@/ai/flows/ai-flashcard-generator';
import type { GenerateSummaryOutput } from '@/ai/flows/ai-summary-generator';
import type { GenerateQuestionsOutput } from '@/ai/flows/ai-question-generator';
import type { GenerateFormulasOutput } from '@/ai/flows/ai-formula-generator';
import type { GenerateTimetableOutput } from '@/ai/flows/ai-timetable-generator';
import type { GenerateLabRecordOutput } from '@/ai/flows/ai-lab-record-generator';
import type { ReferenceBookOutput } from '@/ai/flows/ai-reference-analyzer';
import type { FindSolutionOutput } from '@/ai/flows/ai-solution-finder';
import type { ProcessBlurtOutput } from '@/ai/flows/ai-blurt-processor';
import type { SimulateRankOutput } from '@/ai/flows/ai-rank-simulator';
import type { GenerateFocusAmbianceOutput } from '@/ai/flows/ai-focus-ambiance-generator';
import type { MindmapNode } from '@/ai/flows/ai-mindmap-generator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { GenerateBilingualFlashcardsOutput } from '@/ai/flows/ai-bilingual-flashcard-generator';
import type { GenerateConceptQuizOutput } from '@/ai/flows/ai-concept-quiz-generator';
import type { GenerateStickersOutput } from '@/ai/flows/ai-sticker-generator';
import Image from 'next/image';
import type { RecommendMusicOutput } from '@/ai/flows/ai-music-recommender';
import Link from 'next/link';

// Define a union type for all possible library item payloads
type LibraryItemPayload =
  | GenerateFlashcardsOutput
  | GenerateSummaryOutput
  | { input: any; result: GenerateQuestionsOutput }
  | { input: any; result: GenerateFormulasOutput }
  | { input: any; result: GenerateTimetableOutput }
  | { input: any; result: GenerateLabRecordOutput }
  | { input: any; result: ReferenceBookOutput }
  | { input: any; result: FindSolutionOutput }
  | { input: any; result: ProcessBlurtOutput }
  | { input: any; result: SimulateRankOutput }
  | { input: any; result: GenerateFocusAmbianceOutput }
  | { root: MindmapNode }
  | { input: any; result: GenerateBilingualFlashcardsOutput }
  | { input: any; result: GenerateConceptQuizOutput }
  | { input: any; result: GenerateStickersOutput }
  | { input: any; result: RecommendMusicOutput }
  | any;

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


// Individual display components for different library item types

const FlashcardSetDisplay = ({ payload }: { payload: GenerateFlashcardsOutput }) => (
    <Accordion type="multiple" defaultValue={['concepts', 'flashcards', 'mcqs']} className="w-full">
        {payload.coreConcepts && (
            <AccordionItem value="concepts">
                <AccordionTrigger>Core Concepts</AccordionTrigger>
                <AccordionContent className="flex flex-wrap gap-2">
                    {payload.coreConcepts.map((concept, i) => <Badge key={i} variant="secondary">{concept}</Badge>)}
                </AccordionContent>
            </AccordionItem>
        )}
        {payload.flashcards && (
            <AccordionItem value="flashcards">
                <AccordionTrigger>Flashcards</AccordionTrigger>
                <AccordionContent className="grid md:grid-cols-2 gap-4">
                    {payload.flashcards.map((card, i) => <Flashcard key={i} term={card.term} definition={card.definition} />)}
                </AccordionContent>
            </AccordionItem>
        )}
        {payload.multipleChoiceQuestions && (
            <AccordionItem value="mcqs">
                <AccordionTrigger>Multiple Choice Questions</AccordionTrigger>
                <AccordionContent className="space-y-4">
                    {payload.multipleChoiceQuestions.map((mcq, i) => (
                        <div key={i}>
                            <MCQ {...mcq} />
                            {i < payload.multipleChoiceQuestions.length - 1 && <Separator className="my-4"/>}
                        </div>
                    ))}
                </AccordionContent>
            </AccordionItem>
        )}
    </Accordion>
);

const SummaryDisplay = ({ payload }: { payload: GenerateSummaryOutput }) => (
    <div className="space-y-4">
        {payload.title && <h3 className="font-bold text-lg text-primary">{payload.title}</h3>}
        <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: payload.content.replace(/\n/g, '<br />') }} />
        {payload.keywords && payload.keywords.length > 0 && (
            <div>
                <h4 className="font-semibold mb-2">Keywords</h4>
                <div className="flex flex-wrap gap-2">
                    {payload.keywords.map((kw, i) => <Badge key={i}>{kw}</Badge>)}
                </div>
            </div>
        )}
    </div>
);

const QuestionBankDisplay = ({ payload }: { payload: {result: GenerateQuestionsOutput} }) => (
    <Accordion type="multiple" className="w-full">
        {payload.result.multipleChoiceQuestions && (
             <AccordionItem value="mcq"><AccordionTrigger>Multiple Choice</AccordionTrigger>
             <AccordionContent className="space-y-4">
                {payload.result.multipleChoiceQuestions.map((mcq, i) => <MCQ key={i} {...mcq} questionNumber={i+1}/>)}
             </AccordionContent>
             </AccordionItem>
        )}
        {payload.result.shortAnswerQuestions && (
            <AccordionItem value="short"><AccordionTrigger>Short Answer</AccordionTrigger>
            <AccordionContent className="space-y-4">
                {payload.result.shortAnswerQuestions.map((q, i) => <div key={i} className="p-2 border rounded-md"><p className='font-semibold'>{i+1}. {q.question}</p><p className="text-sm text-muted-foreground">{q.answer}</p></div>)}
            </AccordionContent>
            </AccordionItem>
        )}
        {payload.result.longAnswerQuestions && (
             <AccordionItem value="long"><AccordionTrigger>Long Answer</AccordionTrigger>
             <AccordionContent className="space-y-4">
                 {payload.result.longAnswerQuestions.map((q, i) => <div key={i} className="p-2 border rounded-md"><p className='font-semibold'>{i+1}. {q.question}</p><p className="text-sm text-muted-foreground">{q.answer}</p></div>)}
             </AccordionContent>
             </AccordionItem>
        )}
    </Accordion>
);

const FormulaBankDisplay = ({ payload }: { payload: {result: GenerateFormulasOutput}}) => (
    <Accordion type="multiple" className="w-full">
        {payload.result.formulas.map((item, i) => (
            <AccordionItem key={i} value={`formula-${i}`}>
                <AccordionTrigger>{item.name}</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <div className="text-lg"><BlockMath math={item.formula}/></div>
                    <p className="text-muted-foreground">{item.explanation}</p>
                    {item.derivation && <p className="text-sm text-muted-foreground">Derivation: {item.derivation.join(' ')}</p>}
                </AccordionContent>
            </AccordionItem>
        ))}
    </Accordion>
)

const TimetableDisplay = ({ payload }: { payload: {result: GenerateTimetableOutput}}) => (
    <div className="max-h-96 overflow-y-auto">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Focus</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {payload.result.schedule.map(day => (
                    <TableRow key={day.day}>
                        <TableCell>{day.day}</TableCell>
                        <TableCell>{day.sessions.map(s => `${s.subject}: ${s.topic}`).join(', ')}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
)

const BilingualFlashcardDisplay = ({ payload }: { payload: {result: GenerateBilingualFlashcardsOutput, input: any }}) => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {payload.result.bilingualCards.map((bCard, index) => (
            <div key={index} className="p-4 rounded-lg bg-background/50 border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">Source (English)</h4>
                        <p className="font-bold">{bCard.sourceTerm}</p>
                        <p className="text-sm">{bCard.sourceDefinition}</p>
                    </div>
                        <div className="border-t md:border-t-0 md:border-l md:pl-4 pt-2 md:pt-0">
                        <h4 className="font-semibold text-sm text-muted-foreground">{payload.input.targetLanguage}</h4>
                        <p className="font-bold text-primary">{bCard.translatedTerm}</p>
                        <p className="text-sm">{bCard.translatedDefinition}</p>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const ConceptQuizDisplay = ({ payload }: { payload: {result: GenerateConceptQuizOutput }}) => (
     <Accordion type="multiple" className="w-full">
        {payload.result.questions.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger><HelpCircle className="w-4 h-4 mr-2 text-accent"/>{item.question}</AccordionTrigger>
                <AccordionContent>
                    <p className="text-sm prose prose-sm prose-invert max-w-none">{item.modelAnswer}</p>
                </AccordionContent>
            </AccordionItem>
        ))}
    </Accordion>
);

const StickerPackDisplay = ({ payload }: { payload: {result: GenerateStickersOutput }}) => (
    <div>
        {payload.result.stickerSheetUrl ? (
             <div className="aspect-square w-full relative rounded-lg overflow-hidden border">
                <Image src={payload.result.stickerSheetUrl} alt={`Generated sticker sheet`} layout="fill" objectFit="contain"/>
             </div>
        ) : (
            <p className="text-muted-foreground text-center">Sticker generation failed or no image was produced.</p>
        )}
    </div>
);

const MusicRecommendationsDisplay = ({ payload }: { payload: { result: RecommendMusicOutput }}) => (
    <div className="space-y-4">
        {payload.result.recommendations.map((rec, index) => {
            const youtubeLink = `https://www.youtube.com/results?search_query=${encodeURIComponent(rec.youtubeSearchQuery)}`;
            return (
                <Card key={index} className="bg-background/50">
                    <CardHeader>
                        <CardTitle>{rec.title}</CardTitle>
                        <CardDescription>{rec.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Button asChild className="w-full">
                            <Link href={youtubeLink} target="_blank" rel="noopener noreferrer">
                                <Youtube className="mr-2" /> Find on YouTube
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            );
        })}
    </div>
);


const DefaultDisplay = ({ payload }: { payload: any }) => (
    <pre className="whitespace-pre-wrap text-sm bg-background/50 p-4 rounded-md overflow-x-auto">
        {JSON.stringify(payload, null, 2)}
    </pre>
);

const LibraryItemDisplay = ({ item }: { item: LibraryItem }) => {
  const renderContent = () => {
    switch (item.type) {
      case 'Flashcard Set':
        return <FlashcardSetDisplay payload={item.payload} />;
      case 'Summary':
        return <SummaryDisplay payload={item.payload} />;
      case 'Question Bank':
        return <QuestionBankDisplay payload={item.payload} />;
      case 'Formula Bank':
        return <FormulaBankDisplay payload={item.payload} />;
      case 'Mindmap':
        return <div className="overflow-x-auto"><MindmapDisplay node={item.payload.root} /></div>;
      case 'Study Timetable':
        return <TimetableDisplay payload={item.payload} />;
      case 'Bilingual Flashcards':
        return <BilingualFlashcardDisplay payload={item.payload} />;
      case 'Concept Quiz':
          return <ConceptQuizDisplay payload={item.payload} />;
      case 'Sticker Pack':
          return <StickerPackDisplay payload={item.payload} />;
      case 'Music Recommendations':
          return <MusicRecommendationsDisplay payload={item.payload} />;
      // Add more cases here for other types as they are created
      default:
        return <DefaultDisplay payload={item.payload} />;
    }
  };

  const Icon = {
    'Flashcard Set': FileText,
    'Summary': BrainCircuit,
    'Question Bank': Shield,
    'Formula Bank': BookCopy,
    'Study Timetable': Zap,
    'Math & Chemistry Solver': Calculator,
    'Homework Auto-Organizer': FolderKanban,
    'Mindmap': Network,
    'Flashcard Battle': Swords,
    'Revision Schedule': BellRing,
    'Lab Record': FlaskConical,
    'Reference Book Analysis': BookOpen,
    'NCERT & Board Solution': BookMarked,
    'Blurt Board Analysis': BrainCog,
    'Progress Analysis': TrendingUp,
    'Focus Ambiance': Leaf,
    'Bilingual Flashcards': Languages,
    'Concept Quiz': HelpCircle,
    'Sticker Pack': Sticker,
    'Music Recommendations': Music,
  }[item.type] || Library;


  return (
    <Card className="bg-secondary/30 flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
                <Icon className="w-6 h-6 text-accent shrink-0 mt-1" />
                <div>
                    <CardTitle className='text-xl font-headline'>{item.title}</CardTitle>
                    <CardDescription>
                    {item.type} &middot; {format(new Date(item.timestamp), 'd MMM, yyyy p')}
                    </CardDescription>
                </div>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>View Content</AccordionTrigger>
            <AccordionContent>
              {renderContent()}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};


export default function LibraryPage() {
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);

  useEffect(() => {
    setLibraryItems(getLibraryItems());
  }, []);

  const clearLibrary = () => {
    if (confirm('Are you sure you want to delete all items from your library? This cannot be undone.')) {
        saveLibraryItems([]);
        setLibraryItems([]);
    }
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
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {libraryItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(item => <LibraryItemDisplay key={item.id} item={item} />)}
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
