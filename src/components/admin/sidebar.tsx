import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  BarChart2, 
  Settings, 
  Bell, 
  HelpCircle, 
  LogOut 
} from "lucide-react";

type SidebarProps = {
  isOpen: boolean;
  currentView: string;
  onNavigate: (view: string) => void;
};

export default function Sidebar({ isOpen, currentView, onNavigate }: SidebarProps) {
  const { logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const sidebarItems = [
    { 
      name: "Dashboard", 
      view: "dashboard", 
      icon: LayoutDashboard,
    },
    { 
      name: "Users", 
      view: "users", 
      icon: Users,
    },
    { 
      name: "Content", 
      view: "content", 
      icon: BookOpen,
    },
    { 
      name: "Analytics", 
      view: "analytics", 
      icon: BarChart2,
    },
    { 
      name: "Settings", 
      view: "settings", 
      icon: Settings,
    },
    { 
      name: "Notifications", 
      view: "notifications", 
      icon: Bell,
    },
  ];
  
  return (
    <aside 
      className={cn(
        "fixed z-20 inset-y-0 left-0 bg-white border-r transition-transform duration-300 ease-in-out md:translate-x-0 w-64 md:relative",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="h-16 flex items-center px-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="bg-primary h-8 w-8 rounded-md flex items-center justify-center text-white font-semibold">
            MM
          </div>
          <h2 className="text-lg font-semibold">MindMate</h2>
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="py-4 space-y-1 px-3">
          {sidebarItems.map((item) => (
            <Button
              key={item.name}
              variant={currentView === item.view ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "w-full justify-start text-base",
                currentView === item.view ? "bg-primary/10 hover:bg-primary/15" : ""
              )}
              onClick={() => onNavigate(item.view)}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Button>
          ))}
          
          <Separator className="my-6" />
          
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-base"
              onClick={() => onNavigate("help")}
            >
              <HelpCircle className="h-5 w-5 mr-3" />
              Help & Support
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-base text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}