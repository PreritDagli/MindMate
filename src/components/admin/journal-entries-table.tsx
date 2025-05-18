import React from "react";
import { JournalEntry } from "@shared/schema";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, Calendar, User, ExternalLink } from "lucide-react";

type JournalEntriesTableProps = {
  entries: JournalEntry[];
  className?: string;
  onViewEntry: (entryId: number) => void;
};

export default function JournalEntriesTable({ entries, className = "", onViewEntry }: JournalEntriesTableProps) {
  // Format date for display
  const formatDate = (date: string | Date) => {
    try {
      return format(new Date(date), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };
  
  // Get mood badge color
  const getMoodColor = (mood?: string | null) => {
    const moodColors: Record<string, string> = {
      happy: "bg-green-100 text-green-800 border-green-200",
      calm: "bg-blue-100 text-blue-800 border-blue-200",
      sad: "bg-purple-100 text-purple-800 border-purple-200",
      angry: "bg-red-100 text-red-800 border-red-200",
      anxious: "bg-yellow-100 text-yellow-800 border-yellow-200",
      neutral: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return mood ? moodColors[mood.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200" : "";
  };
  
  // Truncate content to a certain length
  const truncateContent = (content: string, maxLength = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      {entries.length === 0 ? (
        <div className="text-center py-6 text-neutral-500">
          No journal entries found
        </div>
      ) : (
        entries.map((entry) => (
          <div key={entry.id} className="border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center flex-wrap gap-2">
                  <h3 className="font-medium text-base">{entry.title}</h3>
                  {entry.mood && (
                    <Badge className={`${getMoodColor(entry.mood)}`}>
                      {entry.mood}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(entry.createdAt)}</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>User ID: {entry.userId}</span>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 mt-2 line-clamp-2">
                  {truncateContent(entry.content)}
                </p>
              </div>
              <Button
                variant="ghost" 
                size="sm"
                className="shrink-0 h-8 text-xs"
                onClick={() => onViewEntry(entry.id)}
              >
                View <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}