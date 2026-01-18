/**
 * Discount Code Service
 *
 * Handles generation, validation, and redemption of discount codes.
 */

import { eq, and, isNull, gt } from "drizzle-orm";
import * as schema from "@shared/schema";
import { type DiscountCode, type InsertDiscountCode } from "@shared/schema";
import { getDatabase } from "../storage";

// Characters used for code generation (excluding ambiguous characters like 0/O, 1/I)
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_PREFIX = "DISC";
const SEGMENT_LENGTH = 4;
const EXPIRATION_DAYS = 30;

/**
 * Generate a random alphanumeric segment
 */
function generateSegment(length: number): string {
  let segment = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * CODE_CHARS.length);
    segment += CODE_CHARS[randomIndex];
  }
  return segment;
}

/**
 * Calculate a simple checksum character for the code
 */
function calculateChecksum(input: string): string {
  let sum = 0;
  for (let i = 0; i < input.length; i++) {
    sum += input.charCodeAt(i) * (i + 1);
  }
  return CODE_CHARS[sum % CODE_CHARS.length];
}

/**
 * Generate a unique discount code
 * Format: DISC-XXXX-XXXX (e.g., DISC-A7B3-K9M2)
 */
export function generateDiscountCode(): string {
  const segment1 = generateSegment(SEGMENT_LENGTH);
  const segment2 = generateSegment(SEGMENT_LENGTH);
  const checksum = calculateChecksum(segment1 + segment2);
  return `${CODE_PREFIX}-${segment1}-${segment2}${checksum}`;
}

/**
 * Validate the format of a discount code
 */
export function validateCodeFormat(code: string): boolean {
  // Expected format: DISC-XXXX-XXXXX (4 + 4 + 1 checksum)
  const pattern = /^DISC-[A-Z2-9]{4}-[A-Z2-9]{5}$/;
  if (!pattern.test(code)) {
    return false;
  }

  // Verify checksum
  const parts = code.split("-");
  const segment1 = parts[1];
  const segment2WithChecksum = parts[2];
  const segment2 = segment2WithChecksum.slice(0, 4);
  const providedChecksum = segment2WithChecksum.slice(4);
  const calculatedChecksum = calculateChecksum(segment1 + segment2);

  return providedChecksum === calculatedChecksum;
}

/**
 * Calculate expiration date (30 days from now)
 */
export function calculateExpirationDate(): Date {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + EXPIRATION_DAYS);
  return expirationDate;
}

/**
 * Create a new discount code for a subscriber
 */
export async function createDiscountCode(
  subscriberId: string,
  deliveryChannel: "email" | "whatsapp"
): Promise<DiscountCode> {
  const database = await getDatabase();

  // Generate unique code (retry if collision)
  let code: string;
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    code = generateDiscountCode();

    // Check if code already exists
    const existing = await database
      .select()
      .from(schema.discountCodes)
      .where(eq(schema.discountCodes.code, code))
      .limit(1);

    if (existing.length === 0) {
      break;
    }
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error("Failed to generate unique discount code after multiple attempts");
  }

  const discountCodeData: InsertDiscountCode = {
    code: code!,
    type: "10_percent",
    value: "10.00",
    subscriberId,
    deliveryChannel,
    deliveryStatus: "pending",
    expiresAt: calculateExpirationDate(),
  };

  const [newCode] = await database
    .insert(schema.discountCodes)
    .values(discountCodeData)
    .returning();

  if (!newCode) {
    throw new Error("Failed to create discount code");
  }

  return newCode;
}

/**
 * Get discount code by code string
 */
export async function getDiscountCodeByCode(code: string): Promise<DiscountCode | null> {
  const database = await getDatabase();

  const [discountCode] = await database
    .select()
    .from(schema.discountCodes)
    .where(eq(schema.discountCodes.code, code.toUpperCase()))
    .limit(1);

  return discountCode || null;
}

/**
 * Get discount code for a subscriber
 */
export async function getDiscountCodeBySubscriberId(subscriberId: string): Promise<DiscountCode | null> {
  const database = await getDatabase();

  const [discountCode] = await database
    .select()
    .from(schema.discountCodes)
    .where(eq(schema.discountCodes.subscriberId, subscriberId))
    .limit(1);

  return discountCode || null;
}

/**
 * Validate a discount code for use
 */
export async function validateDiscountCode(code: string): Promise<{
  valid: boolean;
  code?: DiscountCode;
  error?: string;
}> {
  // First check format
  if (!validateCodeFormat(code.toUpperCase())) {
    return { valid: false, error: "Formato de código inválido" };
  }

  const discountCode = await getDiscountCodeByCode(code);

  if (!discountCode) {
    return { valid: false, error: "Código no encontrado" };
  }

  // Check if already redeemed
  if (discountCode.redeemedAt) {
    return { valid: false, error: "Este código ya ha sido utilizado" };
  }

  // Check if expired
  if (new Date() > discountCode.expiresAt) {
    return { valid: false, error: "Este código ha expirado" };
  }

  return { valid: true, code: discountCode };
}

/**
 * Redeem a discount code
 */
export async function redeemDiscountCode(
  code: string,
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  const validation = await validateDiscountCode(code);

  if (!validation.valid || !validation.code) {
    return { success: false, error: validation.error };
  }

  const database = await getDatabase();

  await database
    .update(schema.discountCodes)
    .set({
      redeemedAt: new Date(),
      redeemedOrderId: orderId,
    })
    .where(eq(schema.discountCodes.id, validation.code.id));

  return { success: true };
}

/**
 * Update delivery status of a discount code
 */
export async function updateDeliveryStatus(
  codeId: string,
  status: "pending" | "sent" | "failed",
  deliveredAt?: Date
): Promise<void> {
  const database = await getDatabase();

  await database
    .update(schema.discountCodes)
    .set({
      deliveryStatus: status,
      deliveredAt: deliveredAt || (status === "sent" ? new Date() : undefined),
    })
    .where(eq(schema.discountCodes.id, codeId));
}

/**
 * Get all active (non-redeemed, non-expired) discount codes
 */
export async function getActiveDiscountCodes(): Promise<DiscountCode[]> {
  const database = await getDatabase();

  const codes = await database
    .select()
    .from(schema.discountCodes)
    .where(
      and(
        isNull(schema.discountCodes.redeemedAt),
        gt(schema.discountCodes.expiresAt, new Date())
      )
    );

  return codes;
}
