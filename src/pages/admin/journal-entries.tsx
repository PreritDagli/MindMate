import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Sidebar from "@/components/admin/sidebar";
import JournalEntryModal from "@/components/admin/journal-entry-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function AdminJournalEntries() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [moodFilter, setMoodFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  
  // Fetch all journal entries
  const { data: entries, isLoading } = useQuery({
    queryKey: ["/api/admin/journal-entries"],
  });
  
  // Fetch all users to get names
  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
  });
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const handleViewEntry = (entryId: number) => {
    setSelectedEntryId(entryId);
  };
  
  const handleCloseEntryModal = () => {
    setSelectedEntryId(null);
  };
  
  // Get user name by ID
  const getUserName = (userId: number) => {
    if (!users) return "Unknown User";
    const user = users.find(u => u.id === userId);
    return user ? (user.fullName || user.username) : "Unknown User";
  };
  
  // Filter entries based on search query and mood filter
  const filteredEntries = entries ? entries.filter(entry => {
    const matchesSearch = 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.content && entry.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      getUserName(entry.userId).toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMood = moodFilter === "all" || (entry.mood && entry.mood.toLowerCase() === moodFilter.toLowerCase());
    
    return matchesSearch && matchesMood;
  }) : [];
  
  // Pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredEntries.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);
  
  // Change page
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Get mood badge variant
  const getMoodBadgeVariant = (mood: string) => {
    const moodLower = mood?.toLowerCase();
    if (moodLower === "happy") return "success";
    if (moodLower === "sad") return "destructive";
    if (moodLower === "calm") return "secondary";
    if (moodLower === "anxious") return "accent";
    return "default";
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading journal entries...</span>
      </div>
    );
  }
  
  // Extract unique moods for filter
  const uniqueMoods = entries 
    ? Array.from(new Set(entries.map(entry => entry.mood).filter(Boolean)))
    : [];
  
  return (
    <>
      <Helmet>
        <title>Journal Entries | MindMate Admin</title>
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
          currentView="journal-entries" 
          onNavigate={() => setIsSidebarOpen(false)}
        />
        
        {/* Main content */}
        <div className="flex flex-col flex-1 w-0 overflow-hidden">
          {/* Top navbar */}
          <div className="bg-white border-b border-neutral-200 flex items-center justify-between p-4 lg:px-6">
            <div className="flex flex-1 items-center">
              <span className="lg:hidden"></span>
              <h1 className="text-xl font-semibold ml-12 lg:ml-0">Journal Entries</h1>
            </div>
          </div>
          
          {/* Main content area */}
          <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 lg:p-6">
            {/* Search and filter bar */}
            <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="w-full md:w-auto flex-1 relative">
                <Input
                  type="text"
                  placeholder="Search entries by title, content or user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <Select
                  value={moodFilter}
                  onValueChange={setMoodFilter}
                >
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Filter by mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Moods</SelectItem>
                    {uniqueMoods.map(mood => (
                      <SelectItem key={mood} value={mood}>{mood}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={entriesPerPage.toString()}
                  onValueChange={(value) => {
                    setEntriesPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[120px]">
                    <SelectValue placeholder="10 per page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 per page</SelectItem>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="20">20 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Journal entries table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Mood
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Preview
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {currentEntries.length > 0 ? (
                      currentEntries.map(entry => (
                        <tr key={entry.id} className="hover:bg-neutral-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                            {entry.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                            {getUserName(entry.userId)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                            {formatDate(entry.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {entry.mood && (
                              <Badge variant={getMoodBadgeVariant(entry.mood)}>
                                {entry.mood}
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-500 max-w-xs">
                            <div className="truncate">
                              {entry.content}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleViewEntry(entry.id)}
                              className="text-primary hover:text-primary/80"
                            >
                              View
                            </button>
                            <span className="mx-2 text-neutral-300">|</span>
                            <button className="text-red-600 hover:text-red-900">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-neutral-500">
                          {searchQuery || moodFilter !== "all" 
                            ? "No journal entries match your filters" 
                            : "No journal entries found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {filteredEntries.length > 0 && (
                <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-neutral-700">
                    Showing <span className="font-medium">{indexOfFirstEntry + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastEntry, filteredEntries.length)}
                    </span>{" "}
                    of <span className="font-medium">{filteredEntries.length}</span> entries
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          // Show first page, last page, current page, and pages around current
                          return (
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 1
                          );
                        })
                        .map((page, index, array) => {
                          // Add ellipsis if there's a gap in the sequence
                          const showEllipsisBefore =
                            index > 0 && array[index - 1] !== page - 1;
                          const showEllipsisAfter =
                            index < array.length - 1 && array[index + 1] !== page + 1;
                          
                          return (
                            <div key={page} className="flex items-center">
                              {showEllipsisBefore && (
                                <span className="px-2 text-neutral-400">...</span>
                              )}
                              <Button
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => goToPage(page)}
                                className="h-8 w-8 p-0"
                              >
                                {page}
                              </Button>
                              {showEllipsisAfter && (
                                <span className="px-2 text-neutral-400">...</span>
                              )}
                            </div>
                          );
                        })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      
      {/* Journal entry modal */}
      {selectedEntryId && (
        <JournalEntryModal
          entryId={selectedEntryId}
          isOpen={selectedEntryId !== null}
          onClose={handleCloseEntryModal}
        />
      )}
    </>
  );
}
