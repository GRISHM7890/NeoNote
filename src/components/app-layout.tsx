'use client';

import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Home, Notebook, PlusSquare, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from './icons';

type AppLayoutProps = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/new', label: 'New Note', icon: PlusSquare },
    { href: '/study/1', label: 'My Notes', icon: Notebook, disabled: true },
    { href: '/settings', label: 'Settings', icon: Settings, disabled: true },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
              <Icons.logo className="w-8 h-8 text-accent" />
              <span className="font-headline text-lg group-data-[collapsible=icon]:hidden">Synapse</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} legacyBehavior passHref>
                    <SidebarMenuButton
                      isActive={!item.disabled && pathname === item.href}
                      tooltip={{ children: item.label }}
                      aria-disabled={item.disabled}
                      disabled={item.disabled}
                    >
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
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
