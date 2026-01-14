# Phase 4 Implementation Plan: Analytics & Admin (Weeks 11–12)

## Goal
Provide observability into the funnel, operational dashboards, and basic content/operations tooling.

## Scope
- Analytics event capture + reporting.
- Admin dashboard for subscribers, gift cards, orders, appointments.
- SEO and content refinements.

## Analytics
### Events to Track
- Page view, CTA click, modal open, newsletter submit, gift card purchase, gift card redeem.

### Storage Options
- Lightweight events table in Postgres with daily aggregates.
- Or integrate GA4/Segment with server-side events for higher fidelity.

### Suggested Schema
`analytics_events`:
- `id` (uuid)
- `event_name` (varchar)
- `user_id` (nullable)
- `session_id` (varchar)
- `properties` (jsonb)
- `created_at` (timestamp)

## Admin Dashboard
- Auth: basic admin-only access.
- Panels: subscribers, gift cards, orders, appointments.
- Filters: date range, status.
- Export CSV for ops.

## SEO & Content
- Add privacy policy + terms pages.
- Add Open Graph/Twitter meta tags.
- Add JSON-LD schema for services/products.

## Milestones
1. **Week 11**: analytics events + data pipeline.
2. **Week 12**: admin dashboard + SEO polish.

## Risks & Mitigations
- **PII handling**: scrub or hash sensitive fields in analytics.
- **Admin access**: enforce role checks and audit logs.

