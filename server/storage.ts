import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "@shared/schema";
import {
  type NewsletterSubscriber,
  type InsertNewsletterSubscriber,
} from "@shared/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

export interface IStorage {
  subscribeToNewsletter(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  getSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined>;
}

export class DbStorage implements IStorage {
  async subscribeToNewsletter(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const [newSubscriber] = await db
      .insert(schema.newsletterSubscribers)
      .values(subscriber)
      .returning();
    return newSubscriber;
  }

  async getSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined> {
    const [subscriber] = await db
      .select()
      .from(schema.newsletterSubscribers)
      .where(eq(schema.newsletterSubscribers.email, email));
    return subscriber;
  }
}

export const storage = new DbStorage();
