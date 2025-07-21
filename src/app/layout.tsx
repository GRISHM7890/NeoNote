
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { Poppins, PT_Sans, Indie_Flower, Caveat, Kalam, Patrick_Hand } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700', '800', '900']
});

const ptSans = PT_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pt-sans',
  weight: ['400', '700']
});

// Handwriting fonts for the converter tool
const indieFlower = Indie_Flower({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-indie-flower',
  weight: ['400']
});
const caveat = Caveat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-caveat',
  weight: ['400', '700']
});
const kalam = Kalam({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-kalam',
  weight: ['400', '700']
});
const patrickHand = Patrick_Hand({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-patrick-hand',
  weight: ['400']
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
    <html lang="en" suppressHydrationWarning>
      <body className={cn('font-body antialiased min-h-screen bg-background', poppins.variable, ptSans.variable, indieFlower.variable, caveat.variable, kalam.variable, patrickHand.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
