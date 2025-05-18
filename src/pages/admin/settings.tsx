import { useState } from "react";
import { Helmet } from "react-helmet";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/admin/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminSettings() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Profile settings
  const [profileSettings, setProfileSettings] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // App settings
  const [appSettings, setAppSettings] = useState({
    enableNotifications: true,
    darkMode: false,
    dataBackup: true,
    analyticsTracking: true,
    autoLogout: false
  });
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleToggleChange = (key: string, value: boolean) => {
    setAppSettings(prev => ({ ...prev, [key]: value }));
  };
  
  const handleSaveProfile = () => {
    setIsLoading(true);
    
    // Validate password match if attempting to change password
    if (profileSettings.newPassword && 
        profileSettings.newPassword !== profileSettings.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "New password and confirmation password must match.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    // Simulate saving profile after validation
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });
    }, 1000);
  };
  
  const handleSaveAppSettings = () => {
    setIsLoading(true);
    
    // Simulate saving app settings
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Settings saved",
        description: "Your application settings have been updated."
      });
    }, 1000);
  };
  
  return (
    <>
      <Helmet>
        <title>Settings | MindMate Admin</title>
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
          currentView="settings" 
          onNavigate={() => setIsSidebarOpen(false)}
        />
        
        {/* Main content */}
        <div className="flex flex-col flex-1 w-0 overflow-hidden">
          {/* Top navbar */}
          <div className="bg-white border-b border-neutral-200 flex items-center justify-between p-4 lg:px-6">
            <div className="flex flex-1 items-center">
              <span className="lg:hidden"></span>
              <h1 className="text-xl font-semibold ml-12 lg:ml-0">Settings</h1>
            </div>
          </div>
          
          {/* Main content area */}
          <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 lg:p-6">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList>
                <TabsTrigger value="profile">Profile Settings</TabsTrigger>
                <TabsTrigger value="app">App Settings</TabsTrigger>
                <TabsTrigger value="security">Security & Privacy</TabsTrigger>
              </TabsList>
              
              {/* Profile Settings */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>
                      Manage your personal information and account details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                      <div className="space-y-2 flex-1">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input 
                          id="fullName" 
                          name="fullName"
                          value={profileSettings.fullName} 
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="space-y-2 flex-1">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          name="email"
                          type="email" 
                          value={profileSettings.email} 
                          onChange={handleProfileChange}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input 
                        id="currentPassword" 
                        name="currentPassword"
                        type="password" 
                        value={profileSettings.currentPassword} 
                        onChange={handleProfileChange}
                      />
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                      <div className="space-y-2 flex-1">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input 
                          id="newPassword" 
                          name="newPassword"
                          type="password" 
                          value={profileSettings.newPassword} 
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="space-y-2 flex-1">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input 
                          id="confirmPassword" 
                          name="confirmPassword"
                          type="password" 
                          value={profileSettings.confirmPassword} 
                          onChange={handleProfileChange}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="ml-auto"
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* App Settings */}
              <TabsContent value="app">
                <Card>
                  <CardHeader>
                    <CardTitle>Application Settings</CardTitle>
                    <CardDescription>
                      Configure how the MindMate Admin dashboard works
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifications">Notifications</Label>
                        <p className="text-sm text-neutral-500">
                          Receive alerts about new user activities and important events
                        </p>
                      </div>
                      <Switch
                        id="notifications"
                        checked={appSettings.enableNotifications}
                        onCheckedChange={(checked) => handleToggleChange('enableNotifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="darkMode">Dark Mode</Label>
                        <p className="text-sm text-neutral-500">
                          Switch between light and dark theme
                        </p>
                      </div>
                      <Switch
                        id="darkMode"
                        checked={appSettings.darkMode}
                        onCheckedChange={(checked) => handleToggleChange('darkMode', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="dataBackup">Automatic Data Backup</Label>
                        <p className="text-sm text-neutral-500">
                          Regularly backup user data to secure storage
                        </p>
                      </div>
                      <Switch
                        id="dataBackup"
                        checked={appSettings.dataBackup}
                        onCheckedChange={(checked) => handleToggleChange('dataBackup', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="analyticsTracking">Analytics Tracking</Label>
                        <p className="text-sm text-neutral-500">
                          Collect usage statistics to improve the app
                        </p>
                      </div>
                      <Switch
                        id="analyticsTracking"
                        checked={appSettings.analyticsTracking}
                        onCheckedChange={(checked) => handleToggleChange('analyticsTracking', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="autoLogout">Auto Logout</Label>
                        <p className="text-sm text-neutral-500">
                          Automatically log out after 30 minutes of inactivity
                        </p>
                      </div>
                      <Switch
                        id="autoLogout"
                        checked={appSettings.autoLogout}
                        onCheckedChange={(checked) => handleToggleChange('autoLogout', checked)}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="ml-auto"
                      onClick={handleSaveAppSettings}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Settings
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Security & Privacy */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security & Privacy</CardTitle>
                    <CardDescription>
                      Manage security settings and data privacy options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-neutral-500">
                        Add an extra layer of security to your account by enabling two-factor authentication.
                      </p>
                      <Button variant="outline">Enable 2FA</Button>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Session Management</h3>
                      <p className="text-sm text-neutral-500">
                        View and manage all your active sessions across devices.
                      </p>
                      <Button variant="outline">Manage Sessions</Button>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Data Privacy</h3>
                      <p className="text-sm text-neutral-500">
                        Control how your data is used and download a copy of your personal information.
                      </p>
                      <div className="flex space-x-2">
                        <Button variant="outline">Privacy Settings</Button>
                        <Button variant="outline">Export Personal Data</Button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
                      <p className="text-sm text-neutral-500">
                        Permanently delete your account and all associated data.
                      </p>
                      <Button variant="destructive">Delete Account</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </>
  );
}
