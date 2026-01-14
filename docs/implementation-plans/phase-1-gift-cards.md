# Phase 1 Implementation Plan: Gift Cards (Weeks 1–3)

## Goal
Stand up a production-grade gift card system with issuance, storage, redemption validation, and basic admin visibility. This replaces the current UI-only redemption simulation with real backend validation and provides the data foundation for phases 2–4.

## Scope
- Gift card issuance and redemption APIs.
- Database schema for gift cards, redemptions, and audit events.
- Validation/anti-abuse protections.
- Minimal admin reporting endpoints.

## Architecture Overview
- **API**: Node/Express routes under `/api/gift-cards`.
- **Data**: Postgres + Drizzle ORM.
- **Security**: server-side validation, rate limiting, and one-time code redemption.

## Data Model (Drizzle)
Create new tables in `shared/schema.ts` (or a new schema file if preferred):

### `gift_cards`
- `id` (uuid, pk)
- `code` (varchar, unique, indexed)
- `status` (enum: active, redeemed, expired, void)
- `service_id` (varchar) — ties to product or service catalog
- `currency` (varchar) — e.g. BOB
- `amount` (integer) — stored in minor units
- `purchaser_name` (text, nullable)
- `recipient_name` (text, nullable)
- `message` (text, nullable)
- `issued_at` (timestamp)
- `expires_at` (timestamp, nullable)
- `redeemed_at` (timestamp, nullable)

### `gift_card_redemptions`
- `id` (uuid, pk)
- `gift_card_id` (fk)
- `redeemed_by_email` (text, nullable)
- `redeemed_by_name` (text, nullable)
- `redeemed_at` (timestamp)
- `source` (enum: web, admin)
- `ip_hash` (text) — store hash instead of raw IP

### `gift_card_events`
- `id` (uuid, pk)
- `gift_card_id` (fk)
- `event_type` (enum: issued, redeemed, expired, voided)
- `event_metadata` (jsonb)
- `created_at` (timestamp)

## API Endpoints
### 1) Issue Gift Card
`POST /api/gift-cards`
- **Input**: service_id, amount, currency, purchaser_name, recipient_name, message, expires_at
- **Output**: gift card object + masked code (e.g., XXXX-1234)
- **Notes**: code generation with prefix and checksum (e.g., GIFT-XXXX-XXXX). Ensure uniqueness and entropy.

### 2) Retrieve Gift Card (Admin or Secure Lookup)
`GET /api/gift-cards/:code`
- **Behavior**: return status and details if code is valid. Mask sensitive data by default.

### 3) Redeem Gift Card
`POST /api/gift-cards/:code/redeem`
- **Input**: redeemed_by_name, redeemed_by_email
- **Behavior**: validate code status, mark redeemed, create redemption + event. Must be idempotent.

### 4) Admin Listing (Optional Minimal)
`GET /api/gift-cards?status=active&limit=50`
- Use basic auth or admin token for now.

## Validation & Abuse Controls
- Rate limit gift card lookup and redemption (per IP/device).
- Use structured errors and avoid leaking whether a code exists for invalid attempts.
- Require exact code match with server-side canonicalization (uppercase, strip spaces).

## Client Integration
- Update `/canjear` to call `POST /api/gift-cards/:code/redeem` and render success/error states from real API response.
- Update gift card purchase flow to optionally hit `POST /api/gift-cards` (if payment is not yet done, mark as `pending` and finalize in phase 2).

## Milestones
1. **Day 1–3**: schema and migration, code generator, core storage layer.
2. **Day 4–6**: API endpoints + validation + rate limits.
3. **Day 7–10**: frontend integration on `/canjear` and gift-card purchase flow.
4. **Day 11–15**: admin listing + audit events, QA and doc updates.

## Risks & Mitigations
- **Duplicate code generation**: enforce unique constraint + retry strategy.
- **Abuse on redemption**: rate limiting + hashed IP logging + idempotent redemption.
- **Partial rollout**: keep WhatsApp fallback for manual handling until payments land in phase 2.

