'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { imageToText } from '@/ai/flows/image-to-text';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, UploadCloud, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from './ui/card';

export default function ImageUploader() {
  const router = useRouter();
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreview(URL.createObjectURL(file));
        setImageData(dataUrl);
        setExtractedText('');
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
    setIsLoading(true);
    try {
      const result = await imageToText({ photoDataUri: imageData });
      setExtractedText(result.extractedText);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error extracting text',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {!imagePreview && (
         <Card 
            className="border-2 border-dashed border-muted-foreground/50 hover:border-accent transition-colors duration-300 cursor-pointer h-48 flex items-center justify-center"
            onClick={() => fileInputRef.current?.click()}
        >
            <CardContent className="text-center text-muted-foreground p-6">
                <UploadCloud className="mx-auto h-10 w-10 mb-2" />
                <p>Click to upload or drag & drop</p>
                <p className="text-xs">PNG, JPG, GIF up to 10MB</p>
            </CardContent>
         </Card>
      )}

      {imagePreview && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden">
          <Image src={imagePreview} alt="Image preview" layout="fill" objectFit="contain" />
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full">
            <UploadCloud className="mr-2" /> {imagePreview ? 'Change Image' : 'Upload Image'}
        </Button>
        <Button onClick={handleExtractText} disabled={!imagePreview || isLoading} className="w-full">
          {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2" />}
          Extract Text
        </Button>
      </div>

      {extractedText && (
        <div className="space-y-4">
          <Textarea
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            rows={10}
            placeholder="AI-extracted text will appear here. You can edit it before creating your note."
          />
          <Button onClick={handleCreateNote} className="w-full shadow-glow hover:shadow-glow-sm transition-shadow">
            Create Note with this Text
          </Button>
        </div>
      )}
    </div>
  );
}
