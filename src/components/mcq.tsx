'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { CheckCircle2, XCircle } from 'lucide-react';

type MCQProps = {
  question: string;
  options: string[];
  correctAnswer: string;
};

export function MCQ({ question, options, correctAnswer }: MCQProps) {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selectedValue) {
      setIsSubmitted(true);
    }
  };

  const isCorrect = selectedValue === correctAnswer;

  return (
    <Card className="bg-secondary/30">
      <CardHeader>
        <CardTitle className="font-headline text-lg">{question}</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedValue ?? ''}
          onValueChange={setSelectedValue}
          disabled={isSubmitted}
          className="space-y-2"
        >
          {options.map((option, index) => {
            const isSelected = selectedValue === option;
            const isCorrectOption = option === correctAnswer;

            return (
              <Label
                key={index}
                className={`flex items-center gap-3 p-3 rounded-md border transition-colors ${
                  isSubmitted && isCorrectOption ? 'border-green-500 bg-green-500/10' : ''
                } ${
                  isSubmitted && isSelected && !isCorrectOption ? 'border-red-500 bg-red-500/10' : ''
                } ${!isSubmitted ? 'hover:bg-accent/10 cursor-pointer' : 'cursor-default'}`}
              >
                <RadioGroupItem value={option} id={`q-option-${index}`} />
                <span>{option}</span>
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
            <div
              className={`flex items-center justify-center gap-2 p-3 rounded-md text-sm ${
                isCorrect ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
              }`}
            >
              {isCorrect ? <CheckCircle2 /> : <XCircle />}
              {isCorrect ? 'Correct!' : `Incorrect. The correct answer is: ${correctAnswer}`}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
