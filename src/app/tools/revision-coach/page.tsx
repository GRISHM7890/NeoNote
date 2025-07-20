
'use client';

import React, { useState, useMemo } from 'react';
import { addDays, format } from 'date-fns';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BellRing, Loader2, Sparkles, PlusCircle, X, Check, CalendarDays, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateRevisionSchedule, type GenerateRevisionScheduleInput, type GenerateRevisionScheduleOutput } from '@/ai/flows/ai-revision-scheduler';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

type RevisionItem = {
    day: number;
    topic: string;
    isCompleted: boolean;
};

type GroupedSchedule = {
    [day: number]: {
        date: Date;
        items: RevisionItem[];
    };
};

export default function RevisionCoachPage() {
  const { toast } = useToast();
  const [topics, setTopics] = useState<string[]>(['']);
  const [totalDays, setTotalDays] = useState(30);

  const [isLoading, setIsLoading] = useState(false);
  const [schedule, setSchedule] = useState<RevisionItem[]>([]);

  const handleTopicChange = (index: number, value: string) => {
    const newTopics = [...topics];
    newTopics[index] = value;
    setTopics(newTopics);
  };

  const addTopic = () => {
    setTopics([...topics, '']);
  };

  const removeTopic = (index: number) => {
    const newTopics = topics.filter((_, i) => i !== index);
    setTopics(newTopics);
  };

  const handleGenerateSchedule = async () => {
    const validTopics = topics.map(s => s.trim()).filter(s => s);
    if (validTopics.length === 0) {
      toast({
        title: 'Missing Topics',
        description: 'Please provide at least one topic you have studied.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setSchedule([]);

    const input: GenerateRevisionScheduleInput = {
      topics: validTopics,
      totalDays,
    };

    try {
      const result = await generateRevisionSchedule(input);
      setSchedule(result.schedule.map(item => ({...item, isCompleted: false})));
      toast({
        title: 'Revision Plan Generated!',
        description: 'Your personalized spaced repetition schedule is ready.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Generation Failed',
        description: 'The AI failed to generate the schedule. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCompletion = (day: number, topic: string) => {
    setSchedule(prev => prev.map(item => 
        item.day === day && item.topic === topic ? { ...item, isCompleted: !item.isCompleted } : item
    ));
  };
  
  const groupedSchedule = useMemo(() => {
    const groups: GroupedSchedule = {};
    const today = new Date();
    schedule.forEach(item => {
        if (!groups[item.day]) {
            groups[item.day] = {
                date: addDays(today, item.day - 1),
                items: []
            };
        }
        groups[item.day].items.push(item);
    });
    return Object.values(groups).sort((a,b) => a.date.getTime() - b.date.getTime());
  }, [schedule]);


  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex items-center gap-4">
          <BellRing className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">Revision Reminder AI Coach</h1>
            <p className="text-muted-foreground mt-1">Generate a smart revision plan based on the forgetting curve.</p>
          </div>
        </header>

        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle>1. What did you study today?</CardTitle>
            <CardDescription>Enter the topics and the AI will create a spaced repetition schedule.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
              <Label>Topics Studied Today</Label>
              {topics.map((topic, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={topic}
                    onChange={(e) => handleTopicChange(index, e.target.value)}
                    placeholder={`Topic ${index + 1}`}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeTopic(index)} disabled={topics.length <= 1}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addTopic}>
                <PlusCircle className="mr-2" /> Add Topic
              </Button>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="days">Revision Plan Duration (in days)</Label>
                <Input id="days" type="number" value={totalDays} onChange={(e) => setTotalDays(Math.max(7, parseInt(e.target.value, 10)))} min="7" max="90" />
             </div>
            
            <Button onClick={handleGenerateSchedule} disabled={isLoading} className="w-full text-lg py-6 shadow-glow hover:shadow-glow-sm transition-shadow">
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
              Generate Revision Plan
            </Button>
          </CardContent>
        </Card>

        {(isLoading || schedule.length > 0) && (
          <Card className='animate-in fade-in duration-500'>
            <CardHeader>
              <CardTitle className='font-headline text-2xl flex items-center gap-2'>
                <CalendarDays className='text-accent'/>
                Your Personalized Revision Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex items-center justify-center p-8 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin mr-4" />
                  <p>The AI Coach is building your plan for long-term memory...</p>
                </div>
              )}
              {schedule.length > 0 && (
                <div className="max-h-[70vh] overflow-auto">
                    <Table>
                        <TableHeader className="sticky top-0 bg-secondary/50 backdrop-blur-sm">
                            <TableRow>
                                <TableHead className="w-[150px]">Revision Date</TableHead>
                                <TableHead>Topics to Revise</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {groupedSchedule.map((dayPlan) => (
                                <TableRow key={dayPlan.date.toISOString()}>
                                    <TableCell className="font-medium align-top">
                                        <p>{format(dayPlan.date, 'eee, MMM d')}</p>
                                        <Badge variant="outline">Day {dayPlan.items[0].day}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <ul className="space-y-2">
                                            {dayPlan.items.map((item, i) => (
                                                <li key={i} className="flex items-center gap-3">
                                                    <Checkbox
                                                        id={`item-${item.day}-${i}`}
                                                        checked={item.isCompleted}
                                                        onCheckedChange={() => toggleCompletion(item.day, item.topic)}
                                                    />
                                                    <label htmlFor={`item-${item.day}-${i}`} className={`cursor-pointer ${item.isCompleted ? 'text-muted-foreground line-through' : ''}`}>
                                                        {item.topic}
                                                    </label>
                                                </li>
                                            ))}
                                        </ul>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {schedule.length === 0 && !isLoading && (
            <Card className="bg-secondary/30 text-center text-muted-foreground p-10">
                <Brain className="mx-auto h-12 w-12 mb-4"/>
                <h3 className="text-lg font-semibold text-foreground">Ready to lock in your knowledge?</h3>
                <p>Enter the topics you studied today to get a smart revision schedule.</p>
            </Card>
        )}
      </div>
    </AppLayout>
  );
}
