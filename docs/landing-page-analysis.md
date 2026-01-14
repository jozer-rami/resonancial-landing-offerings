# Landing Page Analysis & Documentation (Portal Resonancial)

## Product Overview
Portal Resonancial is a single-page marketing site with supporting flows for gift cards and gift redemption. The main landing page highlights the brand’s 2026 offering (“Portal Resonancial”), three core sessions, a bundled pack, and an annual ritual “Almanaque” product, plus a newsletter incentive to capture leads. Navigation includes anchor links on the landing page and routes to a gift-card purchase flow and a redemption form. The UI emphasizes motion/scroll effects, high-contrast visuals, and direct WhatsApp CTAs for conversion. The landing page is implemented in `Home.tsx` and is framed by a shared `Navbar` and `Footer` component. The application routes are configured in `App.tsx`.【F:client/src/pages/Home.tsx†L433-L770】【F:client/src/components/Navbar.tsx†L1-L139】【F:client/src/components/Footer.tsx†L1-L73】【F:client/src/App.tsx†L1-L30】

## Information Architecture & UX Structure
### Primary Routes
- `/` — main landing page with sections for philosophy, services, pack, and the almanac plus newsletter capture.【F:client/src/pages/Home.tsx†L433-L770】
- `/tarjetas-regalo` — gift card configuration flow that builds a WhatsApp message for purchase intent.【F:client/src/pages/GiftCards.tsx†L1-L197】
- `/canjear` — gift card redemption screen (currently a simulated validation flow).【F:client/src/pages/Redeem.tsx†L1-L118】

### Landing Page Sections (Home)
1. **Hero**: full-screen parallax background, brand logo, and “new cycle” positioning with scroll cue.【F:client/src/pages/Home.tsx†L433-L520】
2. **Filosofía (Trust/Positioning)**: messaging on frequency alignment and energetic clarity.【F:client/src/pages/Home.tsx†L522-L545】
3. **Servicios (3 core activations)**: Detox Frecuencial, Reconfiguración, and Mapa Resonancial as card-based offers with modal detail views + WhatsApp CTAs.【F:client/src/pages/Home.tsx†L547-L770】
4. **Pack Completo (Bundle)**: value stack and savings summary with CTA for WhatsApp booking.【F:client/src/pages/Home.tsx†L594-L676】
5. **Almanaque Ritual Resonancial**: featured product with details modal and CTA to WhatsApp.【F:client/src/pages/Home.tsx†L677-L770】
6. **Newsletter**: email capture with a promised 10% discount and in-place success messaging.【F:client/src/components/Newsletter.tsx†L1-L136】
7. **Footer**: contact channels, brand copy, and placeholder privacy/terms links.【F:client/src/components/Footer.tsx†L1-L71】

### Gift Card Purchase Flow
- The gift card page gathers recipient info, service selection, and a message, then opens WhatsApp with a pre-filled purchase request. There is no server-side purchase endpoint or payment initiation in the current implementation.【F:client/src/pages/GiftCards.tsx†L1-L197】

### Gift Card Redemption Flow
- The redeem page uses a simulated validation flow (setTimeout with a success state). This is a placeholder and not connected to any backend validation or gift card storage today.【F:client/src/pages/Redeem.tsx†L1-L118】

## Technical Architecture (Current)
### Frontend
- React 19 + Wouter for routing (`App.tsx`), Tailwind CSS classes throughout the UI, and Framer Motion for animations on the landing page and forms.【F:client/src/App.tsx†L1-L30】【F:client/src/pages/Home.tsx†L1-L770】
- Conversion paths are primarily external (WhatsApp) except the newsletter form which posts to a local API route.【F:client/src/pages/Home.tsx†L547-L770】【F:client/src/components/Newsletter.tsx†L29-L77】

### Backend
- Node/Express server with a single endpoint for newsletter subscriptions: `POST /api/newsletter/subscribe` validating input with Zod and persisting to Postgres via Drizzle ORM.【F:server/routes.ts†L1-L49】【F:server/storage.ts†L1-L40】
- Newsletter table schema includes id, email, and subscribed timestamp. No unsubscribe flow or email delivery integration is present yet.【F:shared/schema.ts†L1-L18】【F:server/routes.ts†L1-L49】

