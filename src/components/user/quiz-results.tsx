import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription, 
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Button
} from "@/components/ui/button";
import {
  BarChart,
  BarChartHorizontal,
  BadgeCheck,
  Lightbulb,
  Download,
  Share2
} from 'lucide-react';
import { Quiz, QuizResult, Insight } from '@shared/schema';
import { format } from 'date-fns';

interface QuizResultsProps {
  result: QuizResult;
  quiz: Quiz | null;
  onClose: () => void;
}

export default function QuizResults({ result, quiz, onClose }: QuizResultsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  const score = result.score;
  const insights = result.insights || [];
  
  // Function to get color based on score level
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'average': return 'text-yellow-500';
      case 'below average': return 'text-orange-500';
      case 'poor': return 'text-red-500';
      default: return 'text-primary';
    }
  };
  
  // Function to get background color based on score level
  const getLevelBgColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'excellent': return 'bg-green-100';
      case 'good': return 'bg-blue-100';
      case 'average': return 'bg-yellow-100';
      case 'below average': return 'bg-orange-100';
      case 'poor': return 'bg-red-100';
      default: return 'bg-primary/10';
    }
  };
  
  const handleShareResults = () => {
    // In a real implementation, this would generate a shareable link or open a share dialog
    alert('Share functionality would be implemented here');
  };
  
  const handleDownloadResults = () => {
    // In a real implementation, this would generate a PDF or other downloadable format
    alert('Download functionality would be implemented here');
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <BadgeCheck className="h-6 w-6 text-primary" />
            {quiz?.title || 'Assessment'} Results
          </DialogTitle>
          <DialogDescription className="pt-2">
            Completed on {format(new Date(result.completedAt || new Date()), 'PPP')}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Score</CardTitle>
                  <CardDescription>
                    Overall assessment of your emotional intelligence
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="relative h-40 w-40">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="h-full w-full" viewBox="0 0 100 100">
                            {/* Background circle */}
                            <circle
                              className="stroke-muted"
                              cx="50"
                              cy="50"
                              r="45"
                              fill="transparent"
                              strokeWidth="10"
                            />
                            {/* Progress circle */}
                            <circle
                              className="stroke-primary transition-all duration-300 ease-in-out"
                              cx="50"
                              cy="50"
                              r="45"
                              fill="transparent"
                              strokeWidth="10"
                              strokeDasharray={`${score.percentage * 2.83} 283`}
                              strokeDashoffset="0"
                              transform="rotate(-90 50 50)"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold">{score.percentage}%</span>
                            <span 
                              className={`text-sm font-medium ${getLevelColor(score.level)}`}
                            >
                              {score.level}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-sm text-muted-foreground">
                        <span>{score.total} out of {score.max} points</span>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <h4 className="text-sm font-medium mb-2">What this means:</h4>
                      <p className="text-sm text-muted-foreground">
                        {score.level === 'Excellent' && 
                          'You have outstanding emotional intelligence skills that serve you well in various situations. Keep nurturing these abilities.'
                        }
                        {score.level === 'Good' && 
                          'You have strong emotional intelligence with some areas that could benefit from further development.'
                        }
                        {score.level === 'Average' && 
                          'You have moderate emotional intelligence. The insights tab provides opportunities for growth.'
                        }
                        {score.level === 'Below Average' && 
                          'There are significant areas where developing your emotional intelligence could benefit you. See the insights tab.'
                        }
                        {score.level === 'Poor' && 
                          'Your emotional intelligence skills need significant development. The insights tab will help you start this journey.'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Strengths & Areas for Growth</CardTitle>
                  <CardDescription>
                    Based on your responses to the assessment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center">
                        <BadgeCheck className="h-4 w-4 mr-1 text-green-500" />
                        Strengths
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside pl-1">
                        {insights.length > 0 ? (
                          insights
                            .slice(0, 2)
                            .map((insight: Insight, index: number) => (
                              <li key={`strength-${index}`}>{insight.question}</li>
                            ))
                        ) : (
                          <>
                            <li>Self-awareness of emotions</li>
                            <li>Adapting communication style</li>
                          </>
                        )}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center">
                        <Lightbulb className="h-4 w-4 mr-1 text-amber-500" />
                        Areas for Growth
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside pl-1">
                        {insights.length > 0 ? (
                          insights
                            .slice(-2)
                            .map((insight: Insight, index: number) => (
                              <li key={`growth-${index}`}>{insight.question}</li>
                            ))
                        ) : (
                          <>
                            <li>Recognizing emotions in others</li>
                            <li>Managing emotions in stressful situations</li>
                          </>
                        )}
                      </ul>
                    </div>
                    
                    <div className="pt-3">
                      <h4 className="text-sm font-medium mb-2">Next Steps:</h4>
                      <p className="text-sm text-muted-foreground">
                        Check the Insights tab for personalized recommendations on how to develop 
                        your emotional intelligence further.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="insights" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personalized Insights</CardTitle>
                <CardDescription>
                  Actionable recommendations based on your responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {insights.length > 0 ? (
                  <div className="space-y-4">
                    {insights.map((insight: Insight, index: number) => (
                      <div 
                        key={`insight-${index}`}
                        className="p-3 rounded-lg border"
                      >
                        <h3 className="text-sm font-medium mb-1">{insight.question}</h3>
                        <p className="text-sm text-muted-foreground">{insight.insight}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-6">
                    <Lightbulb className="h-12 w-12 text-amber-500/20 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No specific insights available</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      This may happen if the quiz doesn't include detailed insights or if there 
                      was an issue processing your results. Please try taking the assessment again 
                      or contact support if the problem persists.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex flex-row justify-between sm:justify-between gap-2">
          <div className="flex flex-row gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDownloadResults}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleShareResults}
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}