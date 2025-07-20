
'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Plus, Loader2, Wand2, Star, Percent } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { simulateRank, type SimulateRankInput, type SimulateRankOutput } from '@/ai/flows/ai-rank-simulator';

type MockTest = {
  id: string;
  testName: string;
  subject: string;
  score: number;
  totalMarks: number;
  percentage: number;
  date: Date;
  analysis?: SimulateRankOutput;
  isAnalyzing?: boolean;
};

const AddTestDialog = ({ onTestAdded }: { onTestAdded: (test: MockTest) => void }) => {
    const [open, setOpen] = useState(false);
    const [testName, setTestName] = useState('');
    const [subject, setSubject] = useState('');
    const [score, setScore] = useState<number | ''>('');
    const [totalMarks, setTotalMarks] = useState<number | ''>(100);

    const handleAddTest = () => {
        if (!testName || !subject || score === '' || totalMarks === '' || +score > +totalMarks) {
            alert('Please fill all fields correctly.');
            return;
        }
        
        const newTest: MockTest = {
            id: Date.now().toString(),
            testName,
            subject,
            score: +score,
            totalMarks: +totalMarks,
            percentage: (+score / +totalMarks) * 100,
            date: new Date(),
        };

        onTestAdded(newTest);
        setOpen(false);
        // Reset form
        setTestName('');
        setSubject('');
        setScore('');
        setTotalMarks(100);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="shadow-glow hover:shadow-glow-sm">
                    <Plus className="mr-2" /> Add Mock Test
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Mock Test Score</DialogTitle>
                    <DialogDescription>Enter the details of your completed mock test.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="testName">Test Name</Label>
                        <Input id="testName" value={testName} onChange={(e) => setTestName(e.target.value)} placeholder="e.g., Weekly Physics Test" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., Physics" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="score">Score</Label>
                            <Input id="score" type="number" value={score} onChange={(e) => setScore(+e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="totalMarks">Total Marks</Label>
                            <Input id="totalMarks" type="number" value={totalMarks} onChange={(e) => setTotalMarks(+e.target.value)} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleAddTest}>Add Test</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export default function ProgressTrackerPage() {
  const { toast } = useToast();
  const [tests, setTests] = useState<MockTest[]>([]);

  const addTest = (test: MockTest) => {
    setTests(prev => [...prev, test].sort((a,b) => a.date.getTime() - b.date.getTime()));
  };
  
  const handleAnalyzeRank = async (testId: string) => {
    const testIndex = tests.findIndex(t => t.id === testId);
    if(testIndex === -1) return;

    setTests(prev => prev.map(t => t.id === testId ? {...t, isAnalyzing: true } : t));

    const test = tests[testIndex];
    const input: SimulateRankInput = {
        subject: test.subject,
        scorePercentage: test.percentage,
        examType: "Board Exams" // Defaulting for now, can be an input later
    };

    try {
        const result = await simulateRank(input);
        setTests(prev => prev.map(t => t.id === testId ? {...t, analysis: result, isAnalyzing: false } : t));
        toast({ title: "Analysis Complete!", description: `AI has generated an analysis for ${test.testName}`});
    } catch(error) {
        console.error(error);
        toast({ title: "Analysis Failed", variant: "destructive"});
        setTests(prev => prev.map(t => t.id === testId ? {...t, isAnalyzing: false } : t));
    }
  }
  
  const chartData = tests.map(test => ({
    name: format(test.date, 'd MMM'),
    [test.subject]: test.percentage,
    date: test.date,
  }));

  // Consolidate data for chart
  const consolidatedChartData = chartData.reduce((acc, current) => {
    let dateEntry = acc.find(entry => entry.name === current.name);
    if (dateEntry) {
        Object.assign(dateEntry, current);
    } else {
        acc.push({ ...current });
    }
    return acc;
  }, [] as {name: string, date: Date, [key: string]: any}[]).sort((a,b) => a.date.getTime() - b.date.getTime());

  const subjects = [...new Set(tests.map(t => t.subject))];
  const subjectColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8 space-y-8">
        <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex items-center gap-4">
            <TrendingUp className="w-10 h-10 text-accent" />
            <div>
              <h1 className="font-headline text-3xl md:text-4xl">Progress Graph Tracker</h1>
              <p className="text-muted-foreground mt-1">Input mock test scores to visualize progress and get AI rank analysis.</p>
            </div>
          </div>
          <AddTestDialog onTestAdded={addTest} />
        </header>
        
        <Card className="bg-secondary/30">
            <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Your mock test scores over time.</CardDescription>
            </CardHeader>
            <CardContent>
                {tests.length > 0 ? (
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={consolidatedChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                                <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                                <Tooltip
                                    contentStyle={{ 
                                        backgroundColor: 'hsl(var(--background))', 
                                        borderColor: 'hsl(var(--border))'
                                    }}
                                />
                                <Legend />
                                {subjects.map((subject, i) => (
                                    <Line key={subject} type="monotone" dataKey={subject} stroke={subjectColors[i % subjectColors.length]} connectNulls />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
                        <TrendingUp className="mx-auto h-16 w-16 mb-4" />
                        <h2 className='text-xl font-semibold text-foreground'>No Data Yet</h2>
                        <p>Click "Add Mock Test" to start tracking your progress.</p>
                    </div>
                )}
            </CardContent>
        </Card>
        
         <Card className="bg-secondary/30">
            <CardHeader>
                <CardTitle>Mock Test History</CardTitle>
                <CardDescription>A detailed log of all your tests.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Test Name</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Percentage</TableHead>
                            <TableHead className='text-right'>AI Analysis</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tests.map(test => (
                            <React.Fragment key={test.id}>
                            <TableRow>
                                <TableCell>{format(test.date, 'd MMM, yyyy')}</TableCell>
                                <TableCell className='font-medium'>{test.testName}</TableCell>
                                <TableCell>{test.subject}</TableCell>
                                <TableCell>{test.score}/{test.totalMarks}</TableCell>
                                <TableCell className='font-semibold'>{test.percentage.toFixed(1)}%</TableCell>
                                <TableCell className='text-right'>
                                    {!test.analysis && (
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            onClick={() => handleAnalyzeRank(test.id)}
                                            disabled={test.isAnalyzing}
                                        >
                                            {test.isAnalyzing ? <Loader2 className='animate-spin'/> : <Wand2 className='mr-2'/>}
                                            Get Rank Analysis
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                            {test.analysis && (
                                <TableRow>
                                    <TableCell colSpan={6} className="p-0">
                                        <div className="bg-background/50 p-4 m-2 rounded-md border space-y-3">
                                            <div className="flex flex-wrap gap-4 items-center">
                                                <div className="flex items-center gap-2">
                                                    <Star className="w-4 h-4 text-accent" />
                                                    <p><strong>Predicted Rank:</strong> {test.analysis.predictedRankRange}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Percent className="w-4 h-4 text-accent" />
                                                    <p><strong>Percentile:</strong> {test.analysis.predictedPercentile.toFixed(1)}</p>
                                                </div>
                                            </div>
                                            <p className="text-muted-foreground text-sm">{test.analysis.analysis}</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
