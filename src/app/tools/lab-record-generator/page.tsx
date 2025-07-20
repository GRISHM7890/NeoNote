import AppLayout from '@/components/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { FlaskConical } from 'lucide-react';

export default function LabRecordGeneratorPage() {
  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8">
        <header className="mb-8 flex items-center gap-4">
          <FlaskConical className="w-10 h-10 text-accent" />
          <div>
            <h1 className="font-headline text-3xl md:text-4xl">Lab Record Generator</h1>
            <p className="text-muted-foreground mt-1">Get AI-written practicals with aim, apparatus, procedure, and result.</p>
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
