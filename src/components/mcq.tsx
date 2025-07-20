'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

type MCQProps = {
  questionNumber?: number;
  question: string;
  options: string[];
  correctAnswer: string;
};

export function MCQ({ questionNumber, question, options, correctAnswer }: MCQProps) {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [shuffledOptions] = useState(() => options.sort(() => Math.random() - 0.5));

  const handleSubmit = () => {
    if (selectedValue) {
      setIsSubmitted(true);
    }
  };
  
  const handleReset = () => {
      setIsSubmitted(false);
      setSelectedValue(null);
  }

  const isCorrect = selectedValue === correctAnswer;

  return (
    <div className="bg-secondary/30 rounded-lg p-4">
      <p className="font-semibold mb-3">
        {questionNumber && `${questionNumber}. `}
        {question}
      </p>
      <RadioGroup
        value={selectedValue ?? ''}
        onValueChange={setSelectedValue}
        disabled={isSubmitted}
        className="space-y-2"
      >
        {shuffledOptions.map((option, index) => {
          const isSelected = selectedValue === option;
          const isCorrectOption = option === correctAnswer;

          return (
            <Label
              key={index}
              className={cn(
                'flex items-center gap-3 p-3 rounded-md border border-input transition-colors',
                !isSubmitted && 'cursor-pointer hover:bg-accent/10 has-[:checked]:border-primary',
                isSubmitted && isCorrectOption && 'border-green-500 bg-green-500/10 text-primary-foreground',
                isSubmitted && isSelected && !isCorrectOption && 'border-red-500 bg-red-500/10 text-primary-foreground',
                isSubmitted && !isSelected && 'opacity-60'
              )}
            >
              <RadioGroupItem value={option} id={`q-${questionNumber}-option-${index}`} />
              <span>{option}</span>
              {isSubmitted && isCorrectOption && <CheckCircle2 className="ml-auto text-green-400" />}
              {isSubmitted && isSelected && !isCorrectOption && <XCircle className="ml-auto text-red-400" />}
            </Label>
          );
        })}
      </RadioGroup>
      <div className="mt-4">
        {!isSubmitted ? (
          <Button onClick={handleSubmit} disabled={!selectedValue} className="w-full">
            Check Answer
          </Button>
        ) : (
          <div className='flex flex-col sm:flex-row gap-2 items-center'>
            <div
              className={cn(
                'flex w-full items-center justify-center gap-2 p-3 rounded-md text-sm font-semibold',
                isCorrect ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
              )}
            >
              {isCorrect ? <CheckCircle2 /> : <XCircle />}
              {isCorrect ? 'Correct!' : `The correct answer is "${correctAnswer}"`}
            </div>
            <Button onClick={handleReset} variant="outline" className="w-full sm:w-auto">
                <RotateCcw className="mr-2"/> Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
