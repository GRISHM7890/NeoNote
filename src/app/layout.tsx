import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { Manrope } from 'next/font/google';

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
});


export const metadata: Metadata = {
  title: "Shreeya's AI",
  description: 'An AI-powered study companion that transforms textbook pages into interactive notes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn('font-body antialiased min-h-screen bg-background', manrope.variable)}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
