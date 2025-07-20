'use client';

import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarGroup } from '@/components/ui/sidebar';
import { Home, Notebook, PlusSquare, Settings, BrainCircuit, FileText, FlaskConical, Calendar, BookOpen, Lightbulb, Calculator, Mic, FileQuestion, GraduationCap, Timer, FolderKanban, Network, Bot, Shield, Swords, Languages, BookCopy, Zap, BellRing } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from './icons';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown } from 'lucide-react';
import React from 'react';

type AppLayoutProps = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/new', label: 'New Note', icon: PlusSquare },
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
    { href: '/tools/voice-notes', label: 'Voice-to-Note Generator', icon: Languages },
    { href: '/tools/revision-coach', label: 'Revision Reminder AI Coach', icon: BellRing },
    { href: '/tools/lab-record-generator', label: 'Lab Record Generator', icon: FlaskConical },
    { href: '/tools/reference-analyzer', label: 'Reference Analyzer', icon: BookOpen },
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
                        <ChevronDown className="size-4 shrink-0 transition-transform duration-200" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent asChild>
                    <SidebarMenuSub>
                      {calculators.map((item) => (
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
        </Sidebar>
        <SidebarInset className="flex flex-col flex-1">
          <header className="p-2 md:hidden">
            <SidebarTrigger />
          </header>
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
