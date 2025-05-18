import React from "react";
import { JournalEntry } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar, Clock, User, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

type JournalEntryModalProps = {
  entryId: number;
  isOpen: boolean;
  onClose: () => void;
};

export default function JournalEntryModal({ entryId, isOpen, onClose }: JournalEntryModalProps) {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  
  // Fetch journal entry data
  const { 
    data: entry,
    isLoading,
    error,
  } = useQuery<JournalEntry>({
    queryKey: ["/api/journal-entries", entryId],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: isOpen && !!entryId,
  });
  
  // Delete mutation
  const deleteEntryMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/journal-entries/${entryId}`);
    },
    onSuccess: () => {
      toast({
        title: "Journal entry deleted",
        description: "The journal entry has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete journal entry: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Format date for display
  const formatDate = (date: string | Date) => {
    try {
      return format(new Date(date), "MMMM d, yyyy 'at' h:mm a");
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
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(true);
  };
  
  // Handle actual deletion
  const handleDelete = () => {
    deleteEntryMutation.mutate();
    setDeleteDialogOpen(false);
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{entry?.title || "Journal Entry"}</DialogTitle>
            <DialogDescription>
              View the full journal entry details
            </DialogDescription>
          </DialogHeader>
          
          {isLoading ? (
            <div className="py-8 flex items-center justify-center">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-500">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>Error loading journal entry: {(error as Error).message}</p>
            </div>
          ) : entry ? (
            <>
              <div className="flex flex-wrap gap-2 items-center mt-2">
                {entry.mood && (
                  <Badge className={`${getMoodColor(entry.mood)}`}>
                    {entry.mood}
                  </Badge>
                )}
                
                <div className="flex items-center gap-1 text-xs text-neutral-500">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(entry.createdAt)}</span>
                </div>
                
                <div className="flex items-center gap-1 text-xs text-neutral-500">
                  <User className="h-3 w-3" />
                  <span>User ID: {entry.userId}</span>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <ScrollArea className="flex-1 pr-4 -mr-4">
                <div className="whitespace-pre-wrap prose prose-sm max-w-none">
                  {entry.content}
                </div>
                
                {entry.tags && entry.tags.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="bg-neutral-50">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </ScrollArea>
              
              <DialogFooter className="mt-6 sm:justify-between gap-2">
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteConfirm}
                  disabled={deleteEntryMutation.isPending}
                >
                  Delete Entry
                </Button>
                <Button onClick={onClose}>Close</Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-8 text-center text-neutral-500">
              No entry data found
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the journal entry and remove
              it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}