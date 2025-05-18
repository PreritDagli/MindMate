import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminMoodAnalytics from "@/pages/admin/mood-analytics";
import AdminJournalEntries from "@/pages/admin/journal-entries";
import AdminSettings from "@/pages/admin/settings";
import UserHome from "@/pages/user-home";
import UserMoodTracker from "@/pages/user/mood-tracker";
import UserJournal from "@/pages/user/journal";
import UserMeditation from "@/pages/user/meditation";
import UserGoals from "@/pages/user/goals";
import UserAnalytics from "@/pages/user/analytics";
import UserQuotes from "@/pages/user/quotes";
import UserSettings from "@/pages/user/settings";
import UserQuiz from "@/pages/user/quiz";
import AuthPage from "@/pages/auth-page";
import { useAuth } from "@/hooks/use-auth";

// Root redirector component to handle routing based on user role
function RootRedirector() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  if (user.isAdmin) {
    return <Redirect to="/admin" />;
  }
  
  return <Redirect to="/user" />;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      {/* Admin routes */}
      <ProtectedRoute path="/admin" component={AdminDashboard} adminOnly={true} />
      <ProtectedRoute path="/admin/users" component={AdminUsers} adminOnly={true} />
      <ProtectedRoute path="/admin/mood-analytics" component={AdminMoodAnalytics} adminOnly={true} />
      <ProtectedRoute path="/admin/journal-entries" component={AdminJournalEntries} adminOnly={true} />
      <ProtectedRoute path="/admin/settings" component={AdminSettings} adminOnly={true} />
      
      {/* Regular user routes */}
      <ProtectedRoute path="/user" component={UserHome} adminOnly={false} />
      <ProtectedRoute path="/user/mood-tracker" component={UserMoodTracker} adminOnly={false} />
      <ProtectedRoute path="/user/journal" component={UserJournal} adminOnly={false} />
      <ProtectedRoute path="/user/meditation" component={UserMeditation} adminOnly={false} />
      <ProtectedRoute path="/user/goals" component={UserGoals} adminOnly={false} />
      <ProtectedRoute path="/user/analytics" component={UserAnalytics} adminOnly={false} />
      <ProtectedRoute path="/user/quotes" component={UserQuotes} adminOnly={false} />
      <ProtectedRoute path="/user/settings" component={UserSettings} adminOnly={false} />
      <ProtectedRoute path="/user/quiz" component={UserQuiz} adminOnly={false} />
      
      {/* Root path redirects based on user role */}
      <Route path="/" component={RootRedirector} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
