
'use client';

import React, { useState } from 'react';
import { addDays, format } from 'date-fns';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Loader2, Sparkles, PlusCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateTimetable, type GenerateTimetableInput, type GenerateTimetableOutput } from '@/ai/flows/ai-timetable-generator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function StudyTimetablePage() {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<string[]>(['']);
  const [days, setDays] = useState(30);
  const [hoursPerDay, setHoursPerDay] = useState(4);
  const [examName, setExamName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [schedule, setSchedule] = useState<GenerateTimetableOutput | null>(null);

  const handleSubjectChange = (index: number, value: string) => {
    const newSubjects = [...subjects];
    newSubjects[index] = value;
    setSubjects(newSubjects);
  };

  const addSubject = () => {
    setSubjects([...subjects, '']);
  };

  const removeSubject = (index: number) => {
    const newSubjects = subjects.filter((_, i) => i !== index);
    setSubjects(newSubjects);
  };

  const handleGenerateTimetable = async () => {
    const validSubjects = subjects.map(s => s.trim()).filter(s => s);
    if (validSubjects.length === 0 || !days || !hoursPerDay) {
      toast({
        title: 'Missing Information',
        description: 'Please provide at least one subject, number of days, and daily study hours.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setSchedule(null);

    const input: GenerateTimetableInput = {
      subjects: validSubjects,
      days,
      hoursPerDay,
      examName: examName || undefined,
    };

    try {
      const result = await generateTimetable(input);
      setSchedule(result);
      toast({
        title: 'Timetable Generated!',
        description: `Your personalized study plan is ready.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Generation Failed',
        description: 'The AI failed to generate the timetable. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date();

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex items-center gap-4">
          <Calendar className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">Auto Study Timetable Builder</h1>
            <p className="text-muted-foreground mt-1">Generates a realistic, effective study plan automatically.</p>
          </div>
        </header>

        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle>1. Your Study Plan Details</CardTitle>
            <CardDescription>Tell the AI what you need to study and when.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="examName">Goal/Exam Name (Optional)</Label>
                <Input id="examName" value={examName} onChange={(e) => setExamName(e.target.value)} placeholder="e.g., Final Exams, NEET 2025" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="days">Total Study Days</Label>
                <Input id="days" type="number" value={days} onChange={(e) => setDays(Math.max(1, parseInt(e.target.value, 10)))} min="1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours">Study Hours Per Day</Label>
                <Input id="hours" type="number" value={hoursPerDay} onChange={(e) => setHoursPerDay(Math.max(1, parseInt(e.target.value, 10)))} min="1" max="16" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Subjects to Cover</Label>
              {subjects.map((subject, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={subject}
                    onChange={(e) => handleSubjectChange(index, e.target.value)}
                    placeholder={`Subject ${index + 1}`}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeSubject(index)} disabled={subjects.length <= 1}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addSubject}>
                <PlusCircle className="mr-2" /> Add Subject
              </Button>
            </div>
            
            <Button onClick={handleGenerateTimetable} disabled={isLoading} className="w-full text-lg py-6 shadow-glow hover:shadow-glow-sm transition-shadow">
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
              Generate Timetable
            </Button>
          </CardContent>
        </Card>

        {(isLoading || schedule) && (
          <Card className='animate-in fade-in duration-500'>
            <CardHeader>
              <CardTitle className='font-headline text-2xl flex items-center gap-2'>
                <Calendar className='text-accent'/>
                Your {days}-Day Study Plan
              </CardTitle>
              {schedule?.title && <CardDescription>{schedule.title}</CardDescription>}
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex items-center justify-center p-8 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin mr-4" />
                  <p>The AI is building your personalized schedule...</p>
                </div>
              )}
              {schedule && (
                <div className="max-h-[70vh] overflow-auto">
                    <Table>
                        <TableHeader className="sticky top-0 bg-secondary/50 backdrop-blur-sm">
                            <TableRow>
                                <TableHead className="w-[100px]">Day</TableHead>
                                <TableHead className="w-[150px]">Date</TableHead>
                                <TableHead>Focus for the Day</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schedule.schedule.map((dayPlan) => (
                                <TableRow key={dayPlan.day}>
                                    <TableCell className="font-medium">{dayPlan.day}</TableCell>
                                    <TableCell>{format(addDays(today, dayPlan.day - 1), 'eee, MMM d')}</TableCell>
                                    <TableCell>
                                        <ul className="space-y-1 list-disc list-inside">
                                            {dayPlan.sessions.map((session, i) => (
                                                <li key={i}>
                                                    <span className="font-semibold">{session.subject}:</span> {session.topic}
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
      </div>
    </AppLayout>
  );
}
