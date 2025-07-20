
'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderKanban, Loader2, Plus, Sparkles, UploadCloud, Wand2, CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { organizeHomework, type OrganizeHomeworkInput, type OrganizeHomeworkOutput } from '@/ai/flows/ai-homework-organizer';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, differenceInDays, parseISO } from 'date-fns';

type HomeworkItem = OrganizeHomeworkOutput & {
  id: string;
  dueDate: string;
};

const AddHomeworkDialog = ({ onHomeworkAdded }: { onHomeworkAdded: (item: HomeworkItem) => void }) => {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [text, setText] = useState('');
    const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
    const [imageData, setImageData] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(URL.createObjectURL(file));
            setImageData(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
    };
    
    const handleAddHomework = async () => {
        if (!text && !imageData) {
            toast({ title: "Input is empty", description: "Please provide text or an image.", variant: "destructive" });
            return;
        }
        if (!dueDate) {
            toast({ title: "Due date is missing", description: "Please select a due date.", variant: "destructive" });
            return;
        }
        setIsLoading(true);

        try {
            const input: OrganizeHomeworkInput = {
                dueDate: format(dueDate, 'yyyy-MM-dd'),
                inputText: text || undefined,
                photoDataUri: imageData || undefined,
            };
            const result = await organizeHomework(input);
            onHomeworkAdded({ ...result, id: Date.now().toString(), dueDate: input.dueDate });
            toast({ title: "Homework Added!", description: "The AI has organized your new task." });
            // Reset state
            setOpen(false);
            setText('');
            setDueDate(new Date());
            setImageData(null);
            setImagePreview(null);

        } catch (error) {
            console.error(error);
            toast({ title: "Failed to add homework", description: "The AI could not process your request.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="shadow-glow hover:shadow-glow-sm">
                    <Plus className="mr-2" /> Add Homework
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Homework</DialogTitle>
                    <DialogDescription>Let AI organize your task. Just provide the details.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Textarea placeholder="Paste homework text here..." value={text} onChange={(e) => setText(e.target.value)} rows={4} />
                    <p className='text-center text-sm text-muted-foreground'>OR</p>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                        <UploadCloud className="mr-2" /> {imagePreview ? 'Change Image' : 'Upload Image'}
                    </Button>
                    {imagePreview && (
                        <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                            <Image src={imagePreview} alt="Uploaded homework" layout="fill" objectFit="contain" />
                        </div>
                    )}
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !dueDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dueDate ? format(dueDate, "PPP") : <span>Pick a due date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>
                <DialogFooter>
                    <Button onClick={handleAddHomework} disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2" />}
                        Organize with AI
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


const HomeworkCard = ({ item, onRemove }: { item: HomeworkItem, onRemove: (id: string) => void }) => {
    const daysLeft = differenceInDays(parseISO(item.dueDate), new Date());
    
    const priorityColors = {
        High: "bg-red-500/20 border-red-500/50 text-red-300",
        Medium: "bg-yellow-500/20 border-yellow-500/50 text-yellow-300",
        Low: "bg-green-500/20 border-green-500/50 text-green-300"
    };

    const urgencyColors = {
        urgent: "text-red-400", // 0-2 days
        soon: "text-yellow-400", // 3-7 days
        later: "text-green-400" // > 7 days
    };
    
    let urgencyColor = urgencyColors.later;
    if (daysLeft <= 2) urgencyColor = urgencyColors.urgent;
    else if (daysLeft <= 7) urgencyColor = urgencyColors.soon;

    const daysLeftText = daysLeft < 0 ? 'Overdue' : daysLeft === 0 ? 'Due Today' : `${daysLeft}d left`;

    return (
        <Card className="bg-secondary/30 flex flex-col">
            <CardHeader>
                <div className='flex justify-between items-start'>
                    <CardTitle className="text-xl font-headline">{item.subject}</CardTitle>
                    <Badge className={cn("ml-auto", priorityColors[item.priority])}>{item.priority}</Badge>
                </div>
                <CardDescription>{item.taskSummary}</CardDescription>
            </CardHeader>
            <CardContent className='mt-auto flex justify-between items-center text-sm'>
                <div className='flex items-center gap-2'>
                    <CalendarIcon className='w-4 h-4 text-muted-foreground'/>
                    <span className={cn('font-semibold', urgencyColor)}>{daysLeftText}</span>
                </div>
                <span className='text-muted-foreground'>{format(parseISO(item.dueDate), 'd MMM')}</span>
            </CardContent>
        </Card>
    );
};


export default function HomeworkOrganizerPage() {
  const [homework, setHomework] = useState<HomeworkItem[]>([]);

  const addHomeworkItem = (item: HomeworkItem) => {
    setHomework(prev => [...prev, item].sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
  };

  const removeHomeworkItem = (id: string) => {
    setHomework(prev => prev.filter(item => item.id !== id));
  }

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex items-center gap-4">
            <FolderKanban className="w-10 h-10 text-accent" />
            <div>
              <h1 className="font-headline text-3xl md:text-4xl">Homework Auto-Organizer</h1>
              <p className="text-muted-foreground mt-1">Scan homework and let AI add it to your dashboard.</p>
            </div>
          </div>
          <AddHomeworkDialog onHomeworkAdded={addHomeworkItem} />
        </header>
        
        <main>
            {homework.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {homework.map(item => <HomeworkCard key={item.id} item={item} onRemove={removeHomeworkItem} />)}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-20 border-2 border-dashed rounded-lg">
                    <FolderKanban className="mx-auto h-16 w-16 mb-4" />
                    <h2 className='text-xl font-semibold text-foreground'>Your Homework Dashboard is Empty</h2>
                    <p>Click "Add Homework" to get started.</p>
                </div>
            )}
        </main>
      </div>
    </AppLayout>
  );
}
