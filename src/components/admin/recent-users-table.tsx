import React from "react";
import { User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { UserCircle, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type RecentUsersTableProps = {
  users: User[];
  className?: string;
  onViewUser: (userId: number) => void;
};

export default function RecentUsersTable({ users, className = "", onViewUser }: RecentUsersTableProps) {
  // Format relative time (e.g., "2 hours ago")
  const formatRelativeTime = (date: Date | string | null) => {
    if (!date) return "Never";
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return "Invalid date";
    }
  };
  
  // Get user initials for avatar
  const getInitials = (user: User) => {
    if (user.fullName) {
      return user.fullName
        .split(" ")
        .map(part => part[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    return user.username.substring(0, 2).toUpperCase();
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      {users.map((user) => (
        <div key={user.id} className="flex items-start space-x-3 py-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.profileImage || ""} alt={user.username} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(user)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-1">
            <div className="flex items-center">
              <p className="text-sm font-medium">{user.fullName || user.username}</p>
              {user.isAdmin && (
                <Badge variant="outline" className="ml-2 h-5 bg-primary/10 text-primary">
                  <Shield className="h-3 w-3 mr-1" /> Admin
                </Badge>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground">
              <span>@{user.username}</span>
              <span className="hidden sm:inline">•</span>
              <span>Last active: {formatRelativeTime(user.lastActive)}</span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2"
            onClick={() => onViewUser(user.id)}
          >
            View
          </Button>
        </div>
      ))}
    </div>
  );
}