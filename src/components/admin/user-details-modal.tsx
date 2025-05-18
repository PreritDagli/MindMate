import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient"; 
import { User } from "@shared/schema";
import { format } from "date-fns";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter,
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Loader2, Mail, Calendar, Key, User as UserIcon, Shield, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type UserDetailsModalProps = {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
};

const userFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  isAdmin: z.boolean(),
  username: z.string().min(3, "Username must be at least 3 characters"),
  newPassword: z.string().optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function UserDetailsModal({ userId, isOpen, onClose }: UserDetailsModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState("profile");
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  
  const { 
    data: user, 
    isLoading, 
    isError,
    error 
  } = useQuery<User>({
    queryKey: [`/api/admin/users/${userId}`],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/admin/users/${userId}`);
      return await res.json();
    },
    enabled: isOpen && userId > 0,
  });
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      isAdmin: false,
      username: '',
      newPassword: '',
    },
  });
  
  // Update form values when user data is loaded
  React.useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName || '',
        email: user.email || '',
        isAdmin: user.isAdmin || false,
        username: user.username,
        newPassword: '',
      });
    }
  }, [user, form]);
  
  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      const updateData = {
        ...data,
        // Only include password if provided
        ...(data.newPassword && { password: data.newPassword })
      };
      
      // Remove newPassword field since our API doesn't expect it
      delete (updateData as any).newPassword;
      
      const res = await apiRequest('PATCH', `/api/admin/users/${userId}`, updateData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "User updated",
        description: "The user details have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update user",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "User deleted",
        description: "The user has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete user",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(data: UserFormValues) {
    updateUserMutation.mutate(data);
  }
  
  function handleDelete() {
    deleteUserMutation.mutate();
    setDeleteDialogOpen(false);
  }
  
  // Format date for display
  const formatDate = (date?: string | Date) => {
    if (!date) return "N/A";
    try {
      return format(new Date(date), "PPP");
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
  
  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  if (isError || !user) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>
              Failed to load user: {error?.message || "User not found"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  
  const isPending = updateUserMutation.isPending || deleteUserMutation.isPending;
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.profileImage || ""} alt={user.username} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {getInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-xl">
                    {user.fullName || user.username}
                    {user.isAdmin && (
                      <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">
                        <Shield className="h-3 w-3 mr-1" /> Admin
                      </Badge>
                    )}
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    @{user.username} • Member since {formatDate(user.createdAt)}
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>
          
          <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="activity">Activity & Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-4 py-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Leave blank to keep current password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Only fill this if you want to change the user's password
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isAdmin"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Administrator</FormLabel>
                          <FormDescription>
                            Give this user admin privileges to manage the entire platform
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter className="gap-2 sm:gap-0">
                    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button type="button" variant="destructive">
                          Delete User
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete user "{user.username}"
                            and remove all their data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            {deleteUserMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>Delete</>
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    
                    <Button type="submit" disabled={isPending}>
                      {updateUserMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>Save Changes</>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="activity" className="space-y-6 py-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs">Mood Entries</Label>
                  <p className="font-medium text-lg">23</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs">Journal Entries</Label>
                  <p className="font-medium text-lg">15</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs">Goals Created</Label>
                  <p className="font-medium text-lg">5</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs">Last Active</Label>
                  <p className="font-medium text-lg">{formatDate(user.lastActive)}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-base font-medium">User Settings</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="border rounded-md p-3">
                    <h4 className="text-sm font-medium mb-2">Appearance</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {user.appearanceSettings 
                        ? JSON.stringify(JSON.parse(user.appearanceSettings), null, 2) 
                        : "No appearance settings configured"}
                    </p>
                  </div>
                  <div className="border rounded-md p-3">
                    <h4 className="text-sm font-medium mb-2">Privacy</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {user.privacySettings 
                        ? JSON.stringify(JSON.parse(user.privacySettings), null, 2) 
                        : "No privacy settings configured"}
                    </p>
                  </div>
                  <div className="border rounded-md p-3">
                    <h4 className="text-sm font-medium mb-2">Notifications</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {user.notificationSettings 
                        ? JSON.stringify(JSON.parse(user.notificationSettings), null, 2) 
                        : "No notification settings configured"}
                    </p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-base font-medium">Actions</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline">View Journal Entries</Button>
                  <Button variant="outline">View Mood Entries</Button>
                  <Button variant="outline">View Goals</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}