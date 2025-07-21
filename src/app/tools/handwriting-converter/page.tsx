
'use client';

import React, { useState, useRef } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer, Download, Loader2, Sparkles, Settings, Type, Palette, Baseline } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { cn } from '@/lib/utils';

const fontOptions = [
  { name: 'Indie Flower', value: 'font-indie-flower', variable: 'var(--font-indie-flower)' },
  { name: 'Caveat', value: 'font-caveat', variable: 'var(--font-caveat)' },
  { name: 'Kalam', value: 'font-kalam', variable: 'var(--font-kalam)' },
  { name: 'Patrick Hand', value: 'font-patrick-hand', variable: 'var(--font-patrick-hand)' },
];

const colorOptions = [
    { name: 'Black', value: '#1a1a1a' },
    { name: 'Blue', value: '#0033cc' },
    { name: 'Red', value: '#d90000' },
];


export default function HandwritingConverterPage() {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [font, setFont] = useState(fontOptions[0].value);
  const [color, setColor] = useState(colorOptions[0].value);
  const [fontSize, setFontSize] = useState([20]);
  const [paper, setPaper] = useState('plain');
  const [isLoading, setIsLoading] = useState(false);

  const printableRef = useRef<HTMLDivElement>(null);

  const selectedFont = fontOptions.find(f => f.value === font);

  const handleDownload = async () => {
    if (!printableRef.current) return;
    setIsLoading(true);

    try {
        const canvas = await html2canvas(printableRef.current, {
            scale: 2,
            backgroundColor: '#ffffff',
            useCORS: true,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const ratio = canvasWidth / canvasHeight;
        const width = pdfWidth;
        const height = width / ratio;

        pdf.addImage(imgData, 'PNG', 0, 0, width, height > pdfHeight ? pdfWidth : width, height > pdfHeight ? height : pdfHeight, undefined, 'FAST');
        pdf.save('handwritten-note.pdf');
        
        toast({
            title: 'Download Started',
            description: 'Your handwritten note is being downloaded as a PDF.',
        });

    } catch (error) {
        console.error(error);
        toast({
            title: 'Download Failed',
            description: 'There was an error creating the PDF.',
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex items-center gap-4">
          <Printer className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">Text-to-Handwriting Converter</h1>
            <p className="text-muted-foreground mt-1">Convert typed notes into realistic, printable handwriting.</p>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <Card className="bg-secondary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Type /> Input</CardTitle>
              <CardDescription>Paste your notes here.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Start typing your notes..."
                rows={15}
                className="text-lg"
              />
            </CardContent>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings/> Customization</CardTitle>
                <CardDescription>Personalize the look of your note.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Handwriting Style</Label>
                    <Select value={font} onValueChange={setFont}>
                        <SelectTrigger><SelectValue placeholder="Select a font" /></SelectTrigger>
                        <SelectContent>
                            {fontOptions.map(f => (
                                <SelectItem key={f.value} value={f.value} style={{fontFamily: f.variable}}>
                                    {f.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Ink Color</Label>
                        <Select value={color} onValueChange={setColor}>
                            <SelectTrigger><SelectValue placeholder="Select a color" /></SelectTrigger>
                            <SelectContent>
                                {colorOptions.map(c => (
                                    <SelectItem key={c.value} value={c.value}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full" style={{backgroundColor: c.value}}/>
                                            {c.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Paper Style</Label>
                         <Select value={paper} onValueChange={setPaper}>
                            <SelectTrigger><SelectValue placeholder="Select paper" /></SelectTrigger>
                            <SelectContent>
                               <SelectItem value="plain">Plain</SelectItem>
                               <SelectItem value="ruled">Ruled Lines</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label className="flex justify-between">
                        <span>Font Size</span>
                        <span>{fontSize[0]}px</span>
                    </Label>
                    <Slider value={fontSize} onValueChange={setFontSize} min={14} max={32} step={1} />
                 </div>
                 <Button onClick={handleDownload} disabled={!text || isLoading} className="w-full text-lg py-6 shadow-glow hover:shadow-glow-sm">
                    {isLoading ? <Loader2 className="animate-spin mr-2"/> : <Download className="mr-2"/>}
                    Download as PDF
                </Button>
            </CardContent>
          </Card>
          
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>This is how your note will look on A4 paper.</CardDescription>
            </CardHeader>
            <CardContent>
              <div ref={printableRef} className={cn("bg-white p-8 aspect-[1/1.414] overflow-hidden", paper === 'ruled' && 'bg-ruled-paper')}>
                <pre
                  className={cn("whitespace-pre-wrap leading-relaxed", selectedFont?.value)}
                  style={{
                    fontFamily: selectedFont?.variable,
                    color: color,
                    fontSize: `${fontSize[0]}px`,
                    lineHeight: paper === 'ruled' ? `${fontSize[0] * 1.5}px` : 'normal',
                  }}
                >
                  {text || "Your text will appear here..."}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
