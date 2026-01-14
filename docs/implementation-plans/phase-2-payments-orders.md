# Phase 2 Implementation Plan: Payments & Orders (Weeks 4–6)

## Goal
Enable paid purchases for sessions, packs, and the almanac with reliable order tracking, payment confirmations, and receipts.

## Scope
- Order data model.
- Stripe (or equivalent) checkout + webhook processing.
- Receipt emails and order status transitions.

## Architecture Overview
- **Payments**: Stripe Checkout or Payment Intents with server-side verification.
- **Orders**: canonical source of truth stored in Postgres.
- **Webhooks**: handle `checkout.session.completed`, `payment_intent.succeeded`, `charge.refunded`.

## Data Model
### `orders`
- `id` (uuid, pk)
- `status` (enum: pending, paid, failed, refunded, canceled)
- `line_items` (jsonb) — service_id, quantity, unit_amount
- `currency` (varchar)
- `total_amount` (integer)
- `customer_email` (text)
- `customer_name` (text)
- `provider` (enum: stripe)
- `provider_session_id` (varchar)
- `provider_payment_intent_id` (varchar)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `order_events`
- `id` (uuid, pk)
- `order_id` (fk)
- `event_type` (enum: created, paid, refunded, failed, canceled)
- `event_metadata` (jsonb)
- `created_at` (timestamp)

## API Endpoints
### 1) Create Checkout Session
`POST /api/checkout`
- **Input**: items (service_id/pack/almanac), customer info.
- **Output**: Stripe session URL.
- **Behavior**: Create `order` with `pending` status before redirect.

### 2) Webhook Receiver
`POST /api/webhooks/stripe`
- Validate signature.
- Update order status and create events.
- Trigger transactional email.

### 3) Order Status Lookup (Optional)
`GET /api/orders/:id`
- Return status for client confirmation screen.

## Client Integration
- Replace WhatsApp CTAs for paid products with a “Checkout” button that opens the session URL.
- Keep WhatsApp as secondary for users who want manual coordination.

## Milestones
1. **Week 4**: order schema + Stripe integration spike.
2. **Week 5**: implement checkout + webhook + order events.
3. **Week 6**: wire to frontend CTAs + email receipts.

## Risks & Mitigations
- **Webhook reliability**: idempotent handlers + retries + event logs.
- **Abandoned checkout**: scheduled job to expire pending orders after TTL.

