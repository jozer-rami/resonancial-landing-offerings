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
import { loggers } from "./lib/logger";

const logger = loggers.storage;

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

  logger.info("Initializing database connection", {
    poolSize: config.database.poolSize,
    idleTimeout: config.database.idleTimeoutMillis,
    connectionTimeout: config.database.connectionTimeoutMillis,
  });

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
    logger.error("Unexpected database pool error", err);
  });

  // Test the connection
  const startTime = Date.now();
  try {
    const client = await pool.connect();
    client.release();
    const duration = Date.now() - startTime;
    logger.info("Database connection verified", { duration: `${duration}ms` });
  } catch (error) {
    logger.error("Failed to connect to database", error instanceof Error ? error : new Error(String(error)));
    throw error;
  }

  db = drizzle(pool, { schema });
  logger.info("Database connection initialized");
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
    const startTime = Date.now();
    try {
      const database = await getDatabase();
      const [newSubscriber] = await database
        .insert(schema.newsletterSubscribers)
        .values(subscriber)
        .returning();

      if (!newSubscriber) {
        throw new Error("Failed to create newsletter subscriber");
      }

      const duration = Date.now() - startTime;
      logger.debug("Subscriber created", {
        subscriberId: newSubscriber.id,
        email: subscriber.email,
        duration: `${duration}ms`,
      });

      return newSubscriber;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.errorWithData(
        "Error subscribing to newsletter",
        { email: subscriber.email, duration: `${duration}ms` },
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  async getSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined> {
    const startTime = Date.now();
    try {
      const database = await getDatabase();
      const [subscriber] = await database
        .select()
        .from(schema.newsletterSubscribers)
        .where(eq(schema.newsletterSubscribers.email, email));

      const duration = Date.now() - startTime;
      logger.debug("Subscriber lookup by email", {
        email,
        found: !!subscriber,
        duration: `${duration}ms`,
      });

      return subscriber;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.errorWithData(
        "Error getting subscriber by email",
        { email, duration: `${duration}ms` },
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  async getSubscriberById(id: string): Promise<NewsletterSubscriber | undefined> {
    const startTime = Date.now();
    try {
      const database = await getDatabase();
      const [subscriber] = await database
        .select()
        .from(schema.newsletterSubscribers)
        .where(eq(schema.newsletterSubscribers.id, id));

      const duration = Date.now() - startTime;
      logger.debug("Subscriber lookup by ID", {
        subscriberId: id,
        found: !!subscriber,
        duration: `${duration}ms`,
      });

      return subscriber;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.errorWithData(
        "Error getting subscriber by ID",
        { subscriberId: id, duration: `${duration}ms` },
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  /**
   * Subscribe to newsletter and generate + deliver discount code
   */
  async subscribeWithDiscountCode(subscriber: InsertNewsletterSubscriber): Promise<SubscriptionResult> {
    logger.debug("Starting subscription with discount code flow", {
      email: subscriber.email,
      contactPreference: subscriber.contactPreference,
    });

    // Create subscriber
    const newSubscriber = await this.subscribeToNewsletter(subscriber);

    // Create discount code
    const discountCode = await createDiscountCode(
      newSubscriber.id,
      subscriber.contactPreference || "whatsapp"
    );

    logger.debug("Discount code created", {
      subscriberId: newSubscriber.id,
      discountCode: discountCode.code,
      expiresAt: discountCode.expiresAt.toISOString(),
    });

    let deliveryStatus: "sent" | "failed" = "failed";

    // Send via preferred channel
    if (subscriber.contactPreference === "whatsapp" && subscriber.phone && subscriber.phoneCountryCode) {
      logger.info("Attempting WhatsApp delivery", {
        subscriberId: newSubscriber.id,
        phone: subscriber.phone,
        countryCode: subscriber.phoneCountryCode,
      });

      const result = await sendDiscountCodeViaWhatsApp(
        subscriber.phone,
        subscriber.phoneCountryCode,
        discountCode.code,
        discountCode.expiresAt
      );

      if (result.success) {
        deliveryStatus = "sent";
        await updateDeliveryStatus(discountCode.id, "sent");
        logger.info("WhatsApp delivery successful", {
          subscriberId: newSubscriber.id,
          messageId: result.messageId,
        });
      } else {
        logger.warn("WhatsApp delivery failed, attempting email fallback", {
          subscriberId: newSubscriber.id,
          error: result.error,
          email: subscriber.email,
        });

        // Auto-fallback to email
        const emailResult = await sendDiscountCodeViaEmail(
          subscriber.email,
          discountCode.code,
          discountCode.expiresAt
        );

        if (emailResult.success) {
          deliveryStatus = "sent";
          await updateDeliveryStatus(discountCode.id, "sent");
          logger.info("Email fallback delivery successful", {
            subscriberId: newSubscriber.id,
            messageId: emailResult.messageId,
          });
        } else {
          logger.error("Email fallback also failed", {
            subscriberId: newSubscriber.id,
            whatsappError: result.error,
            emailError: emailResult.error,
          });
          await updateDeliveryStatus(discountCode.id, "failed");
        }
      }
    } else if (subscriber.contactPreference === "email") {
      logger.info("Attempting email delivery", {
        subscriberId: newSubscriber.id,
        email: subscriber.email,
      });

      // Send discount code via email using Resend
      const emailResult = await sendDiscountCodeViaEmail(
        subscriber.email,
        discountCode.code,
        discountCode.expiresAt
      );

      if (emailResult.success) {
        deliveryStatus = "sent";
        await updateDeliveryStatus(discountCode.id, "sent");
        logger.info("Email delivery successful", {
          subscriberId: newSubscriber.id,
          messageId: emailResult.messageId,
        });
      } else {
        logger.error("Email delivery failed", {
          subscriberId: newSubscriber.id,
          email: subscriber.email,
          error: emailResult.error,
        });
        await updateDeliveryStatus(discountCode.id, "failed");
      }
    } else {
      logger.warn("No valid delivery channel configured", {
        subscriberId: newSubscriber.id,
        contactPreference: subscriber.contactPreference,
        hasPhone: !!subscriber.phone,
      });
    }

    logger.info("Subscription flow completed", {
      subscriberId: newSubscriber.id,
      discountCode: discountCode.code,
      deliveryStatus,
      channel: subscriber.contactPreference,
    });

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
