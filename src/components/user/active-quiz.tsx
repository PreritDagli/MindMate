import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import {
  Button
} from "@/components/ui/button";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Quiz, QuizResult } from '@shared/schema';

interface QuestionOption {
  id: number;
  text: string;
  value?: number;
  insight?: string;
}

interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
}

interface Answer {
  questionId: number;
  optionId: number;
}

interface ActiveQuizProps {
  quiz: Quiz;
  onComplete: (result: QuizResult) => void;
  onClose: () => void;
}

export default function ActiveQuiz({ quiz, onComplete, onClose }: ActiveQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const questions = quiz.questions as Question[];
  const currentQuestion = questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  
  const progressPercentage = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);
  
  const submitQuizMutation = useMutation({
    mutationFn: async () => {
      setSubmitting(true);
      const response = await apiRequest('POST', '/api/quiz-results', {
        quizId: quiz.id,
        answers
      });
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/quiz-results'] });
      onComplete(data);
      setSubmitting(false);
    },
    onError: (error) => {
      console.error('Error submitting quiz:', error);
      setSubmitting(false);
    }
  });
  
  const handleOptionSelect = (optionId: number) => {
    setCurrentAnswer(optionId);
  };
  
  const handleNext = () => {
    if (currentAnswer === null) return;
    
    // Save the answer
    const newAnswers = [...answers];
    const existingAnswerIndex = newAnswers.findIndex(a => a.questionId === currentQuestion.id);
    
    if (existingAnswerIndex >= 0) {
      newAnswers[existingAnswerIndex].optionId = currentAnswer;
    } else {
      newAnswers.push({
        questionId: currentQuestion.id,
        optionId: currentAnswer
      });
    }
    
    setAnswers(newAnswers);
    
    // Move to the next question or submit if it's the last one
    if (isLastQuestion) {
      submitQuizMutation.mutate();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      
      // Pre-select the answer if the user has already answered this question
      const nextQuestion = questions[currentQuestionIndex + 1];
      const existingAnswer = newAnswers.find(a => a.questionId === nextQuestion.id);
      setCurrentAnswer(existingAnswer ? existingAnswer.optionId : null);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      
      // Pre-select the answer if the user has already answered this question
      const prevQuestion = questions[currentQuestionIndex - 1];
      const existingAnswer = answers.find(a => a.questionId === prevQuestion.id);
      setCurrentAnswer(existingAnswer ? existingAnswer.optionId : null);
    }
  };
  
  // Pre-populate the current answer if user has already answered this question
  useState(() => {
    const existingAnswer = answers.find(a => a.questionId === currentQuestion.id);
    if (existingAnswer) {
      setCurrentAnswer(existingAnswer.optionId);
    }
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{quiz.title}</DialogTitle>
          <DialogDescription className="flex items-center pt-2">
            Question {currentQuestionIndex + 1} of {questions.length}
            
            <div className="w-full bg-muted rounded-full h-2 ml-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Card className="border-0 shadow-none">
            <CardContent className="pt-0 px-0">
              <h3 className="text-lg font-medium mb-4">{currentQuestion.text}</h3>
              
              <RadioGroup
                value={currentAnswer?.toString()}
                onValueChange={(value) => handleOptionSelect(parseInt(value))}
                className="space-y-3"
              >
                {currentQuestion.options.map((option) => (
                  <div 
                    key={option.id} 
                    className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      currentAnswer === option.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-input hover:bg-muted/50'
                    }`}
                    onClick={() => handleOptionSelect(option.id)}
                  >
                    <RadioGroupItem
                      value={option.id.toString()}
                      id={`option-${option.id}`}
                      className="mr-2"
                    />
                    <Label 
                      htmlFor={`option-${option.id}`}
                      className="w-full cursor-pointer font-normal"
                    >
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
        
        <DialogFooter className="flex flex-row justify-between items-center">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={isFirstQuestion}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <Button 
            onClick={handleNext} 
            disabled={currentAnswer === null || submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : isLastQuestion ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Complete
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}