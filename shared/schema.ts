import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Newsletter Subscribers Table
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  phoneCountryCode: varchar("phone_country_code", { length: 5 }),
  contactPreference: varchar("contact_preference", { length: 10 }).notNull().default("whatsapp"),
  consentWhatsapp: boolean("consent_whatsapp").default(false),
  consentEmail: boolean("consent_email").default(true),
  subscribedAt: timestamp("subscribed_at").notNull().defaultNow(),
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({
  id: true,
  subscribedAt: true,
}).extend({
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  phoneCountryCode: z.string().optional(),
  contactPreference: z.enum(["email", "whatsapp"]).default("whatsapp"),
  consentWhatsapp: z.boolean().optional(),
  consentEmail: z.boolean().optional(),
});

export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;

// Discount Codes Table
export const discountCodes = pgTable("discount_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 16 }).unique().notNull(),
  type: varchar("type", { length: 20 }).notNull().default("10_percent"),
  value: decimal("value", { precision: 5, scale: 2 }).notNull().default("10.00"),
  subscriberId: varchar("subscriber_id").references(() => newsletterSubscribers.id),
  deliveryChannel: varchar("delivery_channel", { length: 10 }).notNull(), // 'email' or 'whatsapp'
  deliveryStatus: varchar("delivery_status", { length: 20 }).notNull().default("pending"), // pending, sent, failed
  deliveredAt: timestamp("delivered_at"),
  expiresAt: timestamp("expires_at").notNull(),
  redeemedAt: timestamp("redeemed_at"),
  redeemedOrderId: varchar("redeemed_order_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDiscountCodeSchema = createInsertSchema(discountCodes).omit({
  id: true,
  createdAt: true,
});

export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;
export type DiscountCode = typeof discountCodes.$inferSelect;
