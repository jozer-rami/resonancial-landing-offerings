# BNB QR Payment Integration - Detailed Implementation Plan

**Document Version:** 1.0
**Author:** Senior Payment Integration Engineer
**Date:** January 2026
**Status:** Technical Design Review

---

## Executive Summary

This document provides a production-grade implementation plan for integrating Banco Nacional de Bolivia (BNB) QR payments into the Resonancial platform. The integration enables customers to pay for spiritual wellness services using Bolivia's most widely adopted digital payment method.

### Business Context
- **Target Market:** Bolivia (primary currency: BOB - Boliviano)
- **Payment Method:** QR Simple via BNB Open Banking API
- **Use Cases:** Sessions, service packs, almanac purchases, gift card redemption

### Current State Assessment
| Component | Status | Notes |
|-----------|--------|-------|
| BNB API Client (`server/services/bnb-api.ts`) | ✅ Scaffolded | Auth, QR generation, status check methods exist |
| Database Schema | ⚠️ Incomplete | Orders/payments tables not in `schema.ts` |
| API Routes | ⚠️ Incomplete | No order/payment endpoints in `routes.ts` |
| Frontend Checkout | ❌ Not Started | No checkout page or QR display component |
| Webhook Handling | ❌ Not Started | No payment confirmation webhooks |
| Error Recovery | ❌ Not Started | No retry logic or failure handling |

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [BNB API Integration Details](#2-bnb-api-integration-details)
3. [Database Schema Design](#3-database-schema-design)
4. [Backend Implementation](#4-backend-implementation)
5. [Frontend Implementation](#5-frontend-implementation)
6. [Security Considerations](#6-security-considerations)
7. [Error Handling & Recovery](#7-error-handling--recovery)
8. [Testing Strategy](#8-testing-strategy)
9. [Monitoring & Observability](#9-monitoring--observability)
10. [Deployment & Rollout](#10-deployment--rollout)
11. [Risk Assessment](#11-risk-assessment)
12. [Implementation Checklist](#12-implementation-checklist)

---

## 1. Architecture Overview

### 1.1 Payment Flow Sequence

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Client  │    │  Server  │    │  BNB API │    │ Customer │    │  Server  │
│ (React)  │    │(Express) │    │          │    │  Bank    │    │(Polling) │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │               │
     │ 1. Create Order               │               │               │
     │──────────────>│               │               │               │
     │               │               │               │               │
     │               │ 2. Generate QR│               │               │
     │               │──────────────>│               │               │
     │               │               │               │               │
     │               │ 3. QR Image + │               │               │
     │               │    Metadata   │               │               │
     │               │<──────────────│               │               │
     │               │               │               │               │
     │ 4. Order +    │               │               │               │
     │    QR Data    │               │               │               │
     │<──────────────│               │               │               │
     │               │               │               │               │
     │ 5. Display QR │               │               │               │
     │    to User    │               │               │               │
     │               │               │               │               │
     │               │               │ 6. Customer   │               │
     │               │               │    Scans QR   │               │
     │               │               │<──────────────│               │
     │               │               │               │               │
     │               │               │ 7. Payment    │               │
     │               │               │    Confirmed  │               │
     │               │               │──────────────>│               │
     │               │               │               │               │
     │ 8. Poll Status│               │               │               │
     │──────────────>│               │               │               │
     │               │ 9. Check QR   │               │               │
     │               │    Status     │               │               │
     │               │──────────────>│               │               │
     │               │               │               │               │
     │               │ 10. Status:   │               │               │
     │               │     PAID      │               │               │
     │               │<──────────────│               │               │
     │               │               │               │               │
     │ 11. Payment   │               │               │               │
     │     Success   │               │               │               │
     │<──────────────│               │               │               │
     │               │               │               │               │
     │               │ 12. Trigger   │               │               │
     │               │     Fulfillment               │               │
     │               │───────────────────────────────────────────────>
```

### 1.2 System Components

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Vercel)                              │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │   Product   │  │  Checkout   │  │  QR Display │  │   Payment   │   │
│  │  Selection  │──│    Form     │──│  Component  │──│   Success   │   │
│  │  Component  │  │  Component  │  │             │  │    Page     │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS (VITE_API_URL)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (Railway)                              │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        Express Routes                            │   │
│  │  POST /api/orders/create     GET /api/orders/:id/status         │   │
│  │  POST /api/orders/:id/verify POST /api/orders/:id/cancel        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│  ┌─────────────┐  ┌─────────────┐  │  ┌─────────────────────────────┐  │
│  │   Order     │  │   Payment   │  │  │      BNB API Client         │  │
│  │   Service   │──│   Service   │──┼──│  - Authentication           │  │
│  │             │  │             │  │  │  - QR Generation            │  │
│  └─────────────┘  └─────────────┘  │  │  - Status Verification      │  │
│         │               │          │  └─────────────────────────────┘  │
│         ▼               ▼          │                │                   │
│  ┌─────────────────────────────┐   │                ▼                   │
│  │      PostgreSQL (Supabase)  │   │    ┌─────────────────────────┐    │
│  │  - orders                   │   │    │    BNB Open Banking     │    │
│  │  - payment_qrs              │   │    │    API (External)       │    │
│  │  - payment_verifications    │   │    └─────────────────────────┘    │
│  │  - order_events             │   │                                    │
│  └─────────────────────────────┘   │                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. BNB API Integration Details

### 2.1 API Endpoints Reference

Based on BNB Open Banking documentation:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/ClientAuthentication.API/api/v1/auth/token` | POST | Obtain bearer token |
| `/main/getQRWithImageAsync` | POST | Generate QR with base64 image |
| `/main/getQRStatusAsync` | GET | Check payment status |
| `/main/getQRbyGenerationDateAsync` | GET | List QRs by date (reconciliation) |
| `/Enterprise/TransferQR` | POST | Simple transfer QR (alternative) |

### 2.2 Authentication Flow

```typescript
// Authentication Request
POST /ClientAuthentication.API/api/v1/auth/token
Content-Type: application/json

{
  "accountId": "encrypted_account_id",
  "authorizationId": "encrypted_authorization_id"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600  // seconds
}
```

**Token Management Strategy:**
- Cache tokens with 5-minute buffer before expiration
- Implement automatic refresh on 401 responses
- Store token in memory (not database) - stateless design

### 2.3 QR Generation Request

```typescript
// QR Generation Request
POST /main/getQRWithImageAsync
Authorization: Bearer {token}
Content-Type: application/json

{
  "currency": 1,              // 1 = BOB, 2 = USD
  "amount": 500.00,           // Decimal amount
  "reference": "ORD-123456",  // Our order ID
  "expirationDate": "2026-01-27",  // YYYY-MM-DD
  "singleUse": true,          // One-time payment
  "description": "Resonancial - Pack Despertar"
}

// Response
{
  "qrId": "QR-BNB-789012",
  "qrImage": "iVBORw0KGgoAAAANSUhEUgAA...",  // Base64 PNG
  "qrContent": "00020101021226...",           // EMV QR string
  "expirationDate": "2026-01-27T23:59:59Z",
  "status": "PENDING"
}
```

### 2.4 Status Check Response Codes

| Status | Meaning | Action |
|--------|---------|--------|
| `PENDING` | QR generated, awaiting scan | Continue polling |
| `SCANNED` | Customer scanned but not confirmed | Continue polling |
| `PAID` | Payment successful | Mark order paid, fulfill |
| `EXPIRED` | QR validity period ended | Offer regeneration |
| `CANCELLED` | Customer/bank cancelled | Mark order cancelled |
| `ERROR` | Processing error | Log, notify, manual review |

### 2.5 Rate Limits & Quotas

Based on standard Open Banking practices:
- **Authentication:** 10 requests/minute per credential
- **QR Generation:** 100 requests/minute per account
- **Status Check:** 60 requests/minute per QR ID
- **Recommended Polling Interval:** 5 seconds minimum

---

## 3. Database Schema Design

### 3.1 Entity Relationship Diagram

```
┌─────────────────────┐       ┌─────────────────────┐
│       orders        │       │    order_items      │
├─────────────────────┤       ├─────────────────────┤
│ id (PK)             │──────<│ id (PK)             │
│ order_number        │       │ order_id (FK)       │
│ status              │       │ product_type        │
│ total_amount        │       │ product_id          │
│ currency            │       │ quantity            │
│ customer_email      │       │ unit_price          │
│ customer_name       │       │ subtotal            │
│ customer_phone      │       │ metadata (JSONB)    │
│ discount_code_id(FK)│       └─────────────────────┘
│ discount_amount     │
│ payment_provider    │       ┌─────────────────────┐
│ payment_qr_id (FK)  │──────>│    payment_qrs      │
│ paid_at             │       ├─────────────────────┤
│ expires_at          │       │ id (PK)             │
│ metadata (JSONB)    │       │ bnb_qr_id           │
│ created_at          │       │ qr_image_base64     │
│ updated_at          │       │ qr_content          │
└─────────────────────┘       │ amount              │
         │                    │ currency            │
         │                    │ reference           │
         ▼                    │ status              │
┌─────────────────────┐       │ expires_at          │
│    order_events     │       │ created_at          │
├─────────────────────┤       │ updated_at          │
│ id (PK)             │       └─────────────────────┘
│ order_id (FK)       │                │
│ event_type          │                │
│ event_data (JSONB)  │                ▼
│ created_at          │       ┌─────────────────────┐
└─────────────────────┘       │payment_verifications│
                              ├─────────────────────┤
                              │ id (PK)             │
                              │ payment_qr_id (FK)  │
                              │ bnb_status          │
                              │ bnb_transaction_id  │
                              │ bnb_response (JSONB)│
                              │ verified_at         │
                              │ created_at          │
                              └─────────────────────┘
```

### 3.2 Drizzle Schema Definition

```typescript
// shared/schema.ts - New tables to add

import { sql } from "drizzle-orm";
import {
  pgTable, pgEnum, text, varchar, timestamp,
  boolean, decimal, integer, jsonb, index
} from "drizzle-orm/pg-core";

// Enums
export const orderStatusEnum = pgEnum('order_status', [
  'pending',      // Order created, awaiting payment
  'processing',   // Payment in progress (QR scanned)
  'paid',         // Payment confirmed
  'fulfilled',    // Product/service delivered
  'failed',       // Payment failed
  'cancelled',    // User/admin cancelled
  'expired',      // QR expired without payment
  'refunded'      // Payment refunded
]);

export const paymentProviderEnum = pgEnum('payment_provider', [
  'bnb_qr',       // BNB QR Simple
  'stripe',       // Future: Stripe
  'manual'        // Manual/WhatsApp coordination
]);

export const qrStatusEnum = pgEnum('qr_status', [
  'pending',      // Generated, awaiting scan
  'scanned',      // Scanned but not confirmed
  'paid',         // Payment completed
  'expired',      // Validity period ended
  'cancelled',    // Cancelled by user/bank
  'error'         // Processing error
]);

export const productTypeEnum = pgEnum('product_type', [
  'session',      // Individual session
  'pack',         // Service pack (e.g., Pack Despertar)
  'almanac',      // Almanaque Ritual
  'gift_card'     // Gift card purchase
]);

export const orderEventTypeEnum = pgEnum('order_event_type', [
  'created',
  'qr_generated',
  'qr_scanned',
  'payment_verified',
  'payment_confirmed',
  'payment_failed',
  'fulfilled',
  'cancelled',
  'expired',
  'refunded',
  'manual_review'
]);

// Orders Table
export const orders = pgTable('orders', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: varchar('order_number', { length: 20 }).unique().notNull(),
  status: orderStatusEnum('status').notNull().default('pending'),

  // Pricing
  subtotalAmount: decimal('subtotal_amount', { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0.00'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('BOB'),

  // Customer Info
  customerEmail: text('customer_email').notNull(),
  customerName: text('customer_name').notNull(),
  customerPhone: varchar('customer_phone', { length: 20 }),

  // Discount Code (optional)
  discountCodeId: varchar('discount_code_id').references(() => discountCodes.id),

  // Payment
  paymentProvider: paymentProviderEnum('payment_provider').notNull().default('bnb_qr'),
  paymentQrId: varchar('payment_qr_id'),  // FK added after payment_qrs table
  paidAt: timestamp('paid_at'),

  // Expiration
  expiresAt: timestamp('expires_at').notNull(),

  // Metadata for flexibility
  metadata: jsonb('metadata').$type<{
    userAgent?: string;
    ipHash?: string;
    source?: string;
    notes?: string;
  }>(),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  statusIdx: index('orders_status_idx').on(table.status),
  customerEmailIdx: index('orders_customer_email_idx').on(table.customerEmail),
  orderNumberIdx: index('orders_order_number_idx').on(table.orderNumber),
  createdAtIdx: index('orders_created_at_idx').on(table.createdAt),
}));

// Order Items Table
export const orderItems = pgTable('order_items', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),

  productType: productTypeEnum('product_type').notNull(),
  productId: varchar('product_id', { length: 50 }).notNull(),  // e.g., 'pack_despertar', 'session_individual'
  productName: text('product_name').notNull(),

  quantity: integer('quantity').notNull().default(1),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),

  // Product-specific metadata
  metadata: jsonb('metadata').$type<{
    sessionType?: string;
    duration?: number;
    recipientEmail?: string;  // For gift cards
    recipientName?: string;
    personalMessage?: string;
  }>(),

  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  orderIdIdx: index('order_items_order_id_idx').on(table.orderId),
}));

// Payment QRs Table
export const paymentQrs = pgTable('payment_qrs', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),

  // BNB-specific fields
  bnbQrId: varchar('bnb_qr_id', { length: 100 }),  // ID returned by BNB
  qrImageBase64: text('qr_image_base64'),          // Base64 encoded PNG
  qrContent: text('qr_content'),                   // EMV QR string for regeneration

  // Payment details
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('BOB'),
  reference: varchar('reference', { length: 50 }).notNull(),

  // Status tracking
  status: qrStatusEnum('status').notNull().default('pending'),

  // Expiration
  expiresAt: timestamp('expires_at').notNull(),

  // BNB transaction details (populated on payment confirmation)
  bnbTransactionId: varchar('bnb_transaction_id', { length: 100 }),
  bnbPaidAt: timestamp('bnb_paid_at'),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  orderIdIdx: index('payment_qrs_order_id_idx').on(table.orderId),
  bnbQrIdIdx: index('payment_qrs_bnb_qr_id_idx').on(table.bnbQrId),
  statusIdx: index('payment_qrs_status_idx').on(table.status),
}));

// Payment Verifications Table (Audit Log)
export const paymentVerifications = pgTable('payment_verifications', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  paymentQrId: varchar('payment_qr_id').notNull().references(() => paymentQrs.id, { onDelete: 'cascade' }),

  // BNB response data
  bnbStatus: varchar('bnb_status', { length: 20 }).notNull(),
  bnbTransactionId: varchar('bnb_transaction_id', { length: 100 }),
  bnbResponse: jsonb('bnb_response'),  // Full API response for debugging

  // Timestamps
  verifiedAt: timestamp('verified_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  paymentQrIdIdx: index('payment_verifications_qr_id_idx').on(table.paymentQrId),
}));

// Order Events Table (State Machine Audit Log)
export const orderEvents = pgTable('order_events', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),

  eventType: orderEventTypeEnum('event_type').notNull(),
  eventData: jsonb('event_data').$type<{
    previousStatus?: string;
    newStatus?: string;
    triggeredBy?: 'system' | 'user' | 'admin' | 'bnb_webhook';
    reason?: string;
    metadata?: Record<string, unknown>;
  }>(),

  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  orderIdIdx: index('order_events_order_id_idx').on(table.orderId),
  eventTypeIdx: index('order_events_event_type_idx').on(table.eventType),
  createdAtIdx: index('order_events_created_at_idx').on(table.createdAt),
}));

// Zod schemas for validation
export const createOrderSchema = z.object({
  items: z.array(z.object({
    productType: z.enum(['session', 'pack', 'almanac', 'gift_card']),
    productId: z.string().min(1),
    productName: z.string().min(1),
    quantity: z.number().int().positive().default(1),
    unitPrice: z.number().positive(),
    metadata: z.object({
      sessionType: z.string().optional(),
      duration: z.number().optional(),
      recipientEmail: z.string().email().optional(),
      recipientName: z.string().optional(),
      personalMessage: z.string().optional(),
    }).optional(),
  })).min(1),
  customerEmail: z.string().email(),
  customerName: z.string().min(2),
  customerPhone: z.string().optional(),
  discountCode: z.string().optional(),
  currency: z.enum(['BOB', 'USD']).default('BOB'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type PaymentQr = typeof paymentQrs.$inferSelect;
export type PaymentVerification = typeof paymentVerifications.$inferSelect;
export type OrderEvent = typeof orderEvents.$inferSelect;
```

### 3.3 Product Catalog Configuration

```typescript
// server/config/products.ts

export interface Product {
  id: string;
  type: 'session' | 'pack' | 'almanac' | 'gift_card';
  name: string;
  description: string;
  price: {
    BOB: number;
    USD?: number;
  };
  duration?: number;  // minutes, for sessions
  includes?: string[];
  isActive: boolean;
}

export const PRODUCTS: Record<string, Product> = {
  // Individual Sessions
  'session_individual': {
    id: 'session_individual',
    type: 'session',
    name: 'Sesión Individual',
    description: 'Sesión de coaching de bienestar individual',
    price: { BOB: 200, USD: 29 },
    duration: 60,
    isActive: true,
  },

  // Packs
  'pack_despertar': {
    id: 'pack_despertar',
    type: 'pack',
    name: 'Pack Despertar',
    description: '4 sesiones de frecuencias + guía personalizada',
    price: { BOB: 700, USD: 100 },
    includes: [
      '4 sesiones de frecuencias',
      'Guía de meditación personalizada',
      'Soporte por WhatsApp',
    ],
    isActive: true,
  },

  'pack_transformacion': {
    id: 'pack_transformacion',
    type: 'pack',
    name: 'Pack Transformación',
    description: '8 sesiones + acompañamiento completo',
    price: { BOB: 1200, USD: 170 },
    includes: [
      '8 sesiones de frecuencias',
      'Guía de meditación personalizada',
      'Llamada de seguimiento semanal',
      'Soporte prioritario por WhatsApp',
    ],
    isActive: true,
  },

  // Almanac
  'almanaque_ritual_2026': {
    id: 'almanaque_ritual_2026',
    type: 'almanac',
    name: 'Almanaque Ritual 2026',
    description: 'Guía astrológica y ritual para todo el año',
    price: { BOB: 150, USD: 22 },
    isActive: true,
  },

  // Gift Card (variable amount)
  'gift_card': {
    id: 'gift_card',
    type: 'gift_card',
    name: 'Tarjeta de Regalo',
    description: 'Regalo de bienestar para alguien especial',
    price: { BOB: 0 },  // Variable
    isActive: true,
  },
};

export function getProduct(productId: string): Product | undefined {
  return PRODUCTS[productId];
}

export function calculatePrice(productId: string, currency: 'BOB' | 'USD' = 'BOB'): number {
  const product = getProduct(productId);
  if (!product) throw new Error(`Product not found: ${productId}`);
  return product.price[currency] ?? product.price.BOB;
}
```

---

## 4. Backend Implementation

### 4.1 Order Service

```typescript
// server/services/order-service.ts

import { getDatabase } from '../storage';
import { orders, orderItems, orderEvents, paymentQrs } from '@shared/schema';
import type { CreateOrderInput, Order, OrderItem, PaymentQr } from '@shared/schema';
import { getProduct, calculatePrice } from '../config/products';
import { validateDiscountCode, redeemDiscountCode } from './discount-code';
import { bnbApi } from './bnb-api';
import { eq } from 'drizzle-orm';
import { loggers } from '../lib/logger';
import { nanoid } from 'nanoid';

const logger = loggers.orders;

// Order number format: RES-YYMMDD-XXXXX
function generateOrderNumber(): string {
  const date = new Date();
  const yy = date.getFullYear().toString().slice(-2);
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  const random = nanoid(5).toUpperCase();
  return `RES-${yy}${mm}${dd}-${random}`;
}

export interface CreateOrderResult {
  order: Order;
  items: OrderItem[];
  paymentQr: PaymentQr;
  qrImageUrl: string;  // Data URL for direct display
}

export class OrderService {
  /**
   * Create a new order with QR payment
   */
  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    const db = await getDatabase();
    const orderNumber = generateOrderNumber();

    logger.info('Creating order', { orderNumber, customerEmail: input.customerEmail });

    // Validate products and calculate pricing
    let subtotal = 0;
    const validatedItems = input.items.map(item => {
      const product = getProduct(item.productId);
      if (!product || !product.isActive) {
        throw new Error(`Invalid or inactive product: ${item.productId}`);
      }

      const unitPrice = item.productType === 'gift_card'
        ? item.unitPrice  // Gift cards have custom amounts
        : calculatePrice(item.productId, input.currency);

      const itemSubtotal = unitPrice * item.quantity;
      subtotal += itemSubtotal;

      return {
        ...item,
        productName: product.name,
        unitPrice,
        subtotal: itemSubtotal,
      };
    });

    // Apply discount code if provided
    let discountAmount = 0;
    let discountCodeId: string | null = null;

    if (input.discountCode) {
      const discountResult = await validateDiscountCode(input.discountCode);
      if (discountResult.valid && discountResult.code) {
        discountCodeId = discountResult.code.id;
        const discountValue = parseFloat(discountResult.code.value);
        // Assuming percentage discount
        discountAmount = (subtotal * discountValue) / 100;
        logger.info('Discount applied', {
          code: input.discountCode,
          discountAmount,
          percentage: discountValue
        });
      } else {
        throw new Error(`Invalid discount code: ${discountResult.error}`);
      }
    }

    const totalAmount = subtotal - discountAmount;

    // Set expiration (24 hours for QR payments)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create order in transaction
    return await db.transaction(async (tx) => {
      // Insert order
      const [order] = await tx
        .insert(orders)
        .values({
          orderNumber,
          status: 'pending',
          subtotalAmount: subtotal.toFixed(2),
          discountAmount: discountAmount.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
          currency: input.currency,
          customerEmail: input.customerEmail,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          discountCodeId,
          paymentProvider: 'bnb_qr',
          expiresAt,
          metadata: {
            source: 'web',
          },
        })
        .returning();

      // Insert order items
      const items = await tx
        .insert(orderItems)
        .values(validatedItems.map(item => ({
          orderId: order.id,
          productType: item.productType,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toFixed(2),
          subtotal: item.subtotal.toFixed(2),
          metadata: item.metadata,
        })))
        .returning();

      // Generate BNB QR code
      const qrResponse = await bnbApi.generateQrCode({
        amount: totalAmount,
        currency: input.currency as 'BOB' | 'USD',
        reference: orderNumber,
        serviceCode: 'RESONANCIAL',
        expiresInDays: 1,
      });

      // Store QR details
      const [paymentQr] = await tx
        .insert(paymentQrs)
        .values({
          orderId: order.id,
          bnbQrId: qrResponse.qrId,
          qrImageBase64: qrResponse.qrContent,  // Base64 image
          qrContent: qrResponse.qrContent,
          amount: totalAmount.toFixed(2),
          currency: input.currency,
          reference: orderNumber,
          status: 'pending',
          expiresAt: new Date(qrResponse.expiresAt),
        })
        .returning();

      // Update order with QR reference
      await tx
        .update(orders)
        .set({ paymentQrId: paymentQr.id })
        .where(eq(orders.id, order.id));

      // Log event
      await tx.insert(orderEvents).values({
        orderId: order.id,
        eventType: 'created',
        eventData: {
          previousStatus: null,
          newStatus: 'pending',
          triggeredBy: 'user',
        },
      });

      await tx.insert(orderEvents).values({
        orderId: order.id,
        eventType: 'qr_generated',
        eventData: {
          bnbQrId: qrResponse.qrId,
          expiresAt: qrResponse.expiresAt,
        },
      });

      logger.info('Order created successfully', {
        orderId: order.id,
        orderNumber,
        totalAmount,
        currency: input.currency,
        bnbQrId: qrResponse.qrId,
      });

      return {
        order: { ...order, paymentQrId: paymentQr.id },
        items,
        paymentQr,
        qrImageUrl: `data:image/png;base64,${qrResponse.qrContent}`,
      };
    });
  }

  /**
   * Get order by ID with related data
   */
  async getOrder(orderId: string): Promise<{
    order: Order;
    items: OrderItem[];
    paymentQr: PaymentQr | null;
  } | null> {
    const db = await getDatabase();

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));

    if (!order) return null;

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    let paymentQr: PaymentQr | null = null;
    if (order.paymentQrId) {
      const [qr] = await db
        .select()
        .from(paymentQrs)
        .where(eq(paymentQrs.id, order.paymentQrId));
      paymentQr = qr || null;
    }

    return { order, items, paymentQr };
  }

  /**
   * Get order by order number (public-facing)
   */
  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const db = await getDatabase();
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, orderNumber));
    return order || null;
  }

  /**
   * Verify payment status with BNB
   */
  async verifyPayment(orderId: string): Promise<{
    status: string;
    isPaid: boolean;
    transactionId?: string;
  }> {
    const db = await getDatabase();
    const orderData = await this.getOrder(orderId);

    if (!orderData) {
      throw new Error('Order not found');
    }

    if (!orderData.paymentQr?.bnbQrId) {
      throw new Error('No QR code associated with order');
    }

    // Check with BNB API
    const bnbStatus = await bnbApi.checkQrStatus(orderData.paymentQr.bnbQrId);

    // Log verification attempt
    await db.insert(paymentVerifications).values({
      paymentQrId: orderData.paymentQr.id,
      bnbStatus: bnbStatus.status,
      bnbTransactionId: bnbStatus.transactionId,
      bnbResponse: bnbStatus,
    });

    logger.info('Payment verification', {
      orderId,
      bnbQrId: orderData.paymentQr.bnbQrId,
      status: bnbStatus.status,
    });

    // Update status if payment confirmed
    if (bnbStatus.status === 'paid' && orderData.order.status !== 'paid') {
      await this.markOrderPaid(orderId, bnbStatus.transactionId!);
    }

    // Handle expired QR
    if (bnbStatus.status === 'expired' && orderData.order.status === 'pending') {
      await this.markOrderExpired(orderId);
    }

    return {
      status: bnbStatus.status,
      isPaid: bnbStatus.status === 'paid',
      transactionId: bnbStatus.transactionId,
    };
  }

  /**
   * Mark order as paid
   */
  private async markOrderPaid(orderId: string, transactionId: string): Promise<void> {
    const db = await getDatabase();

    await db.transaction(async (tx) => {
      const [order] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, orderId));

      // Update order status
      await tx
        .update(orders)
        .set({
          status: 'paid',
          paidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));

      // Update QR status
      if (order.paymentQrId) {
        await tx
          .update(paymentQrs)
          .set({
            status: 'paid',
            bnbTransactionId: transactionId,
            bnbPaidAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(paymentQrs.id, order.paymentQrId));
      }

      // Log event
      await tx.insert(orderEvents).values({
        orderId,
        eventType: 'payment_confirmed',
        eventData: {
          previousStatus: order.status,
          newStatus: 'paid',
          triggeredBy: 'system',
          metadata: { transactionId },
        },
      });

      // Redeem discount code if used
      if (order.discountCodeId) {
        await redeemDiscountCode(order.discountCodeId, orderId);
      }
    });

    logger.info('Order marked as paid', { orderId, transactionId });

    // TODO: Trigger fulfillment (email, etc.)
    // await this.triggerFulfillment(orderId);
  }

  /**
   * Mark order as expired
   */
  private async markOrderExpired(orderId: string): Promise<void> {
    const db = await getDatabase();

    await db.transaction(async (tx) => {
      const [order] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, orderId));

      await tx
        .update(orders)
        .set({
          status: 'expired',
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));

      if (order.paymentQrId) {
        await tx
          .update(paymentQrs)
          .set({
            status: 'expired',
            updatedAt: new Date(),
          })
          .where(eq(paymentQrs.id, order.paymentQrId));
      }

      await tx.insert(orderEvents).values({
        orderId,
        eventType: 'expired',
        eventData: {
          previousStatus: order.status,
          newStatus: 'expired',
          triggeredBy: 'system',
        },
      });
    });

    logger.info('Order marked as expired', { orderId });
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<void> {
    const db = await getDatabase();

    await db.transaction(async (tx) => {
      const [order] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, orderId));

      if (!order) throw new Error('Order not found');

      if (['paid', 'fulfilled', 'refunded'].includes(order.status)) {
        throw new Error(`Cannot cancel order in ${order.status} status`);
      }

      await tx
        .update(orders)
        .set({
          status: 'cancelled',
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));

      if (order.paymentQrId) {
        await tx
          .update(paymentQrs)
          .set({
            status: 'cancelled',
            updatedAt: new Date(),
          })
          .where(eq(paymentQrs.id, order.paymentQrId));
      }

      await tx.insert(orderEvents).values({
        orderId,
        eventType: 'cancelled',
        eventData: {
          previousStatus: order.status,
          newStatus: 'cancelled',
          triggeredBy: 'user',
          reason,
        },
      });
    });

    logger.info('Order cancelled', { orderId, reason });
  }

  /**
   * Regenerate QR for expired order
   */
  async regenerateQr(orderId: string): Promise<{
    paymentQr: PaymentQr;
    qrImageUrl: string;
  }> {
    const db = await getDatabase();
    const orderData = await this.getOrder(orderId);

    if (!orderData) throw new Error('Order not found');

    if (!['pending', 'expired'].includes(orderData.order.status)) {
      throw new Error('Can only regenerate QR for pending or expired orders');
    }

    // Generate new QR
    const qrResponse = await bnbApi.generateQrCode({
      amount: parseFloat(orderData.order.totalAmount),
      currency: orderData.order.currency as 'BOB' | 'USD',
      reference: orderData.order.orderNumber,
      serviceCode: 'RESONANCIAL',
      expiresInDays: 1,
    });

    // Update existing QR or create new
    const [paymentQr] = await db
      .update(paymentQrs)
      .set({
        bnbQrId: qrResponse.qrId,
        qrImageBase64: qrResponse.qrContent,
        qrContent: qrResponse.qrContent,
        status: 'pending',
        expiresAt: new Date(qrResponse.expiresAt),
        updatedAt: new Date(),
      })
      .where(eq(paymentQrs.id, orderData.paymentQr!.id))
      .returning();

    // Reset order status if expired
    if (orderData.order.status === 'expired') {
      await db
        .update(orders)
        .set({
          status: 'pending',
          expiresAt: new Date(qrResponse.expiresAt),
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));
    }

    await db.insert(orderEvents).values({
      orderId,
      eventType: 'qr_generated',
      eventData: {
        bnbQrId: qrResponse.qrId,
        expiresAt: qrResponse.expiresAt,
        metadata: { regenerated: true },
      },
    });

    logger.info('QR regenerated', { orderId, newBnbQrId: qrResponse.qrId });

    return {
      paymentQr,
      qrImageUrl: `data:image/png;base64,${qrResponse.qrContent}`,
    };
  }
}

export const orderService = new OrderService();
```

### 4.2 API Routes

```typescript
// server/routes/orders.ts

import { Router, Request, Response } from 'express';
import { orderService } from '../services/order-service';
import { createOrderSchema } from '@shared/schema';
import { fromZodError } from 'zod-validation-error';
import { loggers } from '../lib/logger';
import { z } from 'zod';

const router = Router();
const logger = loggers.routes;

/**
 * POST /api/orders/create
 * Create a new order and generate BNB QR code
 */
router.post('/create', async (req: Request, res: Response) => {
  const reqLogger = logger.withRequestId(req.requestId);

  try {
    reqLogger.info('Create order request', {
      customerEmail: req.body?.customerEmail,
      itemCount: req.body?.items?.length,
    });

    const validationResult = createOrderSchema.safeParse(req.body);
    if (!validationResult.success) {
      const readableError = fromZodError(validationResult.error);
      reqLogger.warn('Validation failed', { error: readableError.message });
      return res.status(400).json({ error: readableError.message });
    }

    const result = await orderService.createOrder(validationResult.data);

    reqLogger.info('Order created', {
      orderId: result.order.id,
      orderNumber: result.order.orderNumber,
    });

    return res.status(201).json({
      success: true,
      order: {
        id: result.order.id,
        orderNumber: result.order.orderNumber,
        status: result.order.status,
        totalAmount: result.order.totalAmount,
        currency: result.order.currency,
        expiresAt: result.order.expiresAt,
      },
      items: result.items.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
      payment: {
        provider: 'bnb_qr',
        qrImageUrl: result.qrImageUrl,
        expiresAt: result.paymentQr.expiresAt,
      },
    });
  } catch (error) {
    reqLogger.errorWithData(
      'Order creation failed',
      { customerEmail: req.body?.customerEmail },
      error instanceof Error ? error : new Error(String(error))
    );

    const message = error instanceof Error ? error.message : 'Failed to create order';
    return res.status(500).json({ error: message });
  }
});

/**
 * GET /api/orders/:orderId/status
 * Get order status and payment information
 */
router.get('/:orderId/status', async (req: Request, res: Response) => {
  const reqLogger = logger.withRequestId(req.requestId);
  const { orderId } = req.params;

  try {
    reqLogger.info('Order status request', { orderId });

    const orderData = await orderService.getOrder(orderId);

    if (!orderData) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.json({
      success: true,
      order: {
        id: orderData.order.id,
        orderNumber: orderData.order.orderNumber,
        status: orderData.order.status,
        totalAmount: orderData.order.totalAmount,
        currency: orderData.order.currency,
        paidAt: orderData.order.paidAt,
        expiresAt: orderData.order.expiresAt,
      },
      payment: orderData.paymentQr ? {
        status: orderData.paymentQr.status,
        qrImageUrl: orderData.paymentQr.qrImageBase64
          ? `data:image/png;base64,${orderData.paymentQr.qrImageBase64}`
          : null,
        expiresAt: orderData.paymentQr.expiresAt,
      } : null,
    });
  } catch (error) {
    reqLogger.errorWithData(
      'Order status fetch failed',
      { orderId },
      error instanceof Error ? error : new Error(String(error))
    );
    return res.status(500).json({ error: 'Failed to fetch order status' });
  }
});

/**
 * POST /api/orders/:orderId/verify-payment
 * Manually trigger payment verification with BNB
 */
router.post('/:orderId/verify-payment', async (req: Request, res: Response) => {
  const reqLogger = logger.withRequestId(req.requestId);
  const { orderId } = req.params;

  try {
    reqLogger.info('Payment verification request', { orderId });

    const result = await orderService.verifyPayment(orderId);

    reqLogger.info('Payment verification result', {
      orderId,
      status: result.status,
      isPaid: result.isPaid,
    });

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    reqLogger.errorWithData(
      'Payment verification failed',
      { orderId },
      error instanceof Error ? error : new Error(String(error))
    );

    const message = error instanceof Error ? error.message : 'Failed to verify payment';
    return res.status(500).json({ error: message });
  }
});

/**
 * POST /api/orders/:orderId/cancel
 * Cancel a pending order
 */
router.post('/:orderId/cancel', async (req: Request, res: Response) => {
  const reqLogger = logger.withRequestId(req.requestId);
  const { orderId } = req.params;
  const { reason } = req.body;

  try {
    reqLogger.info('Order cancellation request', { orderId, reason });

    await orderService.cancelOrder(orderId, reason);

    return res.json({
      success: true,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    reqLogger.errorWithData(
      'Order cancellation failed',
      { orderId },
      error instanceof Error ? error : new Error(String(error))
    );

    const message = error instanceof Error ? error.message : 'Failed to cancel order';
    return res.status(400).json({ error: message });
  }
});

/**
 * POST /api/orders/:orderId/regenerate-qr
 * Regenerate QR code for expired orders
 */
router.post('/:orderId/regenerate-qr', async (req: Request, res: Response) => {
  const reqLogger = logger.withRequestId(req.requestId);
  const { orderId } = req.params;

  try {
    reqLogger.info('QR regeneration request', { orderId });

    const result = await orderService.regenerateQr(orderId);

    return res.json({
      success: true,
      payment: {
        qrImageUrl: result.qrImageUrl,
        expiresAt: result.paymentQr.expiresAt,
      },
    });
  } catch (error) {
    reqLogger.errorWithData(
      'QR regeneration failed',
      { orderId },
      error instanceof Error ? error : new Error(String(error))
    );

    const message = error instanceof Error ? error.message : 'Failed to regenerate QR';
    return res.status(400).json({ error: message });
  }
});

export default router;
```

### 4.3 Enhanced BNB API Client

```typescript
// server/services/bnb-api.ts - Enhanced version

import { loggers } from '../lib/logger';

const logger = loggers.bnb;

interface BnbConfig {
  baseUrl: string;
  accountId: string;
  authorizationId: string;
  isSandbox: boolean;
}

interface BnbAuthResponse {
  token: string;
  expiresIn: number;
  tokenType?: string;
}

interface BnbQrRequest {
  currency: number;           // 1 = BOB, 2 = USD
  amount: number;
  reference: string;
  expirationDate: string;     // YYYY-MM-DD
  singleUse: boolean;
  description?: string;
}

interface BnbQrResponse {
  qrId: string;
  qrImage: string;            // Base64 PNG
  qrContent: string;          // EMV QR string
  expirationDate: string;
  status: string;
}

interface BnbQrStatusResponse {
  qrId: string;
  status: 'PENDING' | 'SCANNED' | 'PAID' | 'EXPIRED' | 'CANCELLED' | 'ERROR';
  paidAt?: string;
  amount?: number;
  transactionId?: string;
  error?: string;
}

interface TokenCache {
  token: string;
  expiresAt: number;
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,  // 1 second
  maxDelay: 10000,  // 10 seconds
};

export class BnbApiClient {
  private config: BnbConfig;
  private tokenCache: TokenCache | null = null;

  constructor() {
    const isSandbox = process.env.BNB_API_SANDBOX === 'true';

    this.config = {
      baseUrl: process.env.BNB_API_BASE_URL ||
        (isSandbox
          ? 'https://sandbox-api.bnb.com.bo'
          : 'https://api.bnb.com.bo'),
      accountId: process.env.BNB_ACCOUNT_ID || '',
      authorizationId: process.env.BNB_AUTHORIZATION_ID || '',
      isSandbox,
    };

    if (!this.isConfigured()) {
      logger.warn('BNB API credentials not configured');
    } else {
      logger.info('BNB API client initialized', {
        baseUrl: this.config.baseUrl,
        isSandbox: this.config.isSandbox,
      });
    }
  }

  /**
   * Check if BNB API is configured
   */
  isConfigured(): boolean {
    return !!(this.config.accountId && this.config.authorizationId);
  }

  /**
   * Get or refresh authentication token
   */
  private async getAuthToken(): Promise<string> {
    // Check cached token validity (with 5-minute buffer)
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now() + 5 * 60 * 1000) {
      return this.tokenCache.token;
    }

    logger.debug('Refreshing BNB auth token');

    const response = await this.makeRequest<BnbAuthResponse>(
      '/ClientAuthentication.API/api/v1/auth/token',
      {
        method: 'POST',
        body: {
          accountId: this.config.accountId,
          authorizationId: this.config.authorizationId,
        },
      },
      false  // Don't use auth header for auth endpoint
    );

    this.tokenCache = {
      token: response.token,
      expiresAt: Date.now() + (response.expiresIn * 1000),
    };

    logger.debug('BNB auth token refreshed', {
      expiresIn: response.expiresIn,
    });

    return response.token;
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest<T>(
    endpoint: string,
    options: {
      method: 'GET' | 'POST';
      body?: Record<string, unknown>;
      params?: Record<string, string>;
    },
    useAuth: boolean = true
  ): Promise<T> {
    const url = new URL(endpoint, this.config.baseUrl);

    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (useAuth) {
      const token = await this.getAuthToken();
      headers['Authorization'] = `Bearer ${token}`;
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
      try {
        const startTime = Date.now();

        const response = await fetch(url.toString(), {
          method: options.method,
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
        });

        const duration = Date.now() - startTime;

        logger.debug('BNB API request', {
          endpoint,
          method: options.method,
          status: response.status,
          duration: `${duration}ms`,
          attempt,
        });

        if (!response.ok) {
          const errorText = await response.text();

          // Handle specific error codes
          if (response.status === 401) {
            // Clear token cache and retry
            this.tokenCache = null;
            if (attempt < RETRY_CONFIG.maxRetries) {
              continue;
            }
          }

          throw new Error(`BNB API error: ${response.status} ${errorText}`);
        }

        return await response.json() as T;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        logger.warn('BNB API request failed', {
          endpoint,
          attempt,
          error: lastError.message,
        });

        if (attempt < RETRY_CONFIG.maxRetries) {
          // Exponential backoff
          const delay = Math.min(
            RETRY_CONFIG.baseDelay * Math.pow(2, attempt - 1),
            RETRY_CONFIG.maxDelay
          );
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    logger.error('BNB API request failed after retries', {
      endpoint,
      maxRetries: RETRY_CONFIG.maxRetries,
      error: lastError?.message,
    });

    throw lastError || new Error('BNB API request failed');
  }

  /**
   * Generate QR code for payment
   */
  async generateQrCode(params: {
    amount: number;
    currency: 'BOB' | 'USD';
    reference: string;
    serviceCode: string;
    expiresInDays?: number;
    description?: string;
  }): Promise<{
    qrId: string;
    qrContent: string;
    expiresAt: string;
  }> {
    if (!this.isConfigured()) {
      throw new Error('BNB API is not configured');
    }

    // Calculate expiration date
    const expiresInDays = params.expiresInDays || 1;
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + expiresInDays);
    const expirationDateStr = expirationDate.toISOString().split('T')[0];

    const requestBody: BnbQrRequest = {
      currency: params.currency === 'BOB' ? 1 : 2,
      amount: params.amount,
      reference: params.reference,
      expirationDate: expirationDateStr,
      singleUse: true,
      description: params.description || `Pago Resonancial - ${params.reference}`,
    };

    logger.info('Generating BNB QR code', {
      amount: params.amount,
      currency: params.currency,
      reference: params.reference,
      expirationDate: expirationDateStr,
    });

    const response = await this.makeRequest<BnbQrResponse>(
      '/main/getQRWithImageAsync',
      {
        method: 'POST',
        body: requestBody,
      }
    );

    // Set expiration to end of day
    const expiresAt = new Date(expirationDate);
    expiresAt.setHours(23, 59, 59, 999);

    logger.info('BNB QR code generated', {
      qrId: response.qrId,
      expiresAt: expiresAt.toISOString(),
    });

    return {
      qrId: response.qrId,
      qrContent: response.qrImage,  // Base64 image
      expiresAt: expiresAt.toISOString(),
    };
  }

  /**
   * Check QR payment status
   */
  async checkQrStatus(qrId: string): Promise<{
    status: 'pending' | 'scanned' | 'paid' | 'expired' | 'cancelled' | 'error';
    paidAt?: string;
    transactionId?: string;
    error?: string;
  }> {
    if (!this.isConfigured()) {
      throw new Error('BNB API is not configured');
    }

    logger.debug('Checking QR status', { qrId });

    const response = await this.makeRequest<BnbQrStatusResponse>(
      '/main/getQRStatusAsync',
      {
        method: 'GET',
        params: { qrId },
      }
    );

    // Normalize status to lowercase
    const normalizedStatus = response.status.toLowerCase() as
      'pending' | 'scanned' | 'paid' | 'expired' | 'cancelled' | 'error';

    logger.debug('QR status result', {
      qrId,
      status: normalizedStatus,
      transactionId: response.transactionId,
    });

    return {
      status: normalizedStatus,
      paidAt: response.paidAt,
      transactionId: response.transactionId,
      error: response.error,
    };
  }

  /**
   * List QRs generated on a specific date (for reconciliation)
   */
  async listQrsByDate(date: Date): Promise<Array<{
    qrId: string;
    status: string;
    amount: number;
    reference: string;
  }>> {
    if (!this.isConfigured()) {
      throw new Error('BNB API is not configured');
    }

    const dateStr = date.toISOString().split('T')[0];

    logger.info('Listing QRs by date', { date: dateStr });

    const response = await this.makeRequest<{
      qrs: Array<{
        qrId: string;
        status: string;
        amount: number;
        reference: string;
      }>;
    }>('/main/getQRbyGenerationDateAsync', {
      method: 'GET',
      params: { date: dateStr },
    });

    return response.qrs || [];
  }
}

// Singleton instance
export const bnbApi = new BnbApiClient();
```

---

## 5. Frontend Implementation

### 5.1 Checkout Page Component

```typescript
// client/src/pages/Checkout.tsx

import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

interface OrderStatus {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: string;
    currency: string;
    paidAt: string | null;
    expiresAt: string;
  };
  payment: {
    status: string;
    qrImageUrl: string | null;
    expiresAt: string;
  } | null;
}

export function CheckoutPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [pollingEnabled, setPollingEnabled] = useState(true);

  // Fetch order status
  const { data: orderStatus, isLoading, error } = useQuery<OrderStatus>({
    queryKey: ['order-status', orderId],
    queryFn: () => api.orders.getStatus(orderId!),
    enabled: !!orderId,
    refetchInterval: pollingEnabled ? 5000 : false,  // Poll every 5 seconds
  });

  // Verify payment mutation
  const verifyMutation = useMutation({
    mutationFn: () => api.orders.verifyPayment(orderId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-status', orderId] });
    },
  });

  // Regenerate QR mutation
  const regenerateMutation = useMutation({
    mutationFn: () => api.orders.regenerateQr(orderId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-status', orderId] });
    },
  });

  // Stop polling when payment is complete or expired
  useEffect(() => {
    if (orderStatus?.order.status === 'paid' ||
        orderStatus?.order.status === 'fulfilled' ||
        orderStatus?.order.status === 'cancelled') {
      setPollingEnabled(false);
    }
  }, [orderStatus?.order.status]);

  // Redirect to success page when paid
  useEffect(() => {
    if (orderStatus?.order.status === 'paid') {
      setTimeout(() => {
        navigate(`/pago-exitoso/${orderId}`);
      }, 2000);  // Show success state briefly
    }
  }, [orderStatus?.order.status, orderId, navigate]);

  // Calculate time remaining
  const getTimeRemaining = useCallback(() => {
    if (!orderStatus?.payment?.expiresAt) return null;

    const now = new Date().getTime();
    const expires = new Date(orderStatus.payment.expiresAt).getTime();
    const diff = expires - now;

    if (diff <= 0) return 'Expirado';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }, [orderStatus?.payment?.expiresAt]);

  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(getTimeRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, [getTimeRemaining]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !orderStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Orden no encontrada</h2>
            <p className="text-muted-foreground mb-4">
              No pudimos encontrar la orden solicitada.
            </p>
            <Button onClick={() => navigate('/')}>Volver al inicio</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPaid = orderStatus.order.status === 'paid';
  const isExpired = orderStatus.payment?.status === 'expired' ||
                    orderStatus.order.status === 'expired';
  const isPending = orderStatus.order.status === 'pending';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {isPaid ? '¡Pago Exitoso!' : 'Escanea el código QR'}
              </CardTitle>
              <p className="text-muted-foreground">
                Orden: {orderStatus.order.orderNumber}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Status Badge */}
              <div className="flex justify-center">
                <Badge
                  variant={isPaid ? 'default' : isExpired ? 'destructive' : 'secondary'}
                  className="text-sm py-1 px-3"
                >
                  {isPaid && <CheckCircle className="w-4 h-4 mr-1" />}
                  {isExpired && <XCircle className="w-4 h-4 mr-1" />}
                  {isPending && <Clock className="w-4 h-4 mr-1" />}
                  {isPaid ? 'Pagado' : isExpired ? 'Expirado' : 'Pendiente'}
                </Badge>
              </div>

              {/* QR Code Display */}
              <AnimatePresence mode="wait">
                {isPaid ? (
                  <motion.div
                    key="success"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center py-8"
                  >
                    <CheckCircle className="w-24 h-24 text-green-500 mb-4" />
                    <p className="text-lg font-medium">Pago confirmado</p>
                    <p className="text-sm text-muted-foreground">
                      Redirigiendo...
                    </p>
                  </motion.div>
                ) : isExpired ? (
                  <motion.div
                    key="expired"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center py-8"
                  >
                    <XCircle className="w-16 h-16 text-muted-foreground mb-4" />
                    <p className="text-center mb-4">
                      El código QR ha expirado
                    </p>
                    <Button
                      onClick={() => regenerateMutation.mutate()}
                      disabled={regenerateMutation.isPending}
                    >
                      {regenerateMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Generar nuevo código
                    </Button>
                  </motion.div>
                ) : orderStatus.payment?.qrImageUrl ? (
                  <motion.div
                    key="qr"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="bg-white p-4 rounded-xl shadow-lg">
                      <img
                        src={orderStatus.payment.qrImageUrl}
                        alt="Código QR de pago"
                        className="w-64 h-64"
                      />
                    </div>

                    {/* Time remaining */}
                    {timeRemaining && (
                      <p className="mt-4 text-sm text-muted-foreground flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Expira en: {timeRemaining}
                      </p>
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {/* Amount */}
              <div className="text-center py-4 border-t border-b">
                <p className="text-sm text-muted-foreground">Total a pagar</p>
                <p className="text-3xl font-bold">
                  {orderStatus.order.currency === 'BOB' ? 'Bs.' : '$'}
                  {parseFloat(orderStatus.order.totalAmount).toFixed(2)}
                </p>
              </div>

              {/* Instructions */}
              {isPending && (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Instrucciones:</p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Abre la app de tu banco (BNB, Tigo Money, etc.)</li>
                    <li>Selecciona "Pagar con QR"</li>
                    <li>Escanea el código</li>
                    <li>Confirma el pago</li>
                  </ol>
                </div>
              )}

              {/* Manual verify button (for testing/fallback) */}
              {isPending && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => verifyMutation.mutate()}
                  disabled={verifyMutation.isPending}
                >
                  {verifyMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Ya realicé el pago
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
```

### 5.2 API Client Extensions

```typescript
// client/src/lib/api.ts - Add order methods

const API_BASE = import.meta.env.VITE_API_URL || '';

export const api = {
  // ... existing methods ...

  orders: {
    create: async (data: {
      items: Array<{
        productType: string;
        productId: string;
        productName: string;
        quantity: number;
        unitPrice: number;
        metadata?: Record<string, unknown>;
      }>;
      customerEmail: string;
      customerName: string;
      customerPhone?: string;
      discountCode?: string;
      currency?: 'BOB' | 'USD';
    }) => {
      const response = await fetch(`${API_BASE}/api/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create order');
      }

      return response.json();
    },

    getStatus: async (orderId: string) => {
      const response = await fetch(`${API_BASE}/api/orders/${orderId}/status`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get order status');
      }

      return response.json();
    },

    verifyPayment: async (orderId: string) => {
      const response = await fetch(`${API_BASE}/api/orders/${orderId}/verify-payment`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to verify payment');
      }

      return response.json();
    },

    regenerateQr: async (orderId: string) => {
      const response = await fetch(`${API_BASE}/api/orders/${orderId}/regenerate-qr`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to regenerate QR');
      }

      return response.json();
    },

    cancel: async (orderId: string, reason?: string) => {
      const response = await fetch(`${API_BASE}/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel order');
      }

      return response.json();
    },
  },
};
```

---

## 6. Security Considerations

### 6.1 Input Validation

```typescript
// All API inputs validated with Zod
// - Email format validation
// - Amount bounds checking (min: 1 BOB, max: 50,000 BOB)
// - Product ID whitelist validation
// - Phone number format validation
```

### 6.2 Rate Limiting

```typescript
// server/middleware/rate-limit.ts

import rateLimit from 'express-rate-limit';

export const orderCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // 10 orders per window per IP
  message: { error: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const paymentVerificationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,   // 1 minute
  max: 30,                    // 30 verifications per minute per IP
  message: { error: 'Demasiadas verificaciones. Espera un momento.' },
});
```

### 6.3 Credential Security

| Credential | Storage | Access |
|------------|---------|--------|
| BNB_ACCOUNT_ID | Environment variable | Server only |
| BNB_AUTHORIZATION_ID | Environment variable | Server only |
| DATABASE_URL | Environment variable | Server only |
| Auth tokens | In-memory cache | Server only, auto-expire |

### 6.4 Data Protection

- **PII Encryption**: Customer email/phone hashed in logs
- **Payment Data**: No card/account numbers stored (QR-based)
- **Audit Trail**: All status changes logged with timestamps
- **IP Hashing**: Store SHA-256 hash, not raw IPs

---

## 7. Error Handling & Recovery

### 7.1 Error Categories

| Category | Example | Recovery Strategy |
|----------|---------|-------------------|
| **Network** | BNB API timeout | Retry with exponential backoff |
| **Auth** | Token expired | Auto-refresh, retry request |
| **Validation** | Invalid product | Return 400 with clear message |
| **Business** | Duplicate order | Idempotency key check |
| **Infrastructure** | DB connection lost | Circuit breaker, reconnect |

### 7.2 Idempotency

```typescript
// Use order number as idempotency key
// If duplicate create request, return existing order
async function findOrCreateOrder(idempotencyKey: string, data: CreateOrderInput) {
  const existing = await orderService.getOrderByNumber(idempotencyKey);
  if (existing) {
    return { order: existing, isNew: false };
  }
  return { order: await orderService.createOrder(data), isNew: true };
}
```

### 7.3 Dead Letter Queue (Future Enhancement)

```typescript
// For failed payment verifications
interface FailedVerification {
  orderId: string;
  qrId: string;
  failedAt: Date;
  lastError: string;
  retryCount: number;
}

// Background job to retry failed verifications
async function processFailedVerifications() {
  const failed = await getFailedVerifications({ maxRetries: 5 });
  for (const verification of failed) {
    await retryVerification(verification);
  }
}
```

---

## 8. Testing Strategy

### 8.1 Unit Tests

```typescript
// __tests__/services/order-service.test.ts

describe('OrderService', () => {
  describe('createOrder', () => {
    it('should create order with valid items', async () => {
      const input = {
        items: [{ productId: 'pack_despertar', quantity: 1 }],
        customerEmail: 'test@example.com',
        customerName: 'Test User',
      };

      const result = await orderService.createOrder(input);

      expect(result.order.status).toBe('pending');
      expect(result.order.totalAmount).toBe('700.00');
      expect(result.paymentQr).toBeDefined();
    });

    it('should apply discount code correctly', async () => {
      // Create valid discount code first
      const code = await createTestDiscountCode('10_percent');

      const input = {
        items: [{ productId: 'pack_despertar', quantity: 1 }],
        customerEmail: 'test@example.com',
        customerName: 'Test User',
        discountCode: code.code,
      };

      const result = await orderService.createOrder(input);

      expect(result.order.discountAmount).toBe('70.00');  // 10% of 700
      expect(result.order.totalAmount).toBe('630.00');
    });

    it('should reject invalid product', async () => {
      const input = {
        items: [{ productId: 'invalid_product', quantity: 1 }],
        customerEmail: 'test@example.com',
        customerName: 'Test User',
      };

      await expect(orderService.createOrder(input))
        .rejects.toThrow('Invalid or inactive product');
    });
  });
});
```

### 8.2 Integration Tests

```typescript
// __tests__/integration/payment-flow.test.ts

describe('Payment Flow Integration', () => {
  it('should complete full payment flow', async () => {
    // 1. Create order
    const createRes = await request(app)
      .post('/api/orders/create')
      .send({
        items: [{ productType: 'pack', productId: 'pack_despertar', ... }],
        customerEmail: 'test@example.com',
        customerName: 'Test User',
      });

    expect(createRes.status).toBe(201);
    const { order, payment } = createRes.body;

    // 2. Simulate BNB payment (mock)
    await simulateBnbPayment(payment.bnbQrId);

    // 3. Verify payment
    const verifyRes = await request(app)
      .post(`/api/orders/${order.id}/verify-payment`);

    expect(verifyRes.body.isPaid).toBe(true);

    // 4. Check order status
    const statusRes = await request(app)
      .get(`/api/orders/${order.id}/status`);

    expect(statusRes.body.order.status).toBe('paid');
  });
});
```

### 8.3 BNB Sandbox Testing

```bash
# Test environment setup
BNB_API_SANDBOX=true
BNB_ACCOUNT_ID=sandbox_account_id
BNB_AUTHORIZATION_ID=sandbox_auth_id
BNB_API_BASE_URL=https://sandbox-api.bnb.com.bo
```

---

## 9. Monitoring & Observability

### 9.1 Key Metrics

| Metric | Type | Alert Threshold |
|--------|------|-----------------|
| `orders.created` | Counter | N/A |
| `orders.paid` | Counter | N/A |
| `orders.failed` | Counter | >5 in 5 min |
| `payment.verification.latency` | Histogram | p99 > 5s |
| `bnb.api.errors` | Counter | >10 in 1 min |
| `bnb.api.latency` | Histogram | p95 > 3s |

### 9.2 Logging Standards

```typescript
// Structured logging format
{
  "timestamp": "2026-01-20T10:30:00.000Z",
  "level": "info",
  "service": "resonancial-api",
  "component": "order-service",
  "requestId": "req_abc123",
  "orderId": "ord_xyz789",
  "event": "order_created",
  "data": {
    "totalAmount": 700,
    "currency": "BOB",
    "items": 1
  }
}
```

### 9.3 Alerting Rules

```yaml
# Alert on high error rate
- alert: HighPaymentErrorRate
  expr: rate(orders_failed_total[5m]) > 0.1
  for: 2m
  labels:
    severity: critical
  annotations:
    summary: High payment failure rate detected

# Alert on BNB API degradation
- alert: BnbApiLatency
  expr: histogram_quantile(0.95, bnb_api_latency_seconds) > 3
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: BNB API response time degraded
```

---

## 10. Deployment & Rollout

### 10.1 Database Migration

```bash
# 1. Generate migration
npm run db:generate

# 2. Review migration SQL
cat drizzle/0001_add_orders_tables.sql

# 3. Apply to staging
DATABASE_URL=$STAGING_DB npm run db:push

# 4. Verify tables created
psql $STAGING_DB -c "\dt"

# 5. Apply to production (during maintenance window)
DATABASE_URL=$PROD_DB npm run db:push
```

### 10.2 Feature Flags

```typescript
// Feature flag for gradual rollout
const FEATURE_FLAGS = {
  BNB_PAYMENTS_ENABLED: process.env.FEATURE_BNB_PAYMENTS === 'true',
  BNB_PAYMENTS_PERCENTAGE: parseInt(process.env.BNB_PAYMENTS_PERCENTAGE || '0'),
};

function shouldUseBnbPayments(userId: string): boolean {
  if (!FEATURE_FLAGS.BNB_PAYMENTS_ENABLED) return false;

  // Gradual rollout by user hash
  const hash = hashString(userId);
  return (hash % 100) < FEATURE_FLAGS.BNB_PAYMENTS_PERCENTAGE;
}
```

### 10.3 Rollout Phases

| Phase | Duration | Traffic | Criteria for Next Phase |
|-------|----------|---------|-------------------------|
| 1. Internal | 1 week | Team only | All flows working |
| 2. Beta | 1 week | 10% | <1% error rate |
| 3. Gradual | 2 weeks | 10% → 50% | Stable metrics |
| 4. GA | - | 100% | Full monitoring in place |

### 10.4 Rollback Procedure

```bash
# 1. Disable feature flag immediately
railway variables set FEATURE_BNB_PAYMENTS=false

# 2. Revert to previous deployment
railway deploy --revert

# 3. Verify WhatsApp fallback working
curl -X POST $API_URL/api/health

# 4. Communicate to users
# - Enable WhatsApp CTA on all products
# - Send notification about temporary maintenance
```

---

## 11. Risk Assessment

### 11.1 Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| BNB API downtime | Medium | High | WhatsApp fallback, status page |
| Invalid QR displayed | Low | High | Validate base64 on generation |
| Payment not detected | Medium | High | Manual verification endpoint |
| Double charge | Low | Critical | Idempotency, transaction logs |
| Data breach | Low | Critical | Encryption, minimal PII storage |
| Exchange rate issues | Medium | Medium | Lock BOB prices, no USD conversion |

### 11.2 Contingency Plans

**BNB API Unavailable:**
1. Detect via health check failures
2. Auto-switch to WhatsApp coordination mode
3. Display message: "Pagos QR temporalmente no disponibles"
4. Log for manual follow-up

**Payment Status Verification Fails:**
1. User clicks "Ya realicé el pago"
2. System logs for manual review
3. Admin receives notification
4. Manual verification via BNB dashboard

---

## 12. Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Add database schema (orders, order_items, payment_qrs, etc.)
- [ ] Run database migrations on staging
- [ ] Enhance BNB API client with retry logic
- [ ] Add product catalog configuration
- [ ] Write unit tests for order service

### Phase 2: Backend API (Week 2)
- [ ] Implement order service
- [ ] Add API routes (create, status, verify, cancel)
- [ ] Add rate limiting middleware
- [ ] Add structured logging
- [ ] Integration tests with BNB sandbox

### Phase 3: Frontend (Week 3)
- [ ] Create checkout page component
- [ ] Add QR display with polling
- [ ] Implement order creation flow
- [ ] Add payment success page
- [ ] Add error/expired states

### Phase 4: Integration (Week 4)
- [ ] Connect product CTAs to checkout
- [ ] Add discount code application
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Security audit

### Phase 5: Deployment (Week 5)
- [ ] Production database migration
- [ ] Obtain BNB production credentials
- [ ] Deploy backend to Railway
- [ ] Deploy frontend to Vercel
- [ ] Internal testing

### Phase 6: Rollout (Week 6)
- [ ] Beta launch (10% traffic)
- [ ] Monitor metrics and logs
- [ ] Gradual rollout to 100%
- [ ] Documentation and training
- [ ] Post-launch review

---

## Appendix A: BNB API Reference

- **Open Banking Portal:** https://www.bnb.com.bo/PortalBNB/Api/OpenBanking
- **Sandbox Environment:** https://www.bnb.com.bo/PortalBNB/Api/Sandbox
- **API Market:** https://marketapi.bnb.com.bo/ApiMarket

## Appendix B: Related Documents

- [Phase 1: Gift Cards](./phase-1-gift-cards.md)
- [Phase 2: Payments Overview](./phase-2-payments-orders.md)
- [Split Deployment Architecture](../architecture/split-deployment.md)

---

**Document Revision History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-20 | Payment Integration Engineer | Initial draft |
