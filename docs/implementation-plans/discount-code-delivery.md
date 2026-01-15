# Discount Code Delivery System - Product Requirements Document

**Author:** Product Owner
**Date:** January 15, 2026
**Status:** Planning
**Priority:** P1 - High

---

## Executive Summary

Currently, the newsletter subscription flow promises users a 10% discount code ("Tu código de descuento del 10% está en camino a tu bandeja de entrada") but no code is actually generated or delivered. This feature will implement a complete discount code delivery system that allows users to choose their preferred contact channel (email or WhatsApp) for receiving their discount code.

---

## Problem Statement

### Current State
1. Users subscribe to newsletter by entering their email
2. UI displays success message promising a discount code
3. **No discount code is generated**
4. **No email or message is sent**
5. User expectation is not met → trust erosion

### User Pain Points
- Broken promise creates negative first impression
- No alternative contact method for users who prefer WhatsApp
- No way to retrieve code if email is lost

### Business Impact
- Lost conversion opportunity (discount code not delivered = not used)
- Reduced trust in brand
- No attribution tracking for newsletter-driven sales

---

## Goals & Success Metrics

### Primary Goals
1. Deliver discount codes to 100% of newsletter subscribers
2. Offer channel choice (email or WhatsApp)
3. Track code generation and redemption

### Key Performance Indicators (KPIs)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Code Delivery Rate | 100% | Codes sent / Subscriptions |
| Code Redemption Rate | 15% | Codes redeemed / Codes sent |
| WhatsApp Opt-in Rate | 30% | WhatsApp / Total subscriptions |
| Time to First Purchase | < 7 days | From subscription to order |

---

## User Stories

### Epic: Discount Code Delivery

#### US-1: Email Delivery (MVP)
**As a** newsletter subscriber
**I want to** receive my discount code via email
**So that** I can use it when booking a session

**Acceptance Criteria:**
- [ ] Receive email within 30 seconds of subscribing
- [ ] Email contains unique, valid discount code
- [ ] Email displays discount value (10%)
- [ ] Email includes CTA to book session
- [ ] Code is valid for 30 days

#### US-2: WhatsApp Delivery Option
**As a** newsletter subscriber who prefers WhatsApp
**I want to** receive my discount code via WhatsApp
**So that** I have it readily accessible on my phone

**Acceptance Criteria:**
- [ ] Option to choose WhatsApp during subscription
- [ ] Phone number input with country code
- [ ] Phone validation (E.164 format)
- [ ] WhatsApp message sent within 30 seconds
- [ ] Message contains discount code and booking link

#### US-3: Contact Preference Selection
**As a** user subscribing to the newsletter
**I want to** choose how I receive my discount code
**So that** I get it through my preferred channel

**Acceptance Criteria:**
- [ ] Toggle/selection between Email and WhatsApp
- [ ] Email pre-selected as default
- [ ] WhatsApp shows phone input when selected
- [ ] Clear visual feedback on selection
- [ ] Can proceed with either option

#### US-4: Code Redemption
**As a** user with a discount code
**I want to** apply my code during checkout
**So that** I receive my 10% discount

**Acceptance Criteria:**
- [ ] Input field for discount code at checkout
- [ ] Real-time validation of code
- [ ] Display discount amount applied
- [ ] One-time use enforcement
- [ ] Clear error messages for invalid/expired codes

---

## Technical Design

### Database Schema

```sql
-- Discount Codes Table
CREATE TABLE discount_codes (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(16) UNIQUE NOT NULL,           -- e.g., DISC-X8Y9-Z2W3
  type VARCHAR(20) NOT NULL DEFAULT '10_percent',
  value DECIMAL(5,2) NOT NULL DEFAULT 10.00,  -- Percentage or fixed amount
  subscriber_id VARCHAR REFERENCES newsletter_subscribers(id),
  delivery_channel VARCHAR(10) NOT NULL,      -- 'email' or 'whatsapp'
  delivery_status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed
  delivered_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  redeemed_at TIMESTAMP,
  redeemed_order_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Update newsletter_subscribers to include phone
ALTER TABLE newsletter_subscribers
  ADD COLUMN phone VARCHAR(20),
  ADD COLUMN phone_country_code VARCHAR(5),
  ADD COLUMN contact_preference VARCHAR(10) DEFAULT 'email',
  ADD COLUMN consent_whatsapp BOOLEAN DEFAULT FALSE,
  ADD COLUMN consent_email BOOLEAN DEFAULT TRUE;
```

