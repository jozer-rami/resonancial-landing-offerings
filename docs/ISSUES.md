# Resonancial Landing - Issues & Fixes List

**Date**: 2026-01-16
**Status**: FIXED (branch: fix/minor-issues-cleanup)

---

## Executive Summary

This document catalogs all identified issues requiring attention, organized by priority. The codebase is architecturally sound but has several data consistency issues and hardcoded values that need centralization.

---

## Critical Issues (P0)

### 1. ~~Currency/Pricing Mismatch in Email Templates~~ ✅ FIXED

**Problem**: Email service displays prices in EUR while the website shows BOB/USD.

| Location | Displayed Price | Should Be |
|----------|-----------------|-----------|
| Website (Home.tsx, GiftCards.tsx) | 500 Bs / 50 USD | Correct |
| Email template (email.ts:117-127) | ~~€55, €70, €95~~ 500 Bs → 450 Bs | ✅ Fixed |

**Files Affected**:
- `server/services/email.ts` (lines 117-127, 195-197)

**Impact**: Customer confusion about actual pricing. **RESOLVED**

---

### 2. ~~Hardcoded Phone Number Scattered Across Codebase~~ ✅ FIXED

**Problem**: WhatsApp number `+34 640 919 319` is hardcoded in 10+ locations. Needs to be changed to `+591 69703379`.

**Current Number**: ~~`+34 640 919 319` (Spain)~~ → `+591 69703379` (Bolivia) ✅
**New Number**: `+591 69703379` (Bolivia)

**All Locations Updated**:

| File | Line(s) | Context | Status |
|------|---------|---------|--------|
| `client/src/pages/Home.tsx` | 53, 65, 77, 392, 707, 777 | Course modals, Almanaque CTA, Pack CTA | ✅ |
| `client/src/components/Navbar.tsx` | 100, 131 | Desktop & mobile contact buttons | ✅ |
| `client/src/components/Footer.tsx` | 56 | Contact phone display | ✅ |
| `client/src/components/Newsletter.tsx` | 170 | Post-subscription CTA | ✅ |
| `client/src/pages/GiftCards.tsx` | 39 | WhatsApp redirect | ✅ |
| `client/src/pages/Redeem.tsx` | 96 | Support link | ✅ |

**Fix Applied**: Created centralized config file at `client/src/config/contact.ts`.

---

### 3. ~~Hardcoded Prices Need Centralization~~ ✅ CONFIG CREATED

**Problem**: Prices are duplicated across multiple files, making updates error-prone.

**Current Price Locations**:

| Item | Price (Bs) | Price (USD) | Files |
|------|-----------|-------------|-------|
| Detox Frecuencial | 500 | 50 | Home.tsx (x2), GiftCards.tsx |
| Reconfiguración | 500 | 50 | Home.tsx (x2), GiftCards.tsx |
| Mapa Resonancial | 500 | 50 | Home.tsx (x2), GiftCards.tsx |
| Pack Completo | 1,200 | 120 | Home.tsx, GiftCards.tsx |
| Almanaque Ritual | 200 | 20 | Home.tsx (x2) |

**Fix Applied**: Created `client/src/config/pricing.json` with all pricing data centralized.

---

## High Priority Issues (P1)

### 4. No Unsubscribe Endpoint

**Problem**: Newsletter subscribers can sign up but cannot unsubscribe.

**Compliance Risk**: GDPR/CAN-SPAM violation.

**Files Affected**:
- `server/routes.ts` - needs new endpoint
- `shared/schema.ts` - may need `unsubscribed_at` field

---

### 5. ~~Incomplete Instagram Link~~ ✅ FIXED

**Problem**: Instagram link in footer is a placeholder (`#`).

**File**: `client/src/components/Footer.tsx` (line 52)

```tsx
<a href="https://www.instagram.com/terapiaresonancial/" target="_blank" rel="noopener noreferrer">@terapiaresonancial</a>
```

**Fix Applied**: Updated to actual Instagram URL.

---

### 6. Gift Card Redemption Not Functional

**Problem**: `/canjear` page uses `setTimeout` simulation instead of real validation.

