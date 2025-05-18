import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Activity, BarChart2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: number | string;
  change: string;
  trend: "up" | "down";
  period: string;
  icon: "users" | "active" | "mood" | "journal";
};

export default function StatCard({ title, value, change, trend, period, icon }: StatCardProps) {
  // Map icons to their components
  const icons = {
    users: <Users className="h-5 w-5 text-blue-600" />,
    active: <Activity className="h-5 w-5 text-green-600" />,
    mood: <BarChart2 className="h-5 w-5 text-purple-600" />,
    journal: <BookOpen className="h-5 w-5 text-orange-600" />
  };
  
  // Get the appropriate icon
  const iconComponent = icons[icon];
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-neutral-500">{title}</span>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            {iconComponent}
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-2xl font-bold">{value}</div>
          <div className="flex items-center text-sm">
            <span 
              className={cn(
                "flex items-center",
                trend === "up" ? "text-green-600" : "text-red-600"
              )}
            >
              {trend === "up" ? (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                  className="h-4 w-4 mr-1"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" 
                    clipRule="evenodd" 
                  />
                </svg>
              ) : (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                  className="h-4 w-4 mr-1"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" 
                    clipRule="evenodd" 
                  />
                </svg>
              )}
              {change}
            </span>
            <span className="text-neutral-500 ml-2">{period}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}