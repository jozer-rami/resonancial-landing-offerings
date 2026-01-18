import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "@shared/schema";
import {
  type NewsletterSubscriber,
  type InsertNewsletterSubscriber,
  type DiscountCode,
} from "@shared/schema";
import { config } from "./config";
import {
  createDiscountCode,
  validateDiscountCode,
  redeemDiscountCode,
  updateDeliveryStatus,
} from "./services/discount-code";
import { sendDiscountCodeViaWhatsApp } from "./services/whatsapp";
import { sendDiscountCodeViaEmail } from "./services/email";

// Initialize database connection with error handling
let pool: pkg.Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;
let initializationPromise: Promise<ReturnType<typeof drizzle>> | null = null;

/**
 * Initialize database connection eagerly at startup.
 * This prevents race conditions from lazy initialization during concurrent requests.
 */
export async function initializeDatabase(): Promise<void> {
  if (!config.database.url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  if (db) {
    return; // Already initialized
  }

  console.log(`Initializing database connection (pool size: ${config.database.poolSize})...`);

  pool = new Pool({
    connectionString: config.database.url,
    // Pool size configurable via DB_POOL_SIZE env var
    // - Serverless (Vercel): Use DB_POOL_SIZE=1
    // - Persistent (Railway/Render): Use DB_POOL_SIZE=10 (default)
    max: config.database.poolSize,
    idleTimeoutMillis: config.database.idleTimeoutMillis,
    connectionTimeoutMillis: config.database.connectionTimeoutMillis,
  });

  // Handle pool errors
  pool.on("error", (err) => {
    console.error("Unexpected database pool error:", err);
  });

  // Test the connection
  try {
    const client = await pool.connect();
    client.release();
    console.log("Database connection verified");
  } catch (error) {
    console.error("Failed to connect to database:", error);
    throw error;
  }

  db = drizzle(pool, { schema });
  console.log("Database connection initialized");
}

/**
 * Get database instance. Uses singleton pattern with async initialization guard
 * to prevent race conditions during concurrent requests.
 */
export async function getDatabase(): Promise<ReturnType<typeof drizzle>> {
  if (db) {
    return db;
  }

  // Use a shared promise to prevent multiple concurrent initializations
  if (!initializationPromise) {
    initializationPromise = (async () => {
      await initializeDatabase();
      return db!;
    })();
  }

  return initializationPromise;
}

export interface SubscriptionResult {
  subscriber: NewsletterSubscriber;
  discountCode: DiscountCode;
  deliveryStatus: "sent" | "failed";
}

export interface IStorage {
  subscribeToNewsletter(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  subscribeWithDiscountCode(subscriber: InsertNewsletterSubscriber): Promise<SubscriptionResult>;
  getSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined>;
  getSubscriberById(id: string): Promise<NewsletterSubscriber | undefined>;
  validateCode(code: string): Promise<{ valid: boolean; code?: DiscountCode; error?: string }>;
  redeemCode(code: string, orderId: string): Promise<{ success: boolean; error?: string }>;
}

export class DbStorage implements IStorage {
  async subscribeToNewsletter(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    try {
      const database = await getDatabase();
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
      const database = await getDatabase();
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

  async getSubscriberById(id: string): Promise<NewsletterSubscriber | undefined> {
    try {
      const database = await getDatabase();
      const [subscriber] = await database
        .select()
        .from(schema.newsletterSubscribers)
        .where(eq(schema.newsletterSubscribers.id, id));
      return subscriber;
    } catch (error) {
      console.error("Error getting subscriber by id:", error);
      throw error;
    }
  }

  /**
   * Subscribe to newsletter and generate + deliver discount code
   */
  async subscribeWithDiscountCode(subscriber: InsertNewsletterSubscriber): Promise<SubscriptionResult> {
    // Create subscriber
    const newSubscriber = await this.subscribeToNewsletter(subscriber);

    // Create discount code
    const discountCode = await createDiscountCode(
      newSubscriber.id,
      subscriber.contactPreference || "whatsapp"
    );

    let deliveryStatus: "sent" | "failed" = "failed";

    // Send via preferred channel
    if (subscriber.contactPreference === "whatsapp" && subscriber.phone && subscriber.phoneCountryCode) {
      const result = await sendDiscountCodeViaWhatsApp(
        subscriber.phone,
        subscriber.phoneCountryCode,
        discountCode.code,
        discountCode.expiresAt
      );

      if (result.success) {
        deliveryStatus = "sent";
        await updateDeliveryStatus(discountCode.id, "sent");
      } else {
        console.error("Failed to send WhatsApp:", result.error);
        // Auto-fallback to email
        console.log("[Fallback] Attempting email delivery for:", subscriber.email);
        const emailResult = await sendDiscountCodeViaEmail(
          subscriber.email,
          discountCode.code,
          discountCode.expiresAt
        );
        if (emailResult.success) {
          deliveryStatus = "sent";
          await updateDeliveryStatus(discountCode.id, "sent");
          console.log("[Fallback] Email sent successfully");
        } else {
          console.error("Failed to send email fallback:", emailResult.error);
          await updateDeliveryStatus(discountCode.id, "failed");
        }
      }
    } else if (subscriber.contactPreference === "email") {
      // Send discount code via email using Resend
      const emailResult = await sendDiscountCodeViaEmail(
        subscriber.email,
        discountCode.code,
        discountCode.expiresAt
      );

      if (emailResult.success) {
        deliveryStatus = "sent";
        await updateDeliveryStatus(discountCode.id, "sent");
        console.log("[Email] Discount code sent to:", subscriber.email);
      } else {
        console.error("Failed to send email:", emailResult.error);
        await updateDeliveryStatus(discountCode.id, "failed");
      }
    }

    return {
      subscriber: newSubscriber,
      discountCode,
      deliveryStatus,
    };
  }

  /**
   * Validate a discount code
   */
  async validateCode(code: string): Promise<{ valid: boolean; code?: DiscountCode; error?: string }> {
    return validateDiscountCode(code);
  }

  /**
   * Redeem a discount code
   */
  async redeemCode(code: string, orderId: string): Promise<{ success: boolean; error?: string }> {
    return redeemDiscountCode(code, orderId);
  }
}

export const storage = new DbStorage();
