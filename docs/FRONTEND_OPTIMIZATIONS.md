# Frontend Optimization Plan: Resonancial Landing Page

> **Document Version:** 1.0
> **Date:** January 2026
> **Scope:** Performance, Core Web Vitals, Accessibility, SEO

---

## Executive Summary

This document outlines optimization opportunities identified through a comprehensive audit of the Resonancial landing page. The analysis reveals **critical performance bottlenecks** primarily caused by unoptimized media assets (~85+ MB of GIFs) and missing code-splitting patterns. Implementing the recommended optimizations could yield a **50-70% improvement** in Core Web Vitals scores.

---

## Table of Contents

1. [Critical Issues](#1-critical-issues)
2. [Performance Bottlenecks](#2-performance-bottlenecks)
3. [Missing Optimizations](#3-missing-optimizations)
4. [Animation Inefficiencies](#4-animation-inefficiencies)
5. [CSS & Tailwind Issues](#5-css--tailwind-issues)
6. [Accessibility Concerns](#6-accessibility-concerns)
7. [Core Web Vitals Analysis](#7-core-web-vitals-analysis)
8. [Network & API Issues](#8-network--api-issues)
9. [Bundle Size Analysis](#9-bundle-size-analysis)
10. [Implementation Roadmap](#10-implementation-roadmap)
11. [Quick Wins](#11-quick-wins)

---

## 1. Critical Issues

### 1.1 Massive GIF Assets (CRITICAL)

**Location:** [Home.tsx:12-20](client/src/pages/Home.tsx#L12-L20)

**Problem:** Multiple large GIF files imported directly into the bundle:
- `WhatsApp_GIF_2026-01-10_at_21.24.51.gif` (~20 MB)
- `WhatsApp_GIF_2026-01-10_at_21.26.27_1768148954010.gif` (~45 MB)
- `WhatsApp_GIF_2026-01-10_at_21.28.35_1768149189535.gif` (~19 MB)
- **Total: ~85+ MB of GIFs**

**Impact:**
- Page load time > 10 seconds on average connections
- LCP (Largest Contentful Paint) failing
- Mobile users may abandon due to data usage
- Bundle size makes deployment slow

**Solution:**
```bash
# Convert GIFs to optimized video formats
ffmpeg -i input.gif -c:v libvpx-vp9 -b:v 0 -crf 30 output.webm
ffmpeg -i input.gif -c:v libx264 -crf 25 -preset medium output.mp4
```

```tsx
// Replace GIF with video element
<video
  autoPlay
  loop
  muted
  playsInline
  poster="/images/poster.webp"
  className="w-full h-full object-cover"
>
  <source src="/videos/animation.webm" type="video/webm" />
  <source src="/videos/animation.mp4" type="video/mp4" />
</video>
```

**Expected Savings:** ~83 MB (97% reduction)

---

### 1.2 External Hero Image Dependency

**Location:** [Home.tsx:448](client/src/pages/Home.tsx#L448)

**Problem:** Hero image loaded from Canva CDN
```tsx
src="https://editorialverdadparavivir.my.canva.site/portal-resonancial-2026/_assets/media/..."
```

**Impact:**
- DNS lookup + connection to external domain
- No control over caching headers
- Risk of broken images if Canva changes URLs
- No responsive image optimization

**Solution:**
1. Download and self-host the image
2. Create responsive variants (640w, 1024w, 1920w)
3. Convert to WebP format
4. Add preload link in `<head>`

```html
<!-- index.html -->
<link rel="preload" as="image" href="/images/hero-1920.webp"
      imagesrcset="/images/hero-640.webp 640w, /images/hero-1024.webp 1024w, /images/hero-1920.webp 1920w"
      imagesizes="100vw" />
```

---

## 2. Performance Bottlenecks

### 2.1 No Route-Based Code Splitting

**Location:** [App.tsx](client/src/App.tsx)

**Current State:** All pages bundled together
```tsx
import Home from "@/pages/Home";
import GiftCards from "@/pages/GiftCards";
import Redeem from "@/pages/Redeem";
```

**Solution:**
```tsx
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('@/pages/Home'));
const GiftCards = lazy(() => import('@/pages/GiftCards'));
const Redeem = lazy(() => import('@/pages/Redeem'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Router>
        <Route path="/" component={Home} />
        <Route path="/tarjetas-regalo" component={GiftCards} />
        <Route path="/canjear" component={Redeem} />
      </Router>
    </Suspense>
  );
}
```

**Expected Impact:** 20-30% reduction in initial bundle

---

### 2.2 Heavy Scroll Animations

**Location:** [Home.tsx:418-422](client/src/pages/Home.tsx#L418-L422)

**Problem:** Multiple transforms calculated on every scroll tick
```tsx
const { scrollY } = useScroll();
const yHero = useTransform(scrollY, [0, 800], [0, 400]);
const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);
const heroContentY = useTransform(scrollY, [0, 400], [0, -60]);
const gradientOpacity = useTransform(scrollY, [0, 500], [0.6, 1]);
```

**Impact:**
- Jank on lower-end devices
- High CPU usage during scroll
- Battery drain on mobile

**Solution:**
```tsx
// Option 1: Reduce number of transforms
const { scrollYProgress } = useScroll();
const heroTransform = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

// Option 2: Use CSS scroll-driven animations (modern browsers)
// No JavaScript execution required
```

---

### 2.3 Modal Always Rendered

**Location:** [Home.tsx](client/src/pages/Home.tsx) - CourseModal, AlmanaqueModal

**Problem:** Heavy modal content in DOM even when closed

**Solution:**
```tsx
// Conditional rendering instead of visibility toggle
{selectedCourse && (
  <CourseModal
    course={courseDetails[selectedCourse]}
    onClose={handleCloseModal}
  />
)}
```

---

## 3. Missing Optimizations

### 3.1 Image Lazy Loading

**Problem:** All images load immediately regardless of viewport position

**Solution:**
```tsx
// Native lazy loading
<img loading="lazy" src="..." alt="..." />

// For critical above-fold images
<img fetchpriority="high" src="..." alt="..." />
```

### 3.2 Font Loading Strategy

**Location:** [index.html:20](client/index.html#L20)

**Current:** Render-blocking font load
```html
<link href="https://fonts.googleapis.com/css2?family=..." rel="stylesheet">
```

**Solution:**
```html
<!-- Preconnect to font origin -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Non-blocking font load -->
<link rel="preload" as="style"
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Montserrat:wght@300;400;500&display=swap"
      onload="this.onload=null;this.rel='stylesheet'">
<noscript>
  <link href="https://fonts.googleapis.com/css2?family=..." rel="stylesheet">
</noscript>
```

### 3.3 Resource Hints Missing

**Add to index.html:**
```html
<!-- DNS prefetch for API -->
<link rel="dns-prefetch" href="https://api.resonancial.com">
<link rel="preconnect" href="https://api.resonancial.com">

<!-- Preload critical assets -->
<link rel="preload" as="image" href="/logo_symbol.png">
```

### 3.4 No SEO Structured Data

**Solution:** Add JSON-LD schema
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Resonancial",
  "description": "Servicios de bienestar holístico basados en frecuencias",
  "url": "https://resonancial.com",
  "image": "https://resonancial.com/logo.png",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "MX"
  },
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "MXN",
    "lowPrice": "555",
    "highPrice": "4444"
  }
}
</script>
```

---

## 4. Animation Inefficiencies

### 4.1 Repeated Animation Components

**Location:** [Home.tsx:64-93](client/src/pages/Home.tsx#L64-L93)

**Problem:** FadeIn and SectionFadeIn defined inline, recreated each render

**Solution:**
```tsx
// Extract to separate file: components/animations.tsx
import { memo } from 'react';
import { motion } from 'framer-motion';

export const FadeIn = memo(({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
    style={{ willChange: "transform, opacity" }}
  >
    {children}
  </motion.div>
));

FadeIn.displayName = 'FadeIn';
```

### 4.2 No Reduced Motion Support in JS

**Problem:** Framer Motion animations ignore `prefers-reduced-motion`

**Solution:**
```tsx
import { useReducedMotion } from 'framer-motion';

function FadeIn({ children, ...props }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
```

### 4.3 CSS Animation Duplication

**Problem:** Both CSS keyframes (index.css) and Framer Motion used

**Solution:** Standardize on one approach. For simple animations, prefer CSS:
```css
/* Prefer CSS for simple fades */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}
```

---

## 5. CSS & Tailwind Issues

### 5.1 Arbitrary Color Values

**Problem:** Hardcoded colors prevent theme consistency
```tsx
className="from-[rgba(26,20,15,0.3)] via-[rgba(26,20,15,0.6)]"
```

**Solution:** Define in CSS variables
```css
/* index.css */
:root {
  --overlay-light: rgba(26, 20, 15, 0.3);
  --overlay-medium: rgba(26, 20, 15, 0.6);
}
```

```tsx
className="from-[var(--overlay-light)] via-[var(--overlay-medium)]"
```

### 5.2 Unused shadcn/ui Components

**Problem:** 56 components imported, ~10 used on landing page

**Solution:** Tree-shaking should handle this, but verify with bundle analyzer:
```bash
npm install --save-dev rollup-plugin-visualizer
```

```ts
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({ open: true, gzipSize: true })
  ]
});
```

---

## 6. Accessibility Concerns

### 6.1 Missing ARIA Labels

**Locations:**
- Modal close buttons (no aria-label)
- Navigation scroll links (no aria-current)
- Gift card selection buttons (not semantic)

**Solutions:**
```tsx
// Modal close button
<button aria-label="Cerrar modal" onClick={onClose}>
  <X className="h-4 w-4" />
</button>

// Navigation with aria-current
<a href="#servicios" aria-current={isActive ? "page" : undefined}>
  Servicios
</a>

// Gift card as radio group
<RadioGroup value={selectedAmount} onValueChange={setSelectedAmount}>
  <RadioGroupItem value="555" id="amount-555" />
  <Label htmlFor="amount-555">$555 MXN</Label>
</RadioGroup>
```

### 6.2 Missing Skip Link

**Add to App.tsx:**
```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded"
>
  Saltar al contenido principal
</a>
```

### 6.3 Color Contrast Issues

**Potential Issues:**
- `text-muted-foreground` with opacity on dark backgrounds
- Low contrast form inputs

**Solution:** Audit with Lighthouse and fix contrast ratios to meet WCAG AA (4.5:1 for normal text)

---

## 7. Core Web Vitals Analysis

### Current Estimated Scores

| Metric | Target | Estimated Current | Status |
|--------|--------|-------------------|--------|
| LCP | < 2.5s | > 4.0s | ❌ Poor |
| INP | < 200ms | ~150ms | ⚠️ Needs Improvement |
| CLS | < 0.1 | ~0.15 | ⚠️ Needs Improvement |

### After Optimizations

| Metric | Target | Projected | Status |
|--------|--------|-----------|--------|
| LCP | < 2.5s | < 1.5s | ✅ Good |
| INP | < 200ms | < 100ms | ✅ Good |
| CLS | < 0.1 | < 0.05 | ✅ Good |

### LCP Optimization Strategy

1. **Convert GIFs to video** (biggest impact)
2. **Preload hero image**
3. **Self-host critical fonts**
4. **Implement responsive images**

### CLS Prevention

1. **Reserve space for images** with aspect-ratio
2. **Font-display: swap** to prevent layout shift
3. **Fixed dimensions on modals**

---

## 8. Network & API Issues

### 8.1 API Client Improvements

**Location:** [api.ts](client/src/lib/api.ts)

**Current Issues:**
- No timeout handling
- No retry logic
- Empty fallback URL

**Solution:**
```typescript
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.warn('VITE_API_URL not set, API calls will fail');
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 3) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    if (retries > 0 && error.name !== 'AbortError') {
      await new Promise(r => setTimeout(r, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}
```

### 8.2 React Query Configuration

**Location:** [queryClient.ts](client/src/lib/queryClient.ts)

**Improvement:**
```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes instead of Infinity
      gcTime: 30 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    }
  },
});
```

---

## 9. Bundle Size Analysis

### Current Estimated Breakdown

| Package | Size (gzipped) | Notes |
|---------|----------------|-------|
| React + ReactDOM | ~45 KB | Required |
| Framer Motion | ~50 KB | Heavy, consider alternatives |
| shadcn/ui + Radix | ~100 KB | Tree-shake unused |
| Lucide Icons | ~20 KB | Import individually |
| TanStack Query | ~15 KB | Required |
| Other | ~50 KB | Wouter, Zod, etc. |
| **JS Total** | **~280 KB** | |
| **GIF Assets** | **~85 MB** | CRITICAL |
| **Total** | **~85+ MB** | |

### After Optimization Target

| Package | Size (gzipped) | Reduction |
|---------|----------------|-----------|
| JS Bundle | ~250 KB | -10% (code split) |
| Video Assets | ~2 MB | -97% |
| Images | ~500 KB | Optimized |
| **Total** | **~3 MB** | **96% reduction** |

---

## 10. Implementation Roadmap

### Phase 1: Critical (Week 1)
**Impact: High | Effort: Medium**

1. ✅ Convert GIFs to WebM/MP4 video
2. ✅ Self-host hero image with responsive variants
3. ✅ Add image preloading to index.html
4. ✅ Implement route-based code splitting

### Phase 2: Performance (Week 2)
**Impact: Medium-High | Effort: Medium**

1. Add lazy loading to below-fold images
2. Optimize font loading strategy
3. Reduce scroll animation complexity
4. Lazy render modal content
5. Add resource hints (preconnect, dns-prefetch)

### Phase 3: Polish (Week 3)
**Impact: Medium | Effort: Low-Medium**

1. Add structured data (JSON-LD)
2. Memoize animation components
3. Fix accessibility issues (ARIA, skip links)
4. Improve API error handling
5. Add bundle analyzer to CI

### Phase 4: Advanced (Future)
**Impact: Low-Medium | Effort: High**

1. Service Worker for offline support
2. Image CDN integration (Cloudinary/Vercel OG)
3. Edge caching strategy
4. A/B testing infrastructure
5. Performance monitoring (Sentry, SpeedCurve)

---

## 11. Quick Wins

These can be implemented immediately with minimal risk:

### 1. Add Image Lazy Loading
```diff
- <img src={courseImage} alt="..." />
+ <img src={courseImage} alt="..." loading="lazy" />
```

### 2. Add Font Display Swap
```diff
- family=Cormorant+Garamond:wght@400;500&display=swap
+ family=Cormorant+Garamond:wght@400;500&display=swap
```
(Already present - verify it's working)

### 3. Add Preconnect
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

### 4. Memoize Static Components
```tsx
const Footer = memo(function Footer() { ... });
const Navbar = memo(function Navbar() { ... });
```

### 5. Add aria-labels to Buttons
```tsx
<button aria-label="Cerrar" onClick={onClose}>
```

### 6. Fix Mobile Viewport
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

---

## Files Requiring Changes

### High Priority
| File | Changes Needed |
|------|----------------|
| [Home.tsx](client/src/pages/Home.tsx) | Image optimization, animation cleanup, memoization |
| [index.html](client/index.html) | Preload links, resource hints, structured data |
| [App.tsx](client/src/App.tsx) | Code splitting with lazy() |
| [attached_assets/](attached_assets/) | Convert GIFs to video |

### Medium Priority
| File | Changes Needed |
|------|----------------|
| [vite.config.ts](vite.config.ts) | Bundle analyzer, optimization settings |
| [Newsletter.tsx](client/src/components/Newsletter.tsx) | Form optimization, accessibility |
| [api.ts](client/src/lib/api.ts) | Error handling, timeouts |

### Low Priority
| File | Changes Needed |
|------|----------------|
| [index.css](client/src/index.css) | CSS variable cleanup |
| [Footer.tsx](client/src/components/Footer.tsx) | Accessibility |
| [Navbar.tsx](client/src/components/Navbar.tsx) | Accessibility, memoization |

---

## Metrics to Track

After implementing optimizations, monitor:

1. **Lighthouse Score** - Target: 90+ Performance
2. **Core Web Vitals** via Chrome UX Report
3. **Bundle Size** via Vite build output
4. **Time to Interactive** via WebPageTest
5. **Bounce Rate** via Analytics (should decrease)

---

## Conclusion

The Resonancial landing page has a solid foundation with modern technologies (React 19, Tailwind 4, Vite 7). However, the **~85 MB of unoptimized GIF assets** represent a critical performance issue that must be addressed immediately.

By following this optimization roadmap:
- **Phase 1** will reduce page weight by ~97%
- **Phase 2** will improve Core Web Vitals to "Good" status
- **Phase 3** will enhance accessibility and SEO

The expected outcome is a **sub-2-second LCP** and **90+ Lighthouse performance score**, providing users with a fast, accessible experience that reflects the quality of the Resonancial brand.

---

*Document generated by frontend performance audit - January 2026*
