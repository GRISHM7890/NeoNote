
'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { imageToText } from '@/ai/flows/image-to-text';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, UploadCloud, Wand2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export default function ImageUploader() {
  const router = useRouter();
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError(null);
      setExtractedText('');
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreview(URL.createObjectURL(file));
        setImageData(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtractText = async () => {
    if (!imageData) {
      toast({
        title: 'No image selected',
        description: 'Please upload an image first.',
        variant: 'destructive',
      });
      return;
    }
    setIsExtracting(true);
    setError(null);
    try {
      const result = await imageToText({ photoDataUri: imageData });
      setExtractedText(result.extractedText);
      toast({
        title: 'Text Extracted!',
        description: 'You can now edit the text and create your note.',
      })
    } catch (error) {
      console.error(error);
      setError('Failed to extract text from the image. Please try again with a clearer image.');
      toast({
        title: 'Error extracting text',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCreateNote = () => {
    if (!extractedText) {
      toast({
        title: 'No text to save',
        description: 'Please extract text from an image first.',
        variant: 'destructive',
      });
      return;
    }
    const encodedText = encodeURIComponent(extractedText);
    router.push(`/study/new?text=${encodedText}`);
  };

  const step = imagePreview ? (extractedText ? 3 : 2) : 1;

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {step === 1 && (
         <Card 
            className="border-2 border-dashed border-muted-foreground/50 hover:border-accent transition-colors duration-300 cursor-pointer h-60 flex items-center justify-center"
            onClick={() => fileInputRef.current?.click()}
        >
            <CardContent className="text-center text-muted-foreground p-6">
                <UploadCloud className="mx-auto h-12 w-12 mb-4 text-accent" />
                <p className="font-semibold text-foreground">Click to upload or drag & drop</p>
                <p className="text-xs">PNG, JPG, GIF up to 10MB</p>
            </CardContent>
         </Card>
      )}

      {step > 1 && (
        <div className="relative w-full h-60 rounded-lg overflow-hidden border border-border">
          <Image src={imagePreview!} alt="Image preview" layout="fill" objectFit="contain" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full">
            <UploadCloud /> {imagePreview ? 'Change Image' : 'Upload Image'}
        </Button>
        <Button onClick={handleExtractText} disabled={!imagePreview || isExtracting} className="w-full">
          {isExtracting ? <Loader2 className="animate-spin" /> : <Wand2 />}
          Extract Text
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Extraction Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === 3 && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <Textarea
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            rows={10}
            className="bg-secondary/30"
            placeholder="AI-extracted text will appear here. You can edit it before creating your note."
          />
          <Button onClick={handleCreateNote} className="w-full shadow-glow hover:shadow-glow-sm transition-shadow">
            Create Note with this Text
            <ArrowRight />
          </Button>
        </div>
      )}
    </div>
  );
}
