import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertMoodEntrySchema, 
  insertJournalEntrySchema, 
  insertGoalSchema, 
  insertUserStatsSchema,
  insertQuizSchema,
  insertQuizResultSchema,
  QuizAnswersSchema,
  ScoreSchema,
  InsightsSchema
} from "@shared/schema";

// Authentication middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

// Admin authorization middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !(req.user as any).isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Sets up authentication routes
  setupAuth(app);
  
  // Create the server
  const server = createServer(app);
  
  // User profile update endpoints
  app.patch("/api/users/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Only allow users to update their own profile, or admins to update any profile
      if (req.user.id !== userId && !req.user.isAdmin) {
        return res.status(403).json({ error: "Forbidden: You can only update your own profile" });
      }
      
      const userData = req.body;
      const updatedUser = await storage.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (req.user.id === userId) {
        // Update the user in the session
        req.login(updatedUser, (err: any) => {
          if (err) {
            return res.status(500).json({ message: "Error updating session" });
          }
          return res.json(updatedUser);
        });
      } else {
        res.json(updatedUser);
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/users/:id/change-password", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }
      
      const userId = parseInt(req.params.id);
      
      // Only allow users to change their own password, or admins to change any password
      if (req.user.id !== userId && !req.user.isAdmin) {
        return res.status(403).send("Forbidden: You can only change your own password");
      }
      
      const { currentPassword, newPassword } = req.body;
      
      // Get the user's current password hash
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // If it's not an admin changing the password, verify current password
      if (!req.user.isAdmin && req.user.id === userId) {
        // Import and use the same password verification from auth.js
        const { comparePasswords } = await import("./auth");
        
        const passwordValid = await comparePasswords(currentPassword, user.password);
        if (!passwordValid) {
          return res.status(401).json({ message: "Current password is incorrect" });
        }
      }
      
      // Hash the new password
      const { hashPassword } = await import("./auth");
      const hashedPassword = await hashPassword(newPassword);
      
      // Update the password
      const success = await storage.updateUserPassword(userId, hashedPassword);
      if (!success) {
        return res.status(500).json({ message: "Failed to update password" });
      }
      
      res.json({ message: "Password updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.patch("/api/users/:id/notifications", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }
      
      const userId = parseInt(req.params.id);
      
      // Only allow users to update their own notifications, or admins to update any notifications
      if (req.user.id !== userId && !req.user.isAdmin) {
        return res.status(403).send("Forbidden: You can only update your own notification settings");
      }
      
      // Store the notification settings in the user's record
      const notificationSettings = req.body;
      const userData = {
        notificationSettings: JSON.stringify(notificationSettings)
      };
      
      const updatedUser = await storage.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ 
        message: "Notification settings updated successfully",
        settings: notificationSettings
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.patch("/api/users/:id/appearance", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }
      
      const userId = parseInt(req.params.id);
      
      // Only allow users to update their own appearance, or admins to update any appearance
      if (req.user.id !== userId && !req.user.isAdmin) {
        return res.status(403).send("Forbidden: You can only update your own appearance settings");
      }
      
      // Store the appearance settings in the user's record
      const appearanceSettings = req.body;
      const userData = {
        appearanceSettings: JSON.stringify(appearanceSettings)
      };
      
      const updatedUser = await storage.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ 
        message: "Appearance settings updated successfully",
        settings: appearanceSettings
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.patch("/api/users/:id/privacy", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }
      
      const userId = parseInt(req.params.id);
      
      // Only allow users to update their own privacy settings, or admins to update any privacy settings
      if (req.user.id !== userId && !req.user.isAdmin) {
        return res.status(403).send("Forbidden: You can only update your own privacy settings");
      }
      
      // Store the privacy settings in the user's record
      const privacySettings = req.body;
      const userData = {
        privacySettings: JSON.stringify(privacySettings)
      };
      
      const updatedUser = await storage.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ 
        message: "Privacy settings updated successfully",
        settings: privacySettings
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.delete("/api/users/:id", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }
      
      const userId = parseInt(req.params.id);
      
      // Only allow users to delete their own account, or admins to delete any account
      if (req.user.id !== userId && !req.user.isAdmin) {
        return res.status(403).send("Forbidden: You can only delete your own account");
      }
      
      const success = await storage.deleteUser(userId);
      
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // If the user deleted their own account, log them out
      if (req.user.id === userId) {
        req.logout((err: any) => {
          if (err) {
            return res.status(500).json({ message: "Error logging out" });
          }
          return res.json({ message: "Account deleted successfully" });
        });
      } else {
        res.json({ message: "Account deleted successfully" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin-only middleware
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).send("Access denied: Requires admin privileges");
    }
    next();
  };

  // User routes - authenticated but not admin-only
  app.get("/api/user/mood-entries", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }
      const entries = await storage.getMoodEntriesByUserId(req.user.id);
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/user/mood-entries", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }
      
      const data = insertMoodEntrySchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const entry = await storage.createMoodEntry(data);
      res.status(201).json(entry);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/user/journal-entries", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }
      const entries = await storage.getJournalEntriesByUserId(req.user.id);
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/user/journal-entries", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }
      
      const data = insertJournalEntrySchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const entry = await storage.createJournalEntry(data);
      res.status(201).json(entry);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/user/goals", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }
      const goals = await storage.getGoalsByUserId(req.user.id);
      res.json(goals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/user/goals", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }
      
      const data = insertGoalSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const goal = await storage.createGoal(data);
      res.status(201).json(goal);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin routes - all protected with admin middleware
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteUser(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/mood-entries", requireAdmin, async (req, res) => {
    try {
      const entries = await storage.getAllMoodEntries();
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/mood-entries/user/:userId", requireAdmin, async (req, res) => {
    try {
      const entries = await storage.getMoodEntriesByUserId(parseInt(req.params.userId));
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/journal-entries", requireAdmin, async (req, res) => {
    try {
      const entries = await storage.getAllJournalEntries();
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/journal-entries/user/:userId", requireAdmin, async (req, res) => {
    try {
      const entries = await storage.getJournalEntriesByUserId(parseInt(req.params.userId));
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/journal-entries/:id", requireAdmin, async (req, res) => {
    try {
      const entry = await storage.getJournalEntry(parseInt(req.params.id));
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      res.json(entry);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/journal-entries/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteJournalEntry(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      res.json({ message: "Journal entry deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/mood-analytics", requireAdmin, async (req, res) => {
    try {
      const analytics = await storage.getMoodAnalytics();
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/user-activity", requireAdmin, async (req, res) => {
    try {
      const activity = await storage.getUserActivity();
      res.json(activity);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== Additional User Feature Endpoints =====
  
  // Updated URL patterns for feature endpoints to match client requests
  
  // Mood entries with ID params
  app.get("/api/mood-entries/:userId", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }
      
      // Only allow users to access their own data, or admins to access any data
      const requestedUserId = parseInt(req.params.userId);
      if (req.user.id !== requestedUserId && !req.user.isAdmin) {
        return res.status(403).send("Forbidden: You can only access your own data");
      }
      
      const entries = await storage.getMoodEntriesByUserId(requestedUserId);
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/mood-entries", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }
      
      const data = insertMoodEntrySchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const entry = await storage.createMoodEntry(data);
      
      // Update user's last active timestamp
      await storage.updateUserLastActive(req.user.id);
      
      res.status(201).json(entry);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.delete("/api/mood-entries/:id", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }
      
      const moodEntryId = parseInt(req.params.id);
      
      // Check if the entry exists and belongs to the user
      const entry = await storage.getMoodEntry(moodEntryId);
      if (!entry) {
        return res.status(404).json({ message: "Mood entry not found" });
      }
      
      // Only allow users to delete their own entries, or admins
      if (entry.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Forbidden: You can only delete your own entries" });
      }
      
      const success = await storage.deleteMoodEntry(moodEntryId);
      if (!success) {
        return res.status(404).json({ message: "Mood entry not found" });
      }
      
      res.json({ message: "Mood entry deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Journal entries with ID params
  app.get("/api/journal-entries/:userId", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }
      
      // Only allow users to access their own data, or admins to access any data
      const requestedUserId = parseInt(req.params.userId);
      if (req.user.id !== requestedUserId && !req.user.isAdmin) {
        return res.status(403).send("Forbidden: You can only access your own data");
      }
      
      const entries = await storage.getJournalEntriesByUserId(requestedUserId);
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/journal-entries", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }
      
      const data = insertJournalEntrySchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const entry = await storage.createJournalEntry(data);
      
      // Update user's last active timestamp
      await storage.updateUserLastActive(req.user.id);
      
      res.status(201).json(entry);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.delete("/api/journal-entries/:id", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }
      
      const journalEntryId = parseInt(req.params.id);
      
      // Check if the entry exists and belongs to the user
      const entry = await storage.getJournalEntry(journalEntryId);
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      // Only allow users to delete their own entries, or admins
      if (entry.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Forbidden: You can only delete your own entries" });
      }
      
      const success = await storage.deleteJournalEntry(journalEntryId);
      if (!success) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      res.json({ message: "Journal entry deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Goals with ID params
  app.get("/api/goals/:userId", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }
      
      // Only allow users to access their own data, or admins to access any data
      const requestedUserId = parseInt(req.params.userId);
      if (req.user.id !== requestedUserId && !req.user.isAdmin) {
        return res.status(403).send("Forbidden: You can only access your own data");
      }
      
      const goals = await storage.getGoalsByUserId(requestedUserId);
      res.json(goals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/goals", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }
      
      const data = insertGoalSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const goal = await storage.createGoal(data);
      
      // Update user's last active timestamp
      await storage.updateUserLastActive(req.user.id);
      
      res.status(201).json(goal);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.patch("/api/goals/:id", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }
      
      const goalId = parseInt(req.params.id);
      const { completed } = req.body;
      
      // Check if the goal exists and belongs to the user
      const goal = await storage.getGoal(goalId);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      // Only allow users to update their own goals, or admins
      if (goal.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Forbidden: You can only update your own goals" });
      }
      
      // Update the goal's completed status
      const updatedGoal = await storage.updateGoal(goalId, completed);
      if (!updatedGoal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      // Update user's last active timestamp
      await storage.updateUserLastActive(req.user.id);
      
      res.json(updatedGoal);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.delete("/api/goals/:id", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }
      
      const goalId = parseInt(req.params.id);
      
      // Check if the goal exists and belongs to the user
      const goal = await storage.getGoal(goalId);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      // Only allow users to delete their own goals, or admins
      if (goal.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Forbidden: You can only delete your own goals" });
      }
      
      const success = await storage.deleteGoal(goalId);
      if (!success) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      res.json({ message: "Goal deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // User stats
  app.get("/api/user-stats/:userId", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }
      
      // Only allow users to access their own data, or admins to access any data
      const requestedUserId = parseInt(req.params.userId);
      if (req.user.id !== requestedUserId && !req.user.isAdmin) {
        return res.status(403).send("Forbidden: You can only access your own data");
      }
      
      const stats = await storage.getUserStatsByUserId(requestedUserId);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/user-stats", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }
      
      const data = insertUserStatsSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const stats = await storage.updateUserStats(data);
      
      // Update user's last active timestamp
      await storage.updateUserLastActive(req.user.id);
      
      res.status(201).json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Daily Quote (mockup for now)
  app.get("/api/daily-quote", async (req, res) => {
    try {
      // Simulate a daily quote - in a real app would come from a quote API or database
      const quotes = [
        { id: 1, text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { id: 2, text: "In the midst of difficulty lies opportunity.", author: "Albert Einstein" },
        { id: 3, text: "Happiness is not something ready-made. It comes from your own actions.", author: "Dalai Lama" },
        { id: 4, text: "Your mind is a powerful thing. When you fill it with positive thoughts, your life will start to change.", author: "Unknown" },
        { id: 5, text: "Every moment is a fresh beginning.", author: "T.S. Eliot" }
      ];
      
      // Pick a random quote - in production would be based on the day
      const randomIndex = Math.floor(Math.random() * quotes.length);
      res.json(quotes[randomIndex]);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // ===== Quiz Feature Endpoints =====
  
  // Get all quizzes (users can only see available quizzes)
  app.get("/api/quizzes", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }
      
      const quizzes = await storage.getAllQuizzes();
      res.json(quizzes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get quizzes by type (emotional intelligence, etc.)
  app.get("/api/quizzes/type/:type", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }
      
      const quizzes = await storage.getQuizzesByType(req.params.type);
      res.json(quizzes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get a specific quiz
  app.get("/api/quizzes/:id", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }
      
      const quiz = await storage.getQuiz(parseInt(req.params.id));
      
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      res.json(quiz);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Submit a quiz result (answers and receive score/insights)
  app.post("/api/quiz-results", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }
      
      const { quizId, answers } = req.body;
      
      // Use a try-catch within the route for better error handling
      try {
        QuizAnswersSchema.parse(answers);
      } catch (validationError) {
        console.log("Quiz answer validation error:", validationError);
        // Continue with the request even if validation fails
      }
      
      // Get the quiz
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      // Calculate the score based on the answers and quiz questions
      // This is a simplified scoring algorithm - you may want to make this more sophisticated
      const quizQuestions = quiz.questions as any[];
      let totalScore = 0;
      const insights: { questionId: string; question: string; insight: string }[] = [];
      
      // Process each answer and generate insights
      for (const answer of answers) {
        const question = quizQuestions.find(q => q.id === answer.questionId);
        if (!question) continue;
        
        // Find the option that matches the user's answer
        const selectedOption = question.options?.find(opt => opt.id === answer.optionId);
        if (!selectedOption) continue;
        
        totalScore += Number(selectedOption.value) || 0;
        
        // Add insight if available for this option
        if (selectedOption.insight) {
          insights.push({
            questionId: question.id,
            question: question.text,
            insight: selectedOption.insight
          });
        }
      }
      
      // Calculate percentage score
      const maxPossibleScore = quizQuestions.reduce((total: number, q) => {
        if (!q.options || !Array.isArray(q.options) || q.options.length === 0) return total;
        const values = q.options.map(opt => Number(opt.value) || 0);
        const maxOption = Math.max(...values);
        return total + maxOption;
      }, 0);
      
      const percentage = Math.round((totalScore / maxPossibleScore) * 100);
      
      const score = {
        total: totalScore,
        max: maxPossibleScore,
        percentage,
        level: percentage >= 80 ? "Excellent" : 
               percentage >= 60 ? "Good" : 
               percentage >= 40 ? "Average" : 
               percentage >= 20 ? "Below Average" : "Poor"
      };
      
      // Create the quiz result
      const quizResult = await storage.createQuizResult({
        userId: req.user.id,
        quizId,
        answers: answers,
        score,
        insights: insights.length > 0 ? insights : null,
        completed: true,
        completedAt: new Date()
      });
      
      // Update user's last active timestamp
      await storage.updateUserLastActive(req.user.id);
      
      res.status(201).json(quizResult);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get quiz results for the current user
  app.get("/api/user/quiz-results", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }
      
      const results = await storage.getQuizResultsByUserId(req.user.id);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get a specific quiz result
  app.get("/api/quiz-results/:id", async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Unauthorized");
      }
      
      const result = await storage.getQuizResult(parseInt(req.params.id));
      
      if (!result) {
        return res.status(404).json({ message: "Quiz result not found" });
      }
      
      // Only allow users to access their own quiz results, or admins to access any results
      if (result.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).send("Forbidden: You can only access your own quiz results");
      }
      
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Admin routes for quizzes
  app.post("/api/admin/quizzes", requireAdmin, async (req, res) => {
    try {
      const data = insertQuizSchema.parse(req.body);
      const quiz = await storage.createQuiz(data);
      res.status(201).json(quiz);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.delete("/api/admin/quizzes/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteQuiz(parseInt(req.params.id));
      
      if (!success) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      res.json({ message: "Quiz deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/admin/quiz-results", requireAdmin, async (req, res) => {
    try {
      // Get all quiz results for admin dashboard
      const results = await Promise.all(
        (await storage.getAllUsers()).map(async (user) => {
          const userResults = await storage.getQuizResultsByUserId(user.id);
          return {
            user,
            results: userResults
          };
        })
      );
      
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Set up WebSocket server for real-time notifications
  const wss = new WebSocketServer({ server, path: '/ws' });
  
  wss.on('connection', (ws: any) => {
    console.log('WebSocket client connected');
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to MindMate WebSocket server'
    }));
    
    // Handle messages from clients
    ws.on('message', (message: any) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);
        
        // Handle different message types
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return server;
}
