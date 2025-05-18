import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Loader2 } from "lucide-react";
import Sidebar from "@/components/admin/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import MoodChart from "@/components/admin/mood-chart";
import MoodDistribution from "@/components/admin/mood-distribution";

// Import Recharts components
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Mock data for demonstration (will be replaced with actual data)
const weeklyData = Array.from({ length: 7 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - 6 + i);
  return {
    date: date.toLocaleDateString('en-US', { weekday: 'short' }),
    happy: Math.floor(Math.random() * 30) + 20,
    sad: Math.floor(Math.random() * 20) + 5,
    calm: Math.floor(Math.random() * 25) + 10,
    anxious: Math.floor(Math.random() * 15) + 5,
  };
});

const monthlyData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - 29 + i);
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    happy: Math.floor(Math.random() * 30) + 20,
    sad: Math.floor(Math.random() * 20) + 5,
    calm: Math.floor(Math.random() * 25) + 10,
    anxious: Math.floor(Math.random() * 15) + 5,
  };
});

export default function AdminMoodAnalytics() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("week");
  
  // Fetch mood analytics
  const { data: moodAnalytics, isLoading: isMoodAnalyticsLoading } = useQuery({
    queryKey: ["/api/admin/mood-analytics"],
  });
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  if (isMoodAnalyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading mood analytics...</span>
      </div>
    );
  }
  
  const dataToUse = timeRange === "week" ? weeklyData : monthlyData;
  
  return (
    <>
      <Helmet>
        <title>Mood Analytics | MindMate Admin</title>
      </Helmet>
      
      <div className="flex h-screen overflow-hidden">
        {/* Mobile menu button */}
        <div className="lg:hidden absolute top-4 left-4 z-50">
          <button 
            className="text-neutral-500 hover:text-primary focus:outline-none"
            onClick={toggleSidebar}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {/* Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          currentView="mood-analytics" 
          onNavigate={() => setIsSidebarOpen(false)}
        />
        
        {/* Main content */}
        <div className="flex flex-col flex-1 w-0 overflow-hidden">
          {/* Top navbar */}
          <div className="bg-white border-b border-neutral-200 flex items-center justify-between p-4 lg:px-6">
            <div className="flex flex-1 items-center">
              <span className="lg:hidden"></span>
              <h1 className="text-xl font-semibold ml-12 lg:ml-0">Mood Analytics</h1>
            </div>
          </div>
          
          {/* Main content area */}
          <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 lg:p-6">
            {/* Tabs for time periods */}
            <Tabs defaultValue={timeRange} onValueChange={setTimeRange} className="mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="week">Weekly</TabsTrigger>
                <TabsTrigger value="month">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Overview cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Mood Entries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{moodAnalytics?.distribution.reduce((sum, item) => sum + item.count, 0) || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Over all time
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Avg Entries Per User</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">7.2</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Per month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Most Common Mood</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">Happy</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    30% of all entries
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Mood Volatility</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">Medium</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Average 2.3 changes/week
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Main charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Mood Trends</CardTitle>
                  <CardDescription>
                    Distribution of moods over {timeRange === "week" ? "past week" : "past month"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={dataToUse}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="happy" stroke="#10b981" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="sad" stroke="#ef4444" />
                        <Line type="monotone" dataKey="calm" stroke="#0ea5e9" />
                        <Line type="monotone" dataKey="anxious" stroke="#6366f1" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Mood Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of recorded moods
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <MoodDistribution 
                    data={moodAnalytics?.distribution || []} 
                    showLegend 
                    className="h-80" 
                  />
                </CardContent>
              </Card>
            </div>
            
            {/* Weekly/Monthly comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mood Entry Frequency</CardTitle>
                  <CardDescription>
                    Number of mood entries per day
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={dataToUse}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="happy" stackId="a" fill="#10b981" />
                        <Bar dataKey="sad" stackId="a" fill="#ef4444" />
                        <Bar dataKey="calm" stackId="a" fill="#0ea5e9" />
                        <Bar dataKey="anxious" stackId="a" fill="#6366f1" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Mood By Time of Day</CardTitle>
                  <CardDescription>
                    When users are logging their emotions
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-80 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                      <div className="bg-neutral-100 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-primary">Morning</div>
                        <div className="text-sm text-neutral-500">32%</div>
                        <div className="mt-2 text-neutral-700">Predominantly Calm</div>
                      </div>
                      
                      <div className="bg-neutral-100 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-primary">Afternoon</div>
                        <div className="text-sm text-neutral-500">28%</div>
                        <div className="mt-2 text-neutral-700">Predominantly Happy</div>
                      </div>
                      
                      <div className="bg-neutral-100 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-primary">Evening</div>
                        <div className="text-sm text-neutral-500">25%</div>
                        <div className="mt-2 text-neutral-700">Mixed Emotions</div>
                      </div>
                      
                      <div className="bg-neutral-100 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-primary">Night</div>
                        <div className="text-sm text-neutral-500">15%</div>
                        <div className="mt-2 text-neutral-700">Predominantly Anxious</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