### API Endpoints

#### 1. Enhanced Newsletter Subscription
```
POST /api/newsletter/subscribe
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "contactPreference": "email" | "whatsapp",
  "phone": "+34640919319",          // Required if whatsapp
  "consentWhatsapp": true,          // Required if whatsapp
  "consentEmail": true
}
```

**Response:**
```json
{
  "success": true,
  "subscriber": {
    "id": "uuid",
    "email": "user@example.com",
    "contactPreference": "email"
  },
  "discountCode": {
    "code": "DISC-X8Y9-Z2W3",
    "value": "10%",
    "expiresAt": "2026-02-15T00:00:00Z",
    "deliveryChannel": "email",
    "deliveryStatus": "sent"
  }
}
```

#### 2. Validate Discount Code
```
POST /api/discount-codes/validate
```

**Request Body:**
```json
{
  "code": "DISC-X8Y9-Z2W3"
}
```

**Response:**
```json
{
  "valid": true,
  "code": "DISC-X8Y9-Z2W3",
  "type": "10_percent",
  "value": 10,
  "expiresAt": "2026-02-15T00:00:00Z"
}
```

#### 3. Redeem Discount Code
```
POST /api/discount-codes/redeem
```

**Request Body:**
```json
{
  "code": "DISC-X8Y9-Z2W3",
  "orderId": "order-uuid"
}
```

### Code Generation Algorithm

```typescript
function generateDiscountCode(): string {
  const prefix = 'DISC';
  const segment1 = generateAlphanumeric(4);
  const segment2 = generateAlphanumeric(4);
  const checksum = calculateChecksum(segment1 + segment2);
  return `${prefix}-${segment1}-${segment2}${checksum}`;
}

// Example output: DISC-X8Y9-Z2W3
// Format: DISC-[A-Z0-9]{4}-[A-Z0-9]{4}
```

### Service Integrations

#### Email Service: Resend (Recommended)
- Simple API, great developer experience
- Transactional email focus
- React Email templates support
- Reasonable pricing ($0 for 3k emails/month)

**Alternative:** SendGrid, Postmark, AWS SES

#### WhatsApp Service: Twilio WhatsApp API
- Official WhatsApp Business API provider
- Template message support
- Delivery receipts
- Phone number validation

**Alternative:** Meta Business API (direct), MessageBird

---

## User Interface Design

### Newsletter Component Updates

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Únete a nuestra comunidad                                      │
│  Recibe un 10% de descuento en tu primera sesión               │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  📧  tu@email.com                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ¿Cómo prefieres recibir tu código?                            │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐                      │
│  │  ✓  Email       │  │     WhatsApp    │                      │
│  └─────────────────┘  └─────────────────┘                      │
│                                                                 │
│  [        Obtener mi descuento        ]                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### WhatsApp Selected State

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Únete a nuestra comunidad                                      │
│  Recibe un 10% de descuento en tu primera sesión               │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  📧  tu@email.com                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ¿Cómo prefieres recibir tu código?                            │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐                      │
│  │     Email       │  │  ✓  WhatsApp    │                      │
│  └─────────────────┘  └─────────────────┘                      │
│                                                                 │
│  ┌────────────┬─────────────────────────────────────────────┐  │
│  │  🇪🇸 +34   │  640 919 319                                │  │
│  └────────────┴─────────────────────────────────────────────┘  │
│                                                                 │
│  ☑ Acepto recibir comunicaciones por WhatsApp                  │
│                                                                 │
│  [        Obtener mi descuento        ]                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Success State

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│               ✨ ¡Gracias por unirte! ✨                        │
│                                                                 │
│  Tu código de descuento ha sido enviado a:                     │
│                                                                 │
│  📧 usuario@email.com                                          │
│  -- OR --                                                       │
│  📱 +34 640 919 319 (WhatsApp)                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           Tu código: DISC-X8Y9-Z2W3                     │   │
│  │           Válido hasta: 15 Feb 2026                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [        Reservar ahora con descuento        ]                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Email Template

**Subject:** Tu código de descuento del 10% - Portal Resonancial ✨