## Data & Conversion Flows
- **Newsletter**: `client → /api/newsletter/subscribe → Postgres` with basic email validation and duplicate handling.【F:client/src/components/Newsletter.tsx†L29-L77】【F:server/routes.ts†L7-L49】【F:server/storage.ts†L1-L40】
- **WhatsApp CTAs**: all service, pack, and almanac CTAs open a WhatsApp chat; no native booking or payment flow is implemented in the app.【F:client/src/pages/Home.tsx†L547-L770】
- **Gift Cards**: purchase and redemption flows are UI-only (WhatsApp + simulated validation) with no persisted data model.【F:client/src/pages/GiftCards.tsx†L34-L197】【F:client/src/pages/Redeem.tsx†L1-L118】

## Missing Backend Functionality (Gaps)
The current backend only supports newsletter subscriptions. For a production-grade landing/commerce flow, these backend capabilities are missing:

1. **Gift card issuance & redemption**
   - No API to create gift cards, generate codes, track balance/usage, or validate redemption (redeem flow is simulated).【F:client/src/pages/Redeem.tsx†L1-L118】
2. **Payments & order capture**
   - No payment initiation or order record for sessions, pack purchases, or almanac sales. All CTAs redirect to WhatsApp without any transactional record or confirmation flow.【F:client/src/pages/Home.tsx†L547-L770】
3. **Booking & scheduling**
   - No appointment scheduling (calendar slots, timezone handling, reminders) for 1:1 sessions.
4. **Customer management / CRM**
   - No lead pipeline, customer profile, or interaction history beyond newsletter emails.
5. **Email automation**
   - No transactional email sending for newsletter confirmations or discount codes.
6. **Unsubscribe & consent management**
   - No unsubscribe tokens or consent storage in the newsletter pipeline; the footer privacy/terms links are placeholders.【F:client/src/components/Footer.tsx†L63-L71】
7. **Admin workflows**
   - No dashboards, content management, gift card reporting, or booking management.
8. **Analytics / attribution**
   - No server-side or client-side event tracking for conversion funnel measurement.

## Improvement Opportunities
Below is a prioritized list of improvements organized by function.

### Conversion & UX (High Impact)
- Add an embedded booking flow (Calendly-like) to reduce WhatsApp dependency and provide a fast path to schedule sessions.
- Introduce a clear CTA above the fold (e.g., “Reserva ahora”) to reduce scroll requirement for conversion.
- Add social proof (testimonials, results, or trust badges) in the philosophy section to strengthen credibility.
- Create a multilingual toggle (ES/EN) to broaden market reach.

### Backend / Systems (High Impact)
- Implement gift card APIs: `POST /gift-cards`, `GET /gift-cards/:code`, `POST /gift-cards/:code/redeem`.
- Add order + payment support (Stripe or similar) for almanac and pack purchases, including webhook handling and receipts.
- Add booking service (availability, calendar integration, reminders, reschedules).
- Integrate email service (Postmark/SendGrid) for welcome emails, discount code delivery, and reminders.
- Add GDPR-compliant consent capture + unsubscribe endpoint for newsletter.

### Data & Growth
- Instrument analytics events: CTA clicks, modal opens, newsletter submit success/failure, gift card purchases.
- Add UTM capture and attribution fields to newsletter and checkout flows.
- Build a lightweight admin dashboard for subscribers, gift cards, and orders.

### Performance & Reliability
- Host hero and product media locally or via a CDN with caching headers to reduce reliance on external URLs.
- Add error tracking (Sentry) to surface frontend and API issues in production.

### Content & SEO
- Add real privacy policy and terms pages (currently placeholders).
- Provide structured data (JSON-LD) for services/products to improve SEO.
- Add Open Graph/Twitter tags for richer sharing previews.

## Suggested Next Steps (90-day roadmap)
1. **Phase 1 (Weeks 1–3)**: implement gift card backend + redemption validation; add transaction data models.
2. **Phase 2 (Weeks 4–6)**: add payment + receipt flow for almanac and pack purchases.
3. **Phase 3 (Weeks 7–10)**: add booking/scheduling + email automation.
4. **Phase 4 (Weeks 11–12)**: analytics & admin dashboard; refine SEO and content pages.

---
If you want, I can draft the API specs, data models (Drizzle schema), and rollout plan for the missing backend services.
