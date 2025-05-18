import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User, JournalEntry, MoodEntry } from "@shared/schema";
import { format } from "date-fns";
import { useLocation, Link } from "wouter";

import UserDetailsModal from "@/components/admin/user-details-modal";
import JournalEntryModal from "@/components/admin/journal-entry-modal";
import RecentUsersTable from "@/components/admin/recent-users-table";
import ActivityChart from "@/components/admin/activity-chart";
import MoodChart from "@/components/admin/mood-chart";
import MoodDistribution from "@/components/admin/mood-distribution";
import JournalEntriesTable from "@/components/admin/journal-entries-table";
import StatCard from "@/components/admin/stat-card";
import Sidebar from "@/components/admin/sidebar";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  BarChart, 
  LineChart, 
  PieChart,
  CircleDot
} from "lucide-react";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedJournalEntryId, setSelectedJournalEntryId] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [, setLocation] = useLocation();
  
  // Parse URL query parameters to set the current view on initial load
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const viewParam = searchParams.get('view');
    if (viewParam) {
      setCurrentView(viewParam);
    } else {
      setCurrentView("dashboard");
    }
  }, []);
  
  // Handle navigation from sidebar
  const handleNavigate = (view: string) => {
    setCurrentView(view);
    if (view === "dashboard") {
      setLocation("/admin");
    } else {
      setLocation(`/admin?view=${view}`);
    }
    setSidebarOpen(false);
  };
  
  // Admin stats query
  const { 
    data: adminStats,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/stats');
      return await res.json();
    }
  });
  
  // Users query
  const { 
    data: users,
    isLoading: usersLoading
  } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/users');
      return await res.json();
    }
  });
  
  // Journal entries query
  const { 
    data: journalEntries,
    isLoading: journalLoading
  } = useQuery<JournalEntry[]>({
    queryKey: ['/api/admin/journal-entries'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/journal-entries');
      return await res.json();
    }
  });
  
  // Mood analytics query
  const { 
    data: moodAnalytics,
    isLoading: moodAnalyticsLoading
  } = useQuery({
    queryKey: ['/api/admin/mood-analytics'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/mood-analytics');
      return await res.json();
    }
  });
  
  // User activity query
  const { 
    data: userActivity,
    isLoading: activityLoading
  } = useQuery({
    queryKey: ['/api/admin/user-activity'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/user-activity');
      return await res.json();
    }
  });
  
  const handleViewUser = (userId: number) => {
    setSelectedUserId(userId);
  };
  
  const handleViewJournalEntry = (entryId: number) => {
    setSelectedJournalEntryId(entryId);
  };
  
  const isLoading = statsLoading || usersLoading || journalLoading || moodAnalyticsLoading || activityLoading;
  
  // Placeholder data for mock visualization
  const mockMoodData = [
    { date: '2025-04-01', value: 4, mood: 'happy' },
    { date: '2025-04-02', value: 3, mood: 'calm' },
    { date: '2025-04-03', value: 2, mood: 'neutral' },
    { date: '2025-04-04', value: 1, mood: 'sad' },
    { date: '2025-04-05', value: 2, mood: 'neutral' },
    { date: '2025-04-06', value: 3, mood: 'calm' },
    { date: '2025-04-07', value: 4, mood: 'happy' },
    { date: '2025-04-08', value: 3, mood: 'calm' },
    { date: '2025-04-09', value: 4, mood: 'happy' },
    { date: '2025-04-10', value: 2, mood: 'neutral' },
    { date: '2025-04-11', value: 1, mood: 'sad' },
    { date: '2025-04-12', value: 2, mood: 'neutral' },
    { date: '2025-04-13', value: 3, mood: 'calm' },
    { date: '2025-04-14', value: 4, mood: 'happy' },
  ];
  
  const mockMoodDistribution = [
    { mood: 'happy', count: 40, percentage: 40 },
    { mood: 'calm', count: 30, percentage: 30 },
    { mood: 'neutral', count: 20, percentage: 20 },
    { mood: 'sad', count: 10, percentage: 10 }
  ];
  
  const mockActivityData = [
    { date: '2025-04-08', activeUsers: 24 },
    { date: '2025-04-09', activeUsers: 27 },
    { date: '2025-04-10', activeUsers: 32 },
    { date: '2025-04-11', activeUsers: 29 },
    { date: '2025-04-12', activeUsers: 35 },
    { date: '2025-04-13', activeUsers: 42 },
    { date: '2025-04-14', activeUsers: 38 },
  ];
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar Component */}
      <Sidebar 
        isOpen={sidebarOpen} 
        currentView={currentView}
        onNavigate={handleNavigate}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-x-hidden">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-white border-b h-16 flex items-center px-4 md:px-6">
          <Button 
            variant="ghost" 
            size="icon"
            className="mr-4 md:hidden"
            onClick={toggleSidebar}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </Button>
          
          <div className="flex items-center justify-between w-full">
            <h1 className="text-lg font-semibold">MindMate Admin</h1>
            
            <div className="flex items-center gap-4">
              <Input 
                type="search" 
                placeholder="Search..."
                className="w-52 lg:w-64 h-9 hidden md:block"
              />
              
              <Avatar className="h-9 w-9">
                <AvatarImage src="" alt="Admin" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  A
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        
        {/* Main Dashboard Content */}
        <main className="p-4 md:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
              <p className="text-muted-foreground">
                Monitor user activity and manage content.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="today">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-muted-foreground">Loading dashboard data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Overview Tabs */}
              <Tabs
                value={currentView === "users" ? "users" : 
                       currentView === "content" ? "content" : 
                       currentView === "analytics" ? "analytics" :
                       currentView === "settings" ? "settings" :
                       currentView === "notifications" ? "notifications" :
                       currentView === "help" ? "help" : "overview"}
                className="space-y-4"
                onValueChange={(value) => {
                  const newView = value === "overview" ? "dashboard" : value;
                  handleNavigate(newView);
                }}>
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="help">Help</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                      title="Total Users"
                      value={adminStats?.totalUsers || 0}
                      change={adminStats?.userChange || "0%"}
                      trend={adminStats?.userChange?.startsWith("-") ? "down" : "up"}
                      period="from last month"
                      icon="users"
                    />
                    <StatCard
                      title="Active Users"
                      value={adminStats?.activeUsers || 0}
                      change={adminStats?.activeChange || "0%"}
                      trend={adminStats?.activeChange?.startsWith("-") ? "down" : "up"}
                      period="from last month"
                      icon="active"
                    />
                    <StatCard
                      title="Mood Entries"
                      value={adminStats?.moodEntries || 0}
                      change={adminStats?.moodChange || "0%"}
                      trend={adminStats?.moodChange?.startsWith("-") ? "down" : "up"}
                      period="from last month"
                      icon="mood"
                    />
                    <StatCard
                      title="Journal Entries"
                      value={adminStats?.journalEntries || 0}
                      change={adminStats?.journalChange || "0%"}
                      trend={adminStats?.journalChange?.startsWith("-") ? "down" : "up"}
                      period="from last month"
                      icon="journal"
                    />
                  </div>
                  
                  {/* Charts Row */}
                  <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>User Activity</CardTitle>
                        <CardDescription>
                          Daily active users over the past week
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ActivityChart data={userActivity?.daily || mockActivityData} />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Mood Trends</CardTitle>
                        <CardDescription>
                          Average user mood scores over time
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <MoodChart data={moodAnalytics?.trends || mockMoodData} />
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Second Row - Users & Content */}
                  <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle>Recent Users</CardTitle>
                        <CardDescription>
                          Latest user registrations and activity
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <RecentUsersTable 
                          users={users?.slice(0, 5) || []} 
                          onViewUser={handleViewUser}
                        />
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleNavigate("users")}
                        >
                          View All Users
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Mood Distribution</CardTitle>
                        <CardDescription>
                          User mood breakdown
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <MoodDistribution data={moodAnalytics?.distribution || mockMoodDistribution} />
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Journal Entries Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Journal Entries</CardTitle>
                      <CardDescription>
                        Latest journal entries from all users
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <JournalEntriesTable 
                        entries={journalEntries?.slice(0, 5) || []} 
                        onViewEntry={handleViewJournalEntry}
                      />
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleNavigate("content")}
                      >
                        View All Journal Entries
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="users" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>User Management</CardTitle>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="search" 
                            placeholder="Search users..."
                            className="w-64 h-9"
                          />
                          <Select defaultValue="all">
                            <SelectTrigger className="w-[130px]">
                              <SelectValue placeholder="Filter by..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Users</SelectItem>
                              <SelectItem value="admin">Admins</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <RecentUsersTable 
                        users={users || []} 
                        onViewUser={handleViewUser}
                      />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="text-sm text-muted-foreground">
                        Showing {users?.length || 0} users
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">Previous</Button>
                        <Button variant="outline" size="sm">Next</Button>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="content" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Journal Entries</CardTitle>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="search" 
                            placeholder="Search entries..."
                            className="w-64 h-9"
                          />
                          <Select defaultValue="all">
                            <SelectTrigger className="w-[130px]">
                              <SelectValue placeholder="Filter by..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Entries</SelectItem>
                              <SelectItem value="happy">Happy</SelectItem>
                              <SelectItem value="calm">Calm</SelectItem>
                              <SelectItem value="sad">Sad</SelectItem>
                              <SelectItem value="angry">Angry</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <JournalEntriesTable 
                        entries={journalEntries || []} 
                        onViewEntry={handleViewJournalEntry}
                      />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="text-sm text-muted-foreground">
                        Showing {journalEntries?.length || 0} entries
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">Previous</Button>
                        <Button variant="outline" size="sm">Next</Button>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="analytics" className="space-y-6">
                  <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Mood Analytics</CardTitle>
                        <CardDescription>
                          Mood distribution and trends
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <MoodChart data={moodAnalytics?.trends || mockMoodData} />
                        </div>
                        <Separator className="my-4" />
                        <MoodDistribution 
                          data={moodAnalytics?.distribution || mockMoodDistribution} 
                          showLegend={false}
                        />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>User Activity</CardTitle>
                        <CardDescription>
                          User engagement metrics
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ActivityChart data={userActivity?.daily || mockActivityData} />
                        </div>
                        <Separator className="my-4" />
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="space-y-1">
                            <p className="text-2xl font-semibold">{adminStats?.totalUsers || 0}</p>
                            <p className="text-xs text-muted-foreground">Total Users</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-2xl font-semibold">{adminStats?.activeUsers || 0}</p>
                            <p className="text-xs text-muted-foreground">Active Users</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-2xl font-semibold">
                              {adminStats?.activeUsers && adminStats?.totalUsers 
                                ? Math.round((adminStats.activeUsers / adminStats.totalUsers) * 100) 
                                : 0}%
                            </p>
                            <p className="text-xs text-muted-foreground">Engagement Rate</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Global Settings</CardTitle>
                      <CardDescription>
                        Manage application-wide configurations and settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">General</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="app-name" className="text-base">Application Name</Label>
                              <p className="text-sm text-muted-foreground">Change the display name of the application</p>
                            </div>
                            <Input id="app-name" className="w-64" defaultValue="MindMate" />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="support-email" className="text-base">Support Email</Label>
                              <p className="text-sm text-muted-foreground">Primary contact for user support</p>
                            </div>
                            <Input id="support-email" className="w-64" defaultValue="support@mindmate.app" />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-base">Enable Dark Mode</Label>
                              <p className="text-sm text-muted-foreground">Allow users to toggle dark mode</p>
                            </div>
                            <Switch />
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Users & Security</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-base">Allow New Registrations</Label>
                              <p className="text-sm text-muted-foreground">Enable new user sign-ups</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-base">Require Email Verification</Label>
                              <p className="text-sm text-muted-foreground">Verify user emails before allowing access</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="session-duration" className="text-base">Session Duration (hours)</Label>
                              <p className="text-sm text-muted-foreground">Time before users are automatically logged out</p>
                            </div>
                            <Input id="session-duration" className="w-64" type="number" defaultValue="24" />
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Appearance</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-base">Primary Color</Label>
                              <p className="text-sm text-muted-foreground">Main branding color</p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 rounded-full bg-blue-500 border border-muted-foreground cursor-pointer"></div>
                              <div className="h-8 w-8 rounded-full bg-green-500 border border-transparent cursor-pointer"></div>
                              <div className="h-8 w-8 rounded-full bg-purple-500 border border-transparent cursor-pointer"></div>
                              <div className="h-8 w-8 rounded-full bg-amber-500 border border-transparent cursor-pointer"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="justify-end space-x-2">
                      <Button variant="outline">Reset to Defaults</Button>
                      <Button>Save Changes</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="notifications" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notifications Management</CardTitle>
                      <CardDescription>
                        Manage and send notifications to users
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="compose">
                        <TabsList className="w-full border-b mb-6">
                          <TabsTrigger value="compose" className="flex-1">Compose</TabsTrigger>
                          <TabsTrigger value="templates" className="flex-1">Templates</TabsTrigger>
                          <TabsTrigger value="scheduled" className="flex-1">Scheduled</TabsTrigger>
                          <TabsTrigger value="sent" className="flex-1">Sent</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="compose" className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="notification-type">Notification Type</Label>
                            <Select defaultValue="all">
                              <SelectTrigger>
                                <SelectValue placeholder="Select notification type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
                                <SelectItem value="inactive">Inactive Users</SelectItem>
                                <SelectItem value="new">New Users</SelectItem>
                                <SelectItem value="specific">Specific User</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="notification-title">Title</Label>
                            <Input id="notification-title" placeholder="Enter notification title" />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="notification-message">Message</Label>
                            <Input id="notification-message" placeholder="Enter notification message" />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="notification-priority">Priority</Label>
                            <Select defaultValue="normal">
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-1">
                            <input type="checkbox" id="schedule" className="rounded border-gray-300 text-primary focus:ring-primary" />
                            <Label htmlFor="schedule">Schedule for later</Label>
                          </div>
                          
                          <div className="flex justify-end space-x-2 mt-6">
                            <Button variant="outline">Cancel</Button>
                            <Button>Send Notification</Button>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="templates">
                          <div className="space-y-4">
                            <div className="border rounded-md p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold">Welcome Message</h4>
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm">Edit</Button>
                                  <Button variant="ghost" size="sm">Use</Button>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">Sent to new users upon registration</p>
                            </div>
                            
                            <div className="border rounded-md p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold">Daily Reminder</h4>
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm">Edit</Button>
                                  <Button variant="ghost" size="sm">Use</Button>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">Reminds users to check in daily</p>
                            </div>
                            
                            <div className="border rounded-md p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold">New Feature Announcement</h4>
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm">Edit</Button>
                                  <Button variant="ghost" size="sm">Use</Button>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">Announces new features and updates</p>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="scheduled">
                          <div className="rounded-md border">
                            <div className="p-4">
                              <div className="text-sm font-medium text-center text-muted-foreground">
                                No scheduled notifications found
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="sent">
                          <div className="rounded-md border">
                            <div className="p-4">
                              <div className="text-sm font-medium text-center text-muted-foreground">
                                No notification history found
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="help" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Help & Support</CardTitle>
                      <CardDescription>
                        Resources and documentation to help you use the platform
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4 space-y-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                              <path d="M12 17h.01" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold">FAQs</h3>
                          <p className="text-sm text-muted-foreground">
                            Find answers to the most common questions about the platform.
                          </p>
                          <Button variant="outline" className="w-full">View FAQs</Button>
                        </div>
                        
                        <div className="border rounded-lg p-4 space-y-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                              <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold">Documentation</h3>
                          <p className="text-sm text-muted-foreground">
                            Comprehensive guides and documentation for administrators.
                          </p>
                          <Button variant="outline" className="w-full">View Documentation</Button>
                        </div>
                        
                        <div className="border rounded-lg p-4 space-y-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold">Contact Support</h3>
                          <p className="text-sm text-muted-foreground">
                            Get in touch with our support team for personalized assistance.
                          </p>
                          <Button variant="outline" className="w-full">Contact Support</Button>
                        </div>
                        
                        <div className="border rounded-lg p-4 space-y-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold">Community Forum</h3>
                          <p className="text-sm text-muted-foreground">
                            Connect with other administrators to share tips and experiences.
                          </p>
                          <Button variant="outline" className="w-full">Visit Forum</Button>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Need Immediate Assistance?</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Our support team is available Monday through Friday, 9am to 5pm EST.
                        </p>
                        <div className="flex items-center space-x-4">
                          <Button className="w-full">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            Call Support
                          </Button>
                          <Button variant="outline" className="w-full">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                              <rect width="20" height="16" x="2" y="4" rx="2" />
                              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                            Email Support
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </main>
      </div>
      
      {/* User Details Modal */}
      {selectedUserId && (
        <UserDetailsModal
          userId={selectedUserId}
          isOpen={Boolean(selectedUserId)}
          onClose={() => setSelectedUserId(null)}
        />
      )}
      
      {/* Journal Entry Modal */}
      {selectedJournalEntryId && (
        <JournalEntryModal
          entryId={selectedJournalEntryId}
          isOpen={Boolean(selectedJournalEntryId)}
          onClose={() => setSelectedJournalEntryId(null)}
        />
      )}
    </div>
  );
}