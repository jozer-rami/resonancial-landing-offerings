# Landing Page Design Audit

**Date:** 2026-01-18
**Audited by:** Claude Code (Web Interface Guidelines Skill)
**Source:** [Vercel Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines)

---

## Executive Summary

This audit reviews the Resonancial landing page (`Home.tsx` and related components) against modern web interface best practices. The page demonstrates strong foundations in accessibility (reduced motion support, ARIA labels) and performance (video optimization, memoization), but has opportunities for improvement in consistency, typography, and keyboard navigation.

**Overall Score:** 7.5/10

---

## Findings

### 1. Missing Skip Link for Accessibility

**Severity:** High
**Guideline:** Accessibility
**Location:** [Home.tsx:518](../client/src/pages/Home.tsx#L518)

**Issue:**
The page lacks a skip-to-content link for keyboard and screen reader users. This forces users to tab through the entire navigation before reaching main content.

**Recommendation:**
Add a visually hidden link at the top of the page that becomes visible on focus:

```tsx
// Add as first child inside the main div
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-black focus:px-4 focus:py-2 focus:rounded-full focus:outline-none"
>
  Saltar al contenido
</a>
```

---

### 2. Inconsistent Heading Hierarchy

**Severity:** Medium
**Guideline:** Accessibility
**Location:** Multiple sections

**Issue:**
- The hero section has no semantic `<h1>` (logo image acts as one visually)
- Some sections jump from `<h2>` to `<h3>` without clear hierarchy
- Screen readers may not correctly interpret page structure

**Recommendation:**
1. Add a visually hidden `<h1>` in the hero:
```tsx
<h1 className="sr-only">Portal Resonancial - Terapia de Alineación Energética</h1>
```

2. Ensure all sections follow consistent hierarchy:
   - `<h1>` - Page title (one per page)
   - `<h2>` - Section titles
   - `<h3>` - Subsection titles
   - `<h4>` - Card/item titles

---

### 3. Missing `scroll-margin-top` for Anchor Links

**Severity:** Medium
**Guideline:** Focus States / Navigation
**Location:** [Home.tsx:610](../client/src/pages/Home.tsx#L610), [Home.tsx:637](../client/src/pages/Home.tsx#L637)

**Issue:**
When navigating to anchor links (`#servicios`, `#filosofia`, `#faq`), the fixed navbar overlaps the section headers, hiding content.

**Recommendation:**
Add scroll margin to all elements with IDs in your global CSS:

```css
/* In your global styles or Tailwind config */
[id] {
  scroll-margin-top: 80px; /* Match navbar height */
}

/* Or with Tailwind utility */
.scroll-mt-20 {
  scroll-margin-top: 5rem;
}
```

Then apply to sections:
```tsx
<section id="servicios" className="scroll-mt-20 py-12 md:py-16">
```

---

### 4. Video Backgrounds Missing `aria-hidden`

**Severity:** Low
**Guideline:** Accessibility
**Location:** [Home.tsx:37-51](../client/src/pages/Home.tsx#L37-L51)

**Issue:**
The `VideoBackground` component renders decorative videos that should be hidden from assistive technologies.

**Recommendation:**
Add `aria-hidden="true"` to purely decorative media:

```tsx
const VideoBackground = memo(({ videoKey, className = "" }: {
  videoKey: keyof typeof videoAssets,
  className?: string
}) => {
  const video = videoAssets[videoKey];
  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      aria-hidden="true"  // Add this
      className={className}
    >
      <source src={video.webm} type="video/webm" />
      <source src={video.mp4} type="video/mp4" />
    </video>
  );
});
```

---

### 5. Typography: Ellipsis Character Usage

**Severity:** Low
**Guideline:** Typography
**Location:** [Newsletter.tsx:290](../client/src/components/Newsletter.tsx#L290), [Newsletter.tsx:365](../client/src/components/Newsletter.tsx#L365)

**Issue:**
Some placeholders correctly use the Unicode ellipsis (`…`) but loading states only show a spinner without text.

**Recommendation:**
1. Ensure all placeholder text uses proper ellipsis: `placeholder="tu@email.com…"`
2. Add loading text with ellipsis where appropriate:
```tsx
{status === "loading" ? (
  <>
    <Loader2 className="w-4 h-4 animate-spin mr-2" />
    Enviando…
  </>
) : (
  "Obtener mi descuento"
)}
```

---

### 6. Buttons Missing Visible Focus States

**Severity:** Medium
**Guideline:** Focus States
**Location:** [Navbar.tsx:108-115](../client/src/components/Navbar.tsx#L108-L115), [Footer.tsx:71-82](../client/src/components/Footer.tsx#L71-L82)

**Issue:**
Several interactive elements lack explicit `focus-visible` ring styles:
- Mobile menu toggle button
- Footer legal buttons (Privacy, Terms)
- Some carousel navigation buttons

**Recommendation:**
Add consistent focus styles to all interactive elements:

```tsx
// Mobile menu button
<button
  className="md:hidden text-white p-2 rounded-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
  aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
>

// Footer buttons
<button
  onClick={() => setPrivacyModalOpen(true)}
  className="hover:text-white transition-colors focus-visible:text-white focus-visible:underline focus-visible:outline-none"
>
  Privacidad
</button>
```

---

### 7. Inconsistent Section Padding/Spacing

**Severity:** Medium
**Guideline:** Layout / Design System
**Location:** Multiple sections

**Issue:**
Vertical rhythm varies across sections without clear pattern:

| Section | Padding |
|---------|---------|
| Philosophy | `py-12 md:py-16` |
| Founder | `py-16 md:py-24` |
| Services | `py-12 md:py-16` |
| Testimonials | `py-12 md:py-16` |
| Pack | `py-12 md:py-16` |
| Almanaque | `py-16 md:py-24` |
| FAQ | `py-12 md:py-16` |
| Newsletter | `py-10 md:py-12` |

**Recommendation:**
Establish a spacing scale:
- **Major sections** (hero-adjacent, featured): `py-16 md:py-24`
- **Standard sections**: `py-12 md:py-16`
- **Compact sections** (newsletter, transitions): `py-10 md:py-12`

Apply consistently based on visual hierarchy importance.

---

### 8. CTA Button Inconsistency

**Severity:** Medium
**Guideline:** Design System
**Location:** Multiple components

**Issue:**
Primary action buttons have varying styles across the page:

| Location | Style | Border Radius |
|----------|-------|---------------|
| Navbar CTA | Solid primary | `rounded-full` |
| Course cards | Outline → fill on hover | `rounded-full` |
| Newsletter | Solid primary | `rounded-xl` |
| Modals | Mix of solid and outline | `rounded-full` |

**Recommendation:**
Establish a clear button hierarchy:

```tsx
// Primary CTA - Main conversion actions
<Button className="bg-primary text-black hover:bg-primary/90 rounded-full">

// Secondary CTA - Alternative actions
<Button variant="outline" className="border-primary/20 hover:bg-primary hover:text-black rounded-full">

// Tertiary - Low-emphasis actions
<Button variant="ghost" className="text-primary hover:text-primary/80">
```

Standardize all border radii to `rounded-full` for CTAs.

---

### 9. Missing `text-wrap: balance` on Headlines

**Severity:** Low
**Guideline:** Typography
**Location:** [Home.tsx:614-617](../client/src/pages/Home.tsx#L614-L617), [FAQ.tsx:117-118](../client/src/components/FAQ.tsx#L117-L118)

**Issue:**
Large headlines can have awkward line breaks with orphan words, especially on certain viewport widths.

**Recommendation:**
Add CSS text balancing to headlines:

```tsx
<h2 className="text-5xl md:text-6xl font-heading leading-tight mb-8 text-balance">
  El 2026 no se planea. <br/>
  <span className="text-primary italic">Se sintoniza.</span>
</h2>
```

For Tailwind, add to your config if not available:
```js
// tailwind.config.js
theme: {
  extend: {
    textWrap: {
      balance: 'balance',
      pretty: 'pretty',
    }
  }
}
```

---

### 10. Hero Image Optimization

**Severity:** Low
**Guideline:** Performance
**Location:** [Home.tsx:527-534](../client/src/pages/Home.tsx#L527-L534)

**Issue:**
The hero background image uses `fetchPriority="high"` correctly but could benefit from additional optimizations.

**Recommendation:**
1. Add `decoding="async"` for non-blocking decode:
```tsx
<img
  src="https://..."
  alt="Portal Resonancial Background"
  width={1920}
  height={1080}
  fetchPriority="high"
  decoding="async"
  className="w-full h-[120%] object-cover object-center"
/>
```

2. Consider implementing a blur-up placeholder (LQIP) pattern for perceived performance
3. Self-host the hero image instead of relying on external Canva URL for reliability

---

## Summary Matrix

| # | Issue | Severity | Category | Effort |
|---|-------|----------|----------|--------|
| 1 | Missing skip link | High | Accessibility | Low |
| 2 | Heading hierarchy | Medium | Accessibility | Medium |
| 3 | No scroll-margin-top | Medium | Navigation | Low |
| 4 | Decorative videos not hidden | Low | Accessibility | Low |
| 5 | Ellipsis typography | Low | Typography | Low |
| 6 | Missing focus-visible states | Medium | Accessibility | Low |
| 7 | Inconsistent section spacing | Medium | Design System | Medium |
| 8 | CTA button inconsistency | Medium | Design System | Medium |
| 9 | Headlines need text-balance | Low | Typography | Low |
| 10 | Hero image optimization | Low | Performance | Low |

---

## Positive Findings

The audit also identified several well-implemented patterns:

- **Reduced motion support**: All animations respect `prefers-reduced-motion` via Framer Motion's `useReducedMotion`
- **Video optimization**: GIFs converted to WebM/MP4 with 92% size reduction
- **Component memoization**: Heavy components use `React.memo` appropriately
- **ARIA labels**: Most icon buttons have proper `aria-label` attributes
- **Semantic HTML**: Good use of `<section>`, `<nav>`, `<footer>` elements
- **Form accessibility**: Newsletter form has proper labels and autocomplete attributes
- **Touch support**: Carousel implements proper touch/swipe handling
- **Overscroll containment**: Modals use `overscroll-behavior: contain`

---

## Implementation Priority

### Phase 1: Quick Wins (Low effort, High impact)
1. Add skip link
2. Add scroll-margin-top to sections
3. Add aria-hidden to decorative videos
4. Fix focus-visible states on buttons

### Phase 2: Design System Alignment
5. Standardize CTA button styles
6. Normalize section padding
7. Fix heading hierarchy

### Phase 3: Polish
8. Add text-balance to headlines
9. Optimize hero image loading
10. Standardize ellipsis usage

---

## References

- [Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Tailwind CSS Accessibility](https://tailwindcss.com/docs/screen-readers)
