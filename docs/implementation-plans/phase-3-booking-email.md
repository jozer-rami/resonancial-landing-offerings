# Phase 3 Implementation Plan: Booking & Email Automation (Weeks 7–10)

## Goal
Provide self-serve scheduling for sessions, plus automated communications (welcome, reminders, and post-session follow-ups).

## Scope
- Availability and appointment system.
- Calendar integration (Google Calendar/CalDAV).
- Email automation via a transactional provider.

## Architecture Overview
- **Booking**: internal appointment table + availability rules.
- **Calendar**: sync to a primary calendar for blocked times.
- **Email**: Postmark/SendGrid for transactional templates.

## Data Model
### `appointments`
- `id` (uuid, pk)
- `status` (enum: pending, confirmed, completed, canceled)
- `service_id` (varchar)
- `customer_name` (text)
- `customer_email` (text)
- `scheduled_start` (timestamp)
- `scheduled_end` (timestamp)
- `timezone` (varchar)
- `order_id` (fk, nullable)
- `created_at` (timestamp)

### `availability_rules`
- `id` (uuid, pk)
- `weekday` (int)
- `start_time` (time)
- `end_time` (time)
- `timezone` (varchar)

### `email_events`
- `id` (uuid, pk)
- `recipient` (text)
- `template` (varchar)
- `status` (enum: queued, sent, failed)
- `provider_message_id` (varchar)
- `created_at` (timestamp)

## API Endpoints
### 1) Availability
`GET /api/availability?service_id=...&date=...`
- Return open slots based on rules + existing appointments.

### 2) Create Appointment
`POST /api/appointments`
- **Input**: service_id, customer, slot, timezone
- **Behavior**: reserve slot, create appointment, send confirmation email.

### 3) Cancel/Reschedule
`POST /api/appointments/:id/cancel`
`POST /api/appointments/:id/reschedule`

## Email Automation
- Templates: welcome, booking confirmation, reminder (24h), reminder (1h), post-session feedback.
- Background job for scheduled reminders.

## Client Integration
- Replace “Reservar” CTAs with booking modal, showing availability and confirmation.

## Milestones
1. **Week 7**: availability rules + appointment schema.
2. **Week 8**: booking API + confirmation email.
3. **Week 9**: calendar sync + reminders.
4. **Week 10**: reschedule/cancel flows + UX polish.

## Risks & Mitigations
- **Double booking**: use DB transaction with row locks; recheck slot on commit.
- **Timezone drift**: store UTC and expose timezone on API.

