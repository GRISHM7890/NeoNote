'use client';

import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarGroup } from '@/components/ui/sidebar';
import { Home, Notebook, PlusSquare, Settings, BrainCircuit, FileText, FlaskConical, Calendar, BookOpen, Lightbulb, Calculator, Mic, FileQuestion, GraduationCap } from 'lucide-react';
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
    { href: '/tools/formula-bank', label: 'Smart Formula Bank', icon: Calculator },
    { href: '/tools/question-bank', label: 'AI Question Bank', icon: FileQuestion },
    { href: '/tools/lab-record-generator', label: 'Lab Record Generator', icon: FlaskConical },
    { href: '/tools/study-timetable', label: 'Study Timetable', icon: Calendar },
    { href: '/tools/reference-analyzer', label: 'Reference Analyzer', icon: BookOpen },
    { href: '/tools/doubt-locker', label: 'Doubt Locker', icon: Lightbulb },
    { href: '/tools/math-solver', label: 'Math & Chemistry Solver', icon: Calculator },
    { href: '/tools/voice-notes', label: 'Voice Note Converter', icon: Mic },
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
