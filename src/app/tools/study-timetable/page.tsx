import AppLayout from '@/components/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export default function StudyTimetablePage() {
  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8">
        <header className="mb-8 flex items-center gap-4">
          <Calendar className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">Auto Study Timetable Builder</h1>
            <p className="text-muted-foreground mt-1">Generates a realistic, effective study plan automatically.</p>
          </div>
        </header>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-20">
              <p>Feature coming soon!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
