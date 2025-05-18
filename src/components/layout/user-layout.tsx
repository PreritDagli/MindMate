import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Home, 
  SmilePlus, 
  BookOpen, 
  Wind, 
  Target, 
  BarChart, 
  Quote, 
  Settings, 
  Menu, 
  LogOut, 
  X,
  Lightbulb,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logoPath from "@assets/logo.png";

type UserLayoutProps = {
  children: React.ReactNode;
  title: string;
  description?: string;
};

export default function UserLayout({ children, title, description }: UserLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = window.innerWidth < 768;
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const navItems = [
    { path: "/user", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
    { path: "/user/mood-tracker", label: "Mood Tracker", icon: <SmilePlus className="h-5 w-5" /> },
    { path: "/user/journal", label: "Journal", icon: <BookOpen className="h-5 w-5" /> },
    { path: "/user/meditation", label: "Meditation", icon: <Wind className="h-5 w-5" /> },
    { path: "/user/goals", label: "Goals", icon: <Target className="h-5 w-5" /> },
    { path: "/user/analytics", label: "Analytics", icon: <BarChart className="h-5 w-5" /> },
    { path: "/user/quotes", label: "Daily Quotes", icon: <Quote className="h-5 w-5" /> },
    { path: "/user/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ];
  
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {isMobile && (
                <button
                  className="mr-2 text-neutral-500 hover:text-primary focus:outline-none"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  <Menu className="h-6 w-6" />
                </button>
              )}
              <Link href="/user">
                <div className="flex items-center cursor-pointer">
                  <img src={logoPath} alt="MindMate Logo" className="h-10 mr-2" />
                  <h1 className="text-xl font-semibold text-primary">MindMate</h1>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-neutral-500 hover:text-primary"
              >
                <Bell className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-neutral-500 hover:text-primary"
              >
                <Lightbulb className="h-5 w-5" />
              </Button>
              {!isMobile && (
                <div className="text-sm font-medium text-neutral-700">
                  Hi, {user?.fullName?.split(" ")[0] || user?.username}
                </div>
              )}
              <Button
                variant="ghost"
                size={isMobile ? "icon" : "sm"}
                onClick={handleLogout}
                className="text-neutral-700"
              >
                <LogOut className="h-4 w-4" />
                {!isMobile && <span className="ml-2">Logout</span>}
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* Sidebar - Desktop */}
        {!isMobile && (
          <aside className="w-64 bg-white border-r border-neutral-200 pt-6 pb-8 min-h-[calc(100vh-4rem)] flex-shrink-0">
            <nav className="space-y-1 px-4">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <div
                    className={`flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                      location === item.path
                        ? "bg-primary/10 text-primary"
                        : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    {React.cloneElement(item.icon, {
                      className: `${item.icon.props.className} mr-3 flex-shrink-0`,
                    })}
                    {item.label}
                  </div>
                </Link>
              ))}
            </nav>
          </aside>
        )}
        
        {/* Mobile Sidebar - Overlay */}
        {isMobile && isSidebarOpen && (
          <div className="fixed inset-0 z-40">
            <div 
              className="fixed inset-0 bg-black/20" 
              onClick={() => setIsSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 transition-transform transform-gpu">
              <div className="flex items-center justify-between px-4 h-16 border-b border-neutral-200">
                <div className="flex items-center">
                  <img src={logoPath} alt="MindMate Logo" className="h-8 mr-2" />
                  <h2 className="text-lg font-semibold text-primary">MindMate</h2>
                </div>
                <button
                  className="text-neutral-500 hover:text-neutral-700 focus:outline-none"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="space-y-1 px-3 py-4">
                {navItems.map((item) => (
                  <Link 
                    key={item.path} 
                    href={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <div
                      className={`flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                        location === item.path
                          ? "bg-primary/10 text-primary"
                          : "text-neutral-600 hover:bg-neutral-100"
                      }`}
                    >
                      {React.cloneElement(item.icon, {
                        className: `${item.icon.props.className} mr-3 flex-shrink-0`,
                      })}
                      {item.label}
                    </div>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}
        
        {/* Main content */}
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-800">{title}</h2>
              {description && (
                <p className="mt-1 text-neutral-500">{description}</p>
              )}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}