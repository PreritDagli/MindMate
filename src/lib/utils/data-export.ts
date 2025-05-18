import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

/**
 * Exports data from the MindMate admin dashboard
 * Allows for downloading user data, mood entries, and journal entries
 */
export async function exportData(dataType: string = "all") {
  try {
    // In a real application, this would call the backend API to generate CSV/JSON exports
    const endpoints = {
      users: "/api/admin/users",
      moods: "/api/admin/mood-entries",
      journals: "/api/admin/journal-entries",
      analytics: "/api/admin/mood-analytics"
    };
    
    // Create a toast notification
    const toast = useToast();
    
    if (dataType === "all") {
      // Fetch all data types
      const users = await apiRequest("GET", endpoints.users);
      const moods = await apiRequest("GET", endpoints.moods);
      const journals = await apiRequest("GET", endpoints.journals);
      const analytics = await apiRequest("GET", endpoints.analytics);
      
      // Combine data into a single object
      const allData = {
        users: await users.json(),
        moods: await moods.json(),
        journals: await journals.json(),
        analytics: await analytics.json()
      };
      
      // Convert to JSON string
      const jsonData = JSON.stringify(allData, null, 2);
      
      // Create a Blob from the JSON string
      const blob = new Blob([jsonData], { type: "application/json" });
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mindmate_export_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      
      // Show success toast
      toast().toast({
        title: "Export successful",
        description: "All data has been exported successfully.",
      });
      
      return true;
    } else {
      // Fetch specific data type
      const endpoint = endpoints[dataType as keyof typeof endpoints];
      if (!endpoint) {
        throw new Error(`Unknown data type: ${dataType}`);
      }
      
      const response = await apiRequest("GET", endpoint);
      const data = await response.json();
      
      // Convert to JSON string
      const jsonData = JSON.stringify(data, null, 2);
      
      // Create a Blob from the JSON string
      const blob = new Blob([jsonData], { type: "application/json" });
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mindmate_${dataType}_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      
      // Show success toast
      toast().toast({
        title: "Export successful",
        description: `${dataType} data has been exported successfully.`,
      });
      
      return true;
    }
  } catch (error) {
    console.error("Export failed:", error);
    
    // Show error toast
    const toast = useToast();
    toast().toast({
      title: "Export failed",
      description: error instanceof Error ? error.message : "An unknown error occurred",
      variant: "destructive",
    });
    
    return false;
  }
}
