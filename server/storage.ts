import { 
  User, 
  InsertUser, 
  MoodEntry, 
  InsertMoodEntry, 
  JournalEntry, 
  InsertJournalEntry,
  Goal,
  InsertGoal,
  UserStats,
  InsertUserStats,
  Quiz,
  InsertQuiz,
  QuizResult,
  InsertQuizResult,
  users,
  moodEntries,
  journalEntries,
  goals,
  userStats,
  quizzes,
  quizResults,
  sessions
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { hashPassword } from "./auth";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import connectPgSimple from "connect-pg-simple";

const MemoryStore = createMemoryStore(session);

type AdminStats = {
  totalUsers: number;
  activeUsers: number;
  moodEntries: number;
  journalEntries: number;
  userChange: string;
  activeChange: string;
  moodChange: string;
  journalChange: string;
};

type MoodAnalytics = {
  distribution: {
    mood: string;
    count: number;
    percentage: number;
  }[];
  trends: {
    date: string;
    value: number;
  }[];
};

type UserActivity = {
  daily: {
    date: string;
    activeUsers: number;
  }[];
};

export interface IStorage {
  sessionStore: session.Store;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  updateUserLastActive(id: number): Promise<void>;
  updateUserPassword(id: number, newPassword: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<boolean>;
  
  // Mood entry operations
  createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry>;
  getMoodEntry(id: number): Promise<MoodEntry | undefined>;
  getMoodEntriesByUserId(userId: number): Promise<MoodEntry[]>;
  getAllMoodEntries(): Promise<MoodEntry[]>;
  deleteMoodEntry(id: number): Promise<boolean>;
  
  // Journal entry operations
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  getJournalEntry(id: number): Promise<JournalEntry | undefined>;
  getJournalEntriesByUserId(userId: number): Promise<JournalEntry[]>;
  getAllJournalEntries(): Promise<JournalEntry[]>;
  deleteJournalEntry(id: number): Promise<boolean>;
  
  // Goal operations
  createGoal(goal: InsertGoal): Promise<Goal>;
  getGoal(id: number): Promise<Goal | undefined>;
  getGoalsByUserId(userId: number): Promise<Goal[]>;
  updateGoal(id: number, completed: boolean): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;
  
  // Stats operations
  updateUserStats(stats: InsertUserStats): Promise<UserStats>;
  getUserStatsByUserId(userId: number): Promise<UserStats[]>;
  
  // Quiz operations
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  getQuiz(id: number): Promise<Quiz | undefined>;
  getAllQuizzes(): Promise<Quiz[]>;
  getQuizzesByType(type: string): Promise<Quiz[]>;
  deleteQuiz(id: number): Promise<boolean>;
  
  // Quiz result operations
  createQuizResult(result: InsertQuizResult): Promise<QuizResult>;
  getQuizResult(id: number): Promise<QuizResult | undefined>;
  getQuizResultsByUserId(userId: number): Promise<QuizResult[]>;
  getQuizResultsByQuizId(quizId: number): Promise<QuizResult[]>;
  updateQuizResult(id: number, result: Partial<QuizResult>): Promise<QuizResult | undefined>;
  deleteQuizResult(id: number): Promise<boolean>;
  
  // Admin operations
  getAdminStats(): Promise<AdminStats>;
  getMoodAnalytics(): Promise<MoodAnalytics>;
  getUserActivity(): Promise<UserActivity>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    const PgStore = connectPgSimple(session);
    this.sessionStore = new PgStore({
      // Use pool directly or connection string
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      tableName: 'sessions',
      createTableIfMissing: true,
      pruneSessionInterval: 60 * 60, // 1 hour
      ttl: 10 * 24 * 60 * 60 // 10 days instead of 7
    });
    
    // Create tables if they don't exist
    this.initDatabase();
  }
  
  private async initDatabase() {
    try {
      // Initialize with admin user
      await this.seedInitialUsers();
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    // Ensure proper null values for optional fields
    const userData = {
      ...insertUser,
      email: insertUser.email || null,
      fullName: insertUser.fullName || null,
      profileImage: insertUser.profileImage || null,
      notificationSettings: insertUser.notificationSettings || null,
      appearanceSettings: insertUser.appearanceSettings || null,
      privacySettings: insertUser.privacySettings || null,
    };
    
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    // Don't update sensitive fields
    const safeUpdate = { ...userData };
    delete safeUpdate.password;
    delete safeUpdate.id;
    
    const [updatedUser] = await db.update(users)
      .set(safeUpdate)
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }
  
  async updateUserLastActive(id: number): Promise<void> {
    await db.update(users)
      .set({ lastActive: new Date() })
      .where(eq(users.id, id));
  }
  
  async updateUserPassword(id: number, newPassword: string): Promise<boolean> {
    try {
      await db.update(users)
        .set({ password: newPassword })
        .where(eq(users.id, id));
      return true;
    } catch (error) {
      console.error("Error updating password:", error);
      return false;
    }
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }
  
  // Mood entry operations
  async createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry> {
    const [moodEntry] = await db.insert(moodEntries).values(entry).returning();
    return moodEntry;
  }
  
  async getMoodEntry(id: number): Promise<MoodEntry | undefined> {
    const result = await db.select().from(moodEntries).where(eq(moodEntries.id, id));
    return result[0];
  }
  
  async getMoodEntriesByUserId(userId: number): Promise<MoodEntry[]> {
    return await db.select()
      .from(moodEntries)
      .where(eq(moodEntries.userId, userId))
      .orderBy(desc(moodEntries.createdAt));
  }
  
  async getAllMoodEntries(): Promise<MoodEntry[]> {
    return await db.select().from(moodEntries).orderBy(desc(moodEntries.createdAt));
  }
  
  async deleteMoodEntry(id: number): Promise<boolean> {
    const result = await db.delete(moodEntries).where(eq(moodEntries.id, id)).returning();
    return result.length > 0;
  }
  
  // Journal entry operations
  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const [journalEntry] = await db.insert(journalEntries).values(entry).returning();
    return journalEntry;
  }
  
  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    const result = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
    return result[0];
  }
  
  async getJournalEntriesByUserId(userId: number): Promise<JournalEntry[]> {
    return await db.select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt));
  }
  
  async getAllJournalEntries(): Promise<JournalEntry[]> {
    return await db.select().from(journalEntries).orderBy(desc(journalEntries.createdAt));
  }
  
  async deleteJournalEntry(id: number): Promise<boolean> {
    const result = await db.delete(journalEntries).where(eq(journalEntries.id, id)).returning();
    return result.length > 0;
  }
  
  // Goal operations
  async createGoal(goal: InsertGoal): Promise<Goal> {
    const [newGoal] = await db.insert(goals).values(goal).returning();
    return newGoal;
  }
  
  async getGoal(id: number): Promise<Goal | undefined> {
    const result = await db.select().from(goals).where(eq(goals.id, id));
    return result[0];
  }
  
  async getGoalsByUserId(userId: number): Promise<Goal[]> {
    return await db.select()
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(desc(goals.createdAt));
  }
  
  async updateGoal(id: number, completed: boolean): Promise<Goal | undefined> {
    const updateValues = { 
      completed, 
      completedAt: completed ? new Date() : null 
    };
    
    const [updatedGoal] = await db
      .update(goals)
      .set(updateValues)
      .where(eq(goals.id, id))
      .returning();
    
    return updatedGoal;
  }
  
  async deleteGoal(id: number): Promise<boolean> {
    const result = await db.delete(goals).where(eq(goals.id, id)).returning();
    return result.length > 0;
  }
  
  // Stats operations
  async updateUserStats(stats: InsertUserStats): Promise<UserStats> {
    const [userStat] = await db.insert(userStats).values(stats).returning();
    return userStat;
  }
  
  async getUserStatsByUserId(userId: number): Promise<UserStats[]> {
    return await db.select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .orderBy(desc(userStats.date));
  }
  
  // Quiz operations
  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const [newQuiz] = await db.insert(quizzes).values(quiz).returning();
    return newQuiz;
  }
  
  async getQuiz(id: number): Promise<Quiz | undefined> {
    const result = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return result[0];
  }
  
  async getAllQuizzes(): Promise<Quiz[]> {
    return await db.select().from(quizzes).orderBy(desc(quizzes.createdAt));
  }
  
  async getQuizzesByType(type: string): Promise<Quiz[]> {
    return await db.select()
      .from(quizzes)
      .where(eq(quizzes.type, type))
      .orderBy(desc(quizzes.createdAt));
  }
  
  async deleteQuiz(id: number): Promise<boolean> {
    const result = await db.delete(quizzes).where(eq(quizzes.id, id)).returning();
    return result.length > 0;
  }
  
  // Quiz result operations
  async createQuizResult(result: InsertQuizResult): Promise<QuizResult> {
    const [newResult] = await db.insert(quizResults).values(result).returning();
    return newResult;
  }
  
  async getQuizResult(id: number): Promise<QuizResult | undefined> {
    const result = await db.select().from(quizResults).where(eq(quizResults.id, id));
    return result[0];
  }
  
  async getQuizResultsByUserId(userId: number): Promise<QuizResult[]> {
    return await db.select()
      .from(quizResults)
      .where(eq(quizResults.userId, userId))
      .orderBy(desc(quizResults.createdAt));
  }
  
  async getQuizResultsByQuizId(quizId: number): Promise<QuizResult[]> {
    return await db.select()
      .from(quizResults)
      .where(eq(quizResults.quizId, quizId))
      .orderBy(desc(quizResults.createdAt));
  }
  
  async updateQuizResult(id: number, result: Partial<QuizResult>): Promise<QuizResult | undefined> {
    const [updatedResult] = await db.update(quizResults)
      .set(result)
      .where(eq(quizResults.id, id))
      .returning();
    return updatedResult;
  }
  
  async deleteQuizResult(id: number): Promise<boolean> {
    const result = await db.delete(quizResults).where(eq(quizResults.id, id)).returning();
    return result.length > 0;
  }
  
  // Admin operations
  async getAdminStats(): Promise<AdminStats> {
    const userList = await this.getAllUsers();
    const allMoodEntries = await this.getAllMoodEntries();
    const allJournalEntries = await this.getAllJournalEntries();
    
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const activeUsers = userList.filter(user => 
      user.lastActive && new Date(user.lastActive) > oneDayAgo
    ).length;
    
    return {
      totalUsers: userList.length,
      activeUsers,
      moodEntries: allMoodEntries.length,
      journalEntries: allJournalEntries.length,
      userChange: "+8.2%",  // Placeholder stats for initial setup
      activeChange: "+12.5%",
      moodChange: "+4.3%",
      journalChange: "-2.7%"
    };
  }
  
  async getMoodAnalytics(): Promise<MoodAnalytics> {
    const allMoodEntries = await this.getAllMoodEntries();
    
    // Calculate mood distribution
    const moodCounts: Record<string, number> = {};
    allMoodEntries.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });
    
    const totalEntries = allMoodEntries.length || 1; // Avoid division by zero
    const distribution = Object.entries(moodCounts).map(([mood, count]) => ({
      mood,
      count,
      percentage: Math.round((count / totalEntries) * 100)
    }));
    
    // Generate weekly trend data
    const trends = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateString = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Count mood entries for this day
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      // For now using a placeholder value
      const value = Math.floor(Math.random() * 50) + 30;
      
      trends.push({ date: dateString, value });
    }
    
    return { distribution, trends };
  }
  
  async getUserActivity(): Promise<UserActivity> {
    // Generate daily user activity data
    const daily = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateString = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      // For now using a placeholder value
      const activeUsers = Math.floor(Math.random() * 40) + 20;
      
      daily.push({ date: dateString, activeUsers });
    }
    
    return { daily };
  }
  
  private async seedInitialUsers() {
    // Check if admin user exists, if not create one
    const adminUser = await this.getUserByUsername("meghakaria20");
    const privateAdminUser = await this.getUserByUsername("admin");
    
    // Create admin user if it doesn't exist
    if (!adminUser) {
      await this.createUser({
        username: "meghakaria20",
        password: await hashPassword("admin"), // Hash passwords for security
        email: "meghakaria20@gmail.com",
        fullName: "Megha Karia",
        isAdmin: true,
        profileImage: null
      });
      console.log("Created admin user for meghakaria20");
    }
    
    // Create private admin user if it doesn't exist
    if (!privateAdminUser) {
      await this.createUser({
        username: "admin",
        password: await hashPassword("mindmate2024"), // Hash passwords for security
        email: "admin@mindmate.app",
        fullName: "Private Admin",
        isAdmin: true,
        profileImage: null
      });
      console.log("Created private admin user with username: admin");
    }
    
    // Create a regular user with known credentials if it doesn't exist
    const regularUser = await this.getUserByUsername("user");
    if (!regularUser) {
      await this.createUser({
        username: "user",
        password: await hashPassword("user"), // Hash passwords for security
        email: "user@mindmate.app",
        fullName: "Regular User",
        isAdmin: false,
        profileImage: null
      });
      console.log("Created regular user");
    }
  }
}

export const storage = new DatabaseStorage();