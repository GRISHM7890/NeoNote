
'use client';

import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarGroup, SidebarFooter } from '@/components/ui/sidebar';
import { Home, Notebook, PlusSquare, Settings, BrainCircuit, FileText, FlaskConical, Calendar, BookOpen, Lightbulb, Calculator, Mic, FileQuestion, GraduationCap, Timer, FolderKanban, Network, Bot, Shield, Swords, Languages, BookCopy, Zap, BellRing, BookMarked, BrainCog, TrendingUp, MicVocal, FilePenLine, Leaf, Wind, Video, Library, User, LogOut, Printer, Music, Puzzle, Star, View, Smile } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from './icons';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ThemeToggle } from './theme-toggle';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

type AppLayoutProps = {
  children: React.ReactNode;
  inChat?: boolean;
  onLeaveChat?: () => void;
};

const UserProfile = ({ inChat, onLeaveChat }: { inChat?: boolean, onLeaveChat?: () => void }) => {
    const [name, setName] = useState('');
    const [image, setImage] = useState('');

    useEffect(() => {
        const savedName = localStorage.getItem('synapse-user-name') || 'User';
        const savedImage = localStorage.getItem('synapse-profile-image') || '';
        setName(savedName);
        setImage(savedImage);
    }, []);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={image} alt={name} />
                        <AvatarFallback>
                            <User/>
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            Student
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/"><Home className="mr-2"/> Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                     <Link href="/settings"><Settings className="mr-2"/> Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {inChat ? (
                     <DropdownMenuItem onClick={onLeaveChat}>
                        <LogOut className="mr-2"/> Leave Chat
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem>
                       <LogOut className="mr-2"/> Log out
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};


export default function AppLayout({ children, inChat, onLeaveChat }: AppLayoutProps) {
  const pathname = usePathname();

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/new', label: 'New Note', icon: PlusSquare },
    { href: '/library', label: 'My Library', icon: Library },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];
  
  const calculators = [
    { href: '/tools/summary-generator', label: 'AI Summary Generator', icon: BrainCircuit },
    { href: '/tools/flashcard-creator', label: 'Flashcards Creator', icon: FileText },
    { href: '/tools/question-bank', label: 'Exam Booster Pack', icon: Shield },
    { href: '/tools/doubt-locker', label: 'Doubt Solver Bot', icon: Bot },
    { href: '/tools/formula-bank', label: 'Formula Bank', icon: BookCopy },
    { href: '/tools/study-timetable', label: 'Smart Planner', icon: Zap },
    { href: '/tools/math-solver', label: 'Math & Chemistry Solver', icon: Calculator },
    { href: '/tools/time-tracker', label: 'Study Time Tracker', icon: Timer },
    { href: '/tools/homework-organizer', label: 'Homework Auto-Organizer', icon: FolderKanban },
    { href: '/tools/mindmap-generator', label: 'Mindmap Generator', icon: Network },
    { href: '/tools/flashcard-battle', label: 'Flashcard Battle Mode', icon: Swords },
    { href: '/tools/revision-coach', label: 'Revision Reminder AI Coach', icon: BellRing },
    { href: '/tools/lab-record-generator', label: 'Lab Record Generator', icon: FlaskConical },
    { href: '/tools/reference-analyzer', label: 'Reference Analyzer', icon: BookOpen },
    { href: '/tools/ncert-solutions', label: 'NCERT & Board Solutions', icon: BookMarked },
    { href: '/tools/blurt-board', label: 'Blurt Board', icon: BrainCog },
    { href: '/tools/progress-tracker', label: 'Progress Graph Tracker', icon: TrendingUp },
    { href: '/tools/focus-zen', label: 'Focus Zen Mode', icon: Leaf },
    { href: '/tools/citation-generator', label: 'AI Citation Generator', icon: FilePenLine },
    { href: '/tools/handwriting-converter', label: 'Text-to-Handwriting Converter', icon: Printer },
    { href: '/tools/mood-music', label: 'Study Mood Music', icon: Music },
    { href: '/tools/answer-improver', label: 'AI Answer Improver', icon: Lightbulb },
    { href: '/tools/language-translator', label: 'AI Language Translator', icon: Languages },
    { href: '/tools/voice-notes', label: 'AI Voice Note Converter', icon: Mic },
    { href: '/tools/youtube-notes', label: 'YouTube Video Notes', icon: Video },
    { href: '/tools/concept-quizzer', label: 'Quick Concept Quizzer', icon: FileQuestion },
    { href: '/tools/printable-view', label: 'Printable Flashcard View', icon: View },
    { href: '/tools/puzzle-game', label: 'Flashcard Puzzle Game', icon: Puzzle },
    { href: '/tools/daily-tip', label: 'Personalized Smart Tip', icon: Lightbulb },
    { href: '/tools/sticker-packs', label: 'Sticker Packs for Notes', icon: Smile },
    { href: '/tools/multi-language-flashcards', label: 'Multi-Language Flashcard Creator', icon: Languages },
  ];

  const isToolsPath = pathname.startsWith('/tools');

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
              <Icons.logo className="w-8 h-8 text-accent" />
              <span className="font-headline text-lg group-data-[collapsible=icon]:hidden">Shreeya's AI</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label }}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem asChild>
                <Collapsible defaultOpen={isToolsPath}>
                  <CollapsibleTrigger asChild>
                     <SidebarMenuButton className="w-full justify-between">
                        <div className='flex items-center gap-2'>
                           <GraduationCap className="size-4" />
                           <span>AI Tools</span>
                        </div>
                        <ChevronDown className="size-4 shrink-0 transition-transform duration-200 [&[data-state=open]]:-rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent asChild>
                    <SidebarMenuSub className="max-h-[calc(100vh-250px)] overflow-y-auto">
                      {calculators.sort((a,b) => a.label.localeCompare(b.label)).map((item) => (
                         <SidebarMenuSubItem key={item.href}>
                            <SidebarMenuSubButton asChild isActive={pathname === item.href}>
                                <Link href={item.href}>
                                    <item.icon />
                                    <span>{item.label}</span>
                                </Link>
                            </SidebarMenuSubButton>
                         </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarContent>
           <SidebarFooter>
            <div className="flex items-center justify-center p-2 group-data-[collapsible=icon]:justify-start">
              <ThemeToggle />
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex flex-col flex-1">
          { !inChat && (
              <header className="p-2 flex justify-between items-center border-b">
                <div className="md:hidden">
                  <SidebarTrigger />
                </div>
                <div className="flex-1"></div>
                <UserProfile />
              </header>
            )
          }
          <div className="flex flex-col flex-1">
            <main className="flex-1">
              {children}
            </main>
            { !inChat && (
              <footer className="p-4 text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} All Rights Reserved. Product Powered by PULXO INDUSTRIES.
              </footer>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