```html
Hola,

¡Gracias por unirte a la comunidad de Portal Resonancial!

Aquí está tu código de descuento exclusivo:

╔═══════════════════════════════════════╗
║                                       ║
║        DISC-X8Y9-Z2W3                ║
║        10% de descuento              ║
║                                       ║
╚═══════════════════════════════════════╝

Válido hasta: 15 de febrero de 2026

Usa este código en tu primera sesión de:
• Detox Frecuencial (45 min) - €55 → €49.50
• Reconfiguración Frecuencial (60 min) - €70 → €63
• Mapa Resonancial (90 min) - €95 → €85.50

[Reservar mi sesión ahora]

Con amor y luz,
El equipo de Portal Resonancial

---
¿No solicitaste este código? Ignora este mensaje.
Para dejar de recibir emails: [Cancelar suscripción]
```

---

## WhatsApp Message Template

```
✨ *Portal Resonancial* ✨

¡Gracias por unirte a nuestra comunidad!

🎁 Tu código de descuento:
*DISC-X8Y9-Z2W3*
_10% en tu primera sesión_

⏰ Válido hasta: 15 Feb 2026

Reserva ahora:
https://portalresonancial.com/reservar?code=DISC-X8Y9-Z2W3

💫 Namaste
```

---

## Implementation Phases

### Phase 1: Email Delivery (MVP) - Week 1

**Tasks:**
1. [ ] Set up Resend account and API key
2. [ ] Create discount_codes database table
3. [ ] Implement code generation service
4. [ ] Create email template with React Email
5. [ ] Update newsletter subscription endpoint
6. [ ] Trigger email on successful subscription
7. [ ] Update Newsletter component success state to show code
8. [ ] Add code validation endpoint
9. [ ] Write unit tests

**Deliverables:**
- Discount codes generated and stored
- Emails sent via Resend
- Codes displayed in success state

### Phase 2: WhatsApp Delivery - Week 2

**Tasks:**
1. [ ] Set up Twilio WhatsApp Business account
2. [ ] Create WhatsApp message template (requires approval)
3. [ ] Add phone field to newsletter_subscribers schema
4. [ ] Update Newsletter component with channel selection
5. [ ] Add phone input with country code picker
6. [ ] Implement WhatsApp sending service
7. [ ] Add consent checkbox and tracking
8. [ ] Write integration tests

**Deliverables:**
- WhatsApp option in subscription form
- Phone number validation
- WhatsApp messages sent via Twilio

### Phase 3: Redemption & Analytics - Week 3

**Tasks:**
1. [ ] Implement code redemption endpoint
2. [ ] Add discount application to checkout flow
3. [ ] Create analytics events for code lifecycle
4. [ ] Build admin dashboard for code management
5. [ ] Add code expiration job (cron)
6. [ ] Implement resend functionality
7. [ ] Write E2E tests

**Deliverables:**
- Working code redemption at checkout
- Analytics tracking
- Admin visibility

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Email deliverability issues | Medium | High | Use reputable ESP (Resend), implement SPF/DKIM |
| WhatsApp template rejection | Medium | Medium | Prepare compliant templates, have backup |
| Discount code abuse | Low | Medium | One-time use, subscriber verification |
| Phone number validation errors | Medium | Low | Use libphonenumber, clear error messages |
| Integration service downtime | Low | High | Queue-based delivery, retry logic |

---

## Dependencies

### External Services
- [ ] Resend account (email)
- [ ] Twilio account (WhatsApp)
- [ ] WhatsApp Business verification

### Internal Dependencies
- [ ] Railway backend deployed ✅
- [ ] Database migrations working ✅
- [ ] Checkout flow (for redemption) - Phase 2 in progress

### Environment Variables (New)
```
# Email (Resend)
RESEND_API_KEY=re_xxxxx

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_WHATSAPP_NUMBER=+14155238886
```

---

## Open Questions

1. **Discount Value:** Should all codes be 10%, or variable based on campaign?
2. **Code Expiration:** 30 days is proposed - confirm with business
3. **Code Reuse:** One-time use only, or allow multiple uses per code?
4. **WhatsApp Fallback:** What if WhatsApp fails? Auto-fallback to email?
5. **Existing Subscribers:** Should we generate codes for users who already subscribed?

---

## Appendix

### Competitive Analysis

| Platform | Email | WhatsApp | SMS | Other |
|----------|-------|----------|-----|-------|
| Headspace | ✅ | ❌ | ❌ | Push |
| Calm | ✅ | ❌ | ✅ | Push |
| Mindbody | ✅ | ❌ | ✅ | - |
| ClassPass | ✅ | ✅ | ✅ | Push |

### Related Documents
- [Phase 3: Booking & Email](./phase-3-booking-email.md)
- [Railway Deployment](../railway-deployment.md)
- [Split Deployment Architecture](../architecture/split-deployment.md)
