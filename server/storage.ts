import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "@shared/schema";
import {
  type NewsletterSubscriber,
  type InsertNewsletterSubscriber,
} from "@shared/schema";

// Initialize database connection with error handling
let pool: pkg.Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

function getDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  if (!pool || !db) {
    console.log("Initializing database connection...");
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Serverless-friendly pool configuration
      max: 1, // Limit connections for serverless
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    // Handle pool errors
    pool.on("error", (err) => {
      console.error("Unexpected database pool error:", err);
    });

    db = drizzle(pool, { schema });
    console.log("Database connection initialized");
  }

  return db;
}

export interface IStorage {
  subscribeToNewsletter(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  getSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined>;
}

export class DbStorage implements IStorage {
  async subscribeToNewsletter(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    try {
      const database = getDatabase();
      const [newSubscriber] = await database
        .insert(schema.newsletterSubscribers)
        .values(subscriber)
        .returning();
      
      if (!newSubscriber) {
        throw new Error("Failed to create newsletter subscriber");
      }
      
      return newSubscriber;
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      throw error;
    }
  }

  async getSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined> {
    try {
      const database = getDatabase();
      const [subscriber] = await database
        .select()
        .from(schema.newsletterSubscribers)
        .where(eq(schema.newsletterSubscribers.email, email));
      return subscriber;
    } catch (error) {
      console.error("Error getting subscriber by email:", error);
      throw error;
    }
  }
}

export const storage = new DbStorage();