**File**: `client/src/pages/Redeem.tsx` (lines 21-25)

**Status**: By design - scheduled for Phase 1 implementation.

---

## Medium Priority Issues (P2)

### 7. ~~Dead Link - "Reto 21 Días"~~ ✅ FIXED

**Problem**: Footer links to `#reto` but no such section exists.

**File**: `client/src/components/Footer.tsx` (line 37)

**Fix Applied**: Replaced with "Almanaque Ritual" link pointing to `#almanaque`.

---

### 8. Placeholder Privacy/Terms Links

**Problem**: Privacy policy and Terms links go to `#`.

**File**: `client/src/components/Footer.tsx` (lines 66-67)

---

### 9. ~~Phone Placeholder in Newsletter~~ ✅ FIXED

**Problem**: Phone input placeholder shows Spain number, but default country is Bolivia.

**File**: `client/src/components/Newsletter.tsx` (line 263)

```tsx
placeholder="69703379…"
```

**Fix Applied**: Updated to Bolivia format example. Also set default country code to Bolivia (591).

---

### 10. Email Service Fallback Not Communicated

**Problem**: When WhatsApp delivery fails, system silently falls back to email without informing the user.

**Files Affected**:
- `server/routes.ts`
- `server/services/whatsapp.ts`

---

## Low Priority Issues (P3)

### 11. Mixed Domain References

**Problem**: Some places reference `terapiaresonancial.com`, others use no domain.

**Files Affected**:
- `server/services/email.ts` (line 135)
- Footer contact email references

---

### 12. No Error Tracking

**Problem**: No Sentry or similar error tracking integration.

**Impact**: Difficult to diagnose production issues.

---

### 13. No Rate Limiting

**Problem**: API endpoints have no rate limiting.

**Risk**: Potential for abuse (spam subscriptions, etc.)

---

### 14. Missing Test Suite

**Problem**: No automated tests found in codebase.

---

## Implementation Checklist

### Immediate Actions (This Sprint) ✅ COMPLETED

- [x] **Create pricing config file** (`client/src/config/pricing.json`) ✅
- [x] **Create contact config file** (`client/src/config/contact.ts`) ✅
- [x] **Update all phone numbers** to `+591 69703379` ✅
- [x] **Fix email template pricing** to match website (BOB/USD) ✅
- [x] **Update Instagram link** in Footer ✅
- [x] **Remove or fix** "Reto 21 Días" footer link ✅

### Short-term Actions (Next Sprint)

- [ ] Add unsubscribe endpoint
- [ ] Create Privacy Policy page
- [ ] Create Terms of Service page
- [ ] Add error tracking (Sentry)

### Long-term Actions (Backlog)

- [ ] Implement gift card redemption backend (Phase 1)
- [ ] Add rate limiting middleware
- [ ] Create test suite
- [ ] Add analytics tracking

---

## Files Changed Summary

| File | Changes Made | Status |
|------|--------------|--------|
| `client/src/config/pricing.json` | **NEW FILE** - Centralized pricing | ✅ Created |
| `client/src/config/contact.ts` | **NEW FILE** - Centralized contact info | ✅ Created |
| `client/src/pages/Home.tsx` | Updated all WhatsApp links to +591 69703379 | ✅ Done |
| `client/src/pages/GiftCards.tsx` | Updated WhatsApp link | ✅ Done |
| `client/src/pages/Redeem.tsx` | Updated WhatsApp link | ✅ Done |
| `client/src/components/Navbar.tsx` | Updated WhatsApp links | ✅ Done |
| `client/src/components/Footer.tsx` | Updated phone, fixed Instagram, replaced dead link | ✅ Done |
| `client/src/components/Newsletter.tsx` | Updated WhatsApp link, fixed placeholder, set default to Bolivia | ✅ Done |
| `server/services/email.ts` | Fixed pricing to BOB/USD | ✅ Done |

---

## Notes

- WhatsApp is the primary conversion channel - phone number accuracy is critical
- Spanish is the primary language - all user-facing text should remain in Spanish
- The codebase follows good TypeScript practices - maintain type safety when making changes
- All gift card/redemption flows are currently UI-only (Phase 1 feature)
