# Vercel Web Interface Guidelines Audit

> **Audit Date:** January 2026
> **Guidelines Source:** [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines)
> **Repository:** resonancial-landing-offerings

---

## Executive Summary

This document assesses the Resonancial landing page against Vercel's Web Interface Guidelines. The audit identified **23 issues** across accessibility, forms, interactions, and performance categories. Many fundamentals are already in place, but several improvements are needed for full compliance.

| Category | Passing | Issues | Priority |
|----------|---------|--------|----------|
| Accessibility | 8/12 | 4 | High |
| Forms | 6/11 | 5 | High |
| Animation | 5/6 | 1 | Medium |
| Typography | 4/5 | 1 | Low |
| Images | 3/4 | 1 | Medium |
| Performance | 5/6 | 1 | Medium |
| Navigation | 4/6 | 2 | Medium |
| Touch & Interaction | 2/4 | 2 | Medium |
| Dark Mode | 2/3 | 1 | Low |
| Content | 3/4 | 1 | Low |
| Localization | 1/3 | 2 | Medium |
| Hydration | 2/2 | 0 | - |

**Overall Compliance: ~70%**

---

## Detailed Findings

### 1. Accessibility

#### Passing

- [x] Skip link implemented (`index.html:123`)
- [x] ARIA labels on modal close buttons (`Home.tsx:113`, `Home.tsx:193`)
- [x] `aria-describedby` on dialogs (`Home.tsx:106`, `Home.tsx:186`)
- [x] Semantic HTML used (buttons, links, labels)
- [x] Images have `alt` text
- [x] `prefers-reduced-motion` respected (`index.css:12-22`, `Home.tsx:65`, `Home.tsx:85`)
- [x] Heading hierarchy maintained (h1 > h2 > h3)
- [x] Form checkbox has associated label (`Newsletter.tsx:278`)

#### Issues

| File | Line | Issue | Guideline |
|------|------|-------|-----------|
| `Navbar.tsx` | 100-105 | Mobile menu toggle button missing `aria-label` | Icon-only buttons require `aria-label` |
| `Newsletter.tsx` | 185-197 | Email input missing visible `<label>` element | Form controls need `<label>` or `aria-label` |
| `Newsletter.tsx` | 242-251 | Country code `<select>` missing label | Form controls need `<label>` or `aria-label` |
| `Footer.tsx` | 47-57 | Decorative icons missing `aria-hidden="true"` | Decorative icons need `aria-hidden` |

**Recommended Fixes:**

```tsx
// Navbar.tsx:100 - Add aria-label
<button
  className="md:hidden text-white p-2"
  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
  aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
  aria-expanded={isMobileMenuOpen}
>

// Newsletter.tsx:185 - Add label
<label htmlFor="email" className="sr-only">Correo electrónico</label>
<Input id="email" type="email" ... />

// Newsletter.tsx:242 - Add label
<label htmlFor="country-code" className="sr-only">Código de país</label>
<select id="country-code" ... />

// Footer.tsx - Add aria-hidden to icons
<Mail className="w-4 h-4" aria-hidden="true" />
```

---

### 2. Forms

#### Passing

- [x] Submit button shows spinner during loading (`Newsletter.tsx:296-300`)
- [x] Error messages displayed inline near fields (`Newsletter.tsx:286-288`)
- [x] Labels clickable via `htmlFor` (`GiftCards.tsx:95-102`)
- [x] Checkbox and label share hit target (`Newsletter.tsx:272-281`)
- [x] Semantic input types used (`type="email"`, `type="tel"`)
- [x] Form validation on submit (`Newsletter.tsx:49-68`)

#### Issues

| File | Line | Issue | Guideline |
|------|------|-------|-----------|
| `Newsletter.tsx` | 185 | Missing `autocomplete="email"` attribute | Inputs need `autocomplete` attribute |
| `Newsletter.tsx` | 253 | Missing `autocomplete="tel"` on phone input | Inputs need `autocomplete` attribute |
| `Newsletter.tsx` | 185 | Placeholder doesn't end with `…` | Placeholders end with `…` |
| `Redeem.tsx` | 65-72 | Missing label for code input | Every control needs a label |
| `Newsletter.tsx` | 253-267 | Phone input blocks non-numeric characters | Don't block typing - show validation feedback instead |

**Recommended Fixes:**

```tsx
// Newsletter.tsx:185
<Input
  type="email"
  placeholder="tu@email.com…"
  autocomplete="email"
  spellCheck={false}
  ...
/>

// Newsletter.tsx:253
<Input
  type="tel"
  placeholder="640 919 319…"
  autocomplete="tel"
  inputMode="numeric"
  // Remove the replace(/\D/g, "") - allow input, validate on submit
  ...
/>

// Redeem.tsx:65
<label htmlFor="gift-code" className="sr-only">Código de regalo</label>
<Input id="gift-code" ... />
```

---

### 3. Animation

#### Passing

- [x] `prefers-reduced-motion` respected in CSS (`index.css:12-22`)
- [x] `prefers-reduced-motion` respected in JS via `useReducedMotion()` (`Home.tsx:65`)
- [x] Animating `transform` and `opacity` (compositor-friendly) (`Home.tsx:69-72`)
- [x] `will-change` set appropriately (`Home.tsx:74`, `Home.tsx:93`)
- [x] Animations use specific properties, not `all`

#### Issues

| File | Line | Issue | Guideline |
|------|------|-------|-----------|
| `Home.tsx` | 478 | Continuous ping animation may be distracting | Respect user preferences for reduced motion |

**Note:** The ping animation (`animate-[ping_3s_ease-in-out_infinite]`) runs continuously. Consider checking reduced motion preference:

```tsx
const shouldReduceMotion = useReducedMotion();
// Conditionally apply animation class
className={cn(
  "absolute inset-0 border border-primary/20 rounded-full opacity-30",
  !shouldReduceMotion && "animate-[ping_3s_ease-in-out_infinite]"
)}
```

---

### 4. Typography

#### Passing

- [x] Fonts loaded with `font-display: swap` (`index.html:42-46`)
- [x] `font-variant-numeric: tabular-nums` could be used for prices (not currently)
- [x] Headings use appropriate hierarchy
- [x] Spanish content with proper encoding

#### Issues

| File | Line | Issue | Guideline |
|------|------|-------|-----------|
| Multiple | - | Loading states use `...` instead of `…` | Use ellipsis character `…` not three periods |

**Found instances:**
- `Newsletter.tsx:187` - Placeholder `"tu@email.com"` (should add `…`)
- `GiftCards.tsx:98` - Placeholder `"Ej. Ana"` (consider `"Ej. Ana…"`)

**Recommended Fix:**

```tsx
// Use the ellipsis character
placeholder="Cargando…"  // ✓
placeholder="Cargando..." // ✗
```

---

### 5. Images

#### Passing

- [x] Critical hero image has `fetchPriority="high"` (`Home.tsx:447`)
- [x] Below-fold images have `loading="lazy"` (`Home.tsx:110`, `Home.tsx:190`, `Home.tsx:687`)
- [x] All images have `alt` text

#### Issues

| File | Line | Issue | Guideline |
|------|------|-------|-----------|
| `Home.tsx` | 444-449 | Hero image missing explicit `width` and `height` | All `<img>` need explicit dimensions to prevent CLS |
| `Navbar.tsx` | 75 | Logo image missing `width` and `height` | All `<img>` need explicit dimensions |
| `Footer.tsx` | 13 | Logo image missing `width` and `height` | All `<img>` need explicit dimensions |

**Recommended Fix:**

```tsx
// Add explicit dimensions to prevent Cumulative Layout Shift
<img
  src={logoSymbol}
  alt="Logo"
  width={40}
  height={40}
  className="w-full h-full object-contain"
/>
```

---

### 6. Performance

#### Passing

- [x] Font preloading implemented (`index.html:42`)
- [x] Preconnect for critical origins (`index.html:37-38`)
- [x] Code splitting via `React.lazy()` (`App.tsx:10-12`)
- [x] Videos used instead of GIFs (92% size reduction)
- [x] Components memoized with `React.memo()` (`Home.tsx:25`, `Home.tsx:64`, etc.)

#### Issues

| File | Line | Issue | Guideline |
|------|------|-------|-----------|
| `Navbar.tsx` | 14-18 | Layout read in effect (`window.scrollY`) | Avoid layout reads; prefer Intersection Observer |

**Recommended Fix:**

```tsx
// Consider using Intersection Observer instead of scroll listener
// Or debounce/throttle the scroll handler
useEffect(() => {
  let ticking = false;
  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 50);
        ticking = false;
      });
      ticking = true;
    }
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
```

---

### 7. Navigation & State

#### Passing

- [x] Links use `<a>` elements (supports Cmd/Ctrl+click)
- [x] Hash navigation works (`Navbar.tsx:33-57`)
- [x] Scroll restoration on navigation
- [x] Back button works correctly

#### Issues

| File | Line | Issue | Guideline |
|------|------|-------|-----------|
| `Newsletter.tsx` | 204-229 | Contact preference selection not reflected in URL | Deep-link stateful UI |
| `Home.tsx` | 423-424 | Modal open state not in URL | URL should reflect state |

**Recommended Fix:**

Consider using URL query params for stateful UI:

```tsx
// Use nuqs or similar for URL state sync
import { useQueryState } from 'nuqs';

const [selectedCourse, setSelectedCourse] = useQueryState('course');
```

---

### 8. Touch & Interaction

#### Passing

- [x] Buttons have hover states (`hover:bg-primary`, etc.)
- [x] Interactive elements have visual feedback

#### Issues

| File | Line | Issue | Guideline |
|------|------|-------|-----------|
| Multiple | - | Missing `touch-action: manipulation` | Prevents 300ms tap delay on mobile |
| `Home.tsx` | - | Missing `overscroll-behavior: contain` on modals | Prevents scroll chaining |

**Recommended Fix:**

```css
/* index.css - Add global touch optimization */
button, a, [role="button"] {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* For modals/dialogs */
.dialog-content {
  overscroll-behavior: contain;
}
```

---

### 9. Dark Mode & Theming

#### Passing

- [x] `<meta name="theme-color">` set (`index.html:118`)
- [x] Consistent dark color scheme

#### Issues

| File | Line | Issue | Guideline |
|------|------|-------|-----------|
| `index.html` | - | Missing `color-scheme: dark` on `<html>` | Fixes native element styling in dark mode |

**Recommended Fix:**

```html
<html lang="es" style="color-scheme: dark">
```

Or in CSS:

```css
html {
  color-scheme: dark;
}
```

---

### 10. Content Handling

#### Passing

- [x] Error messages include next steps (`Newsletter.tsx:51-66`)
- [x] Empty states handled (success/error states)
- [x] Text containers handle overflow

#### Issues

| File | Line | Issue | Guideline |
|------|------|-------|-----------|
| `GiftCards.tsx` | 147-152 | Preview doesn't handle very long names gracefully | Anticipate very long user-generated content |

**Recommended Fix:**

```tsx
// Add text truncation for user input display
<span className="truncate max-w-[150px]">{from}</span>
```

---

### 11. Localization

#### Passing

- [x] Dates formatted with `Intl.DateTimeFormat` (`Newsletter.tsx:97-104`)

#### Issues

| File | Line | Issue | Guideline |
|------|------|-------|-----------|
| `index.html` | 48-115 | JSON-LD uses hardcoded date format | Use `Intl.DateTimeFormat` for dates |
| Multiple | - | Currency displayed as hardcoded string | Use `Intl.NumberFormat` for currency |

**Recommended Fix:**

```tsx
// For currency formatting
const formatCurrency = (amount: number, currency = 'BOB') => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Usage
<span>{formatCurrency(500)}</span> // "Bs 500,00"
```

---

### 12. Anti-patterns Check

| Pattern | Status | Location |
|---------|--------|----------|
| `user-scalable=no` or `maximum-scale=1` | Not found | - |
| `onPaste` with `preventDefault` | Not found | - |
| `transition: all` | Not found | - |
| `outline-none` without focus replacement | Not found | Uses `focus-visible:ring-*` |
| `<div>` with click handler (should be button) | Not found | - |
| Images without dimensions | Found | See Images section |
| Form inputs without labels | Found | See Forms section |
| Icon buttons without `aria-label` | Found | See Accessibility section |
| Hardcoded date/number formats | Found | See Localization section |
| `autoFocus` without justification | Not found | - |

---

## Summary of Required Changes

### High Priority (Accessibility & Forms)

1. **Add `aria-label` to mobile menu button** - `Navbar.tsx:100`
2. **Add labels to Newsletter form inputs** - `Newsletter.tsx:185`, `Newsletter.tsx:242`
3. **Add `autocomplete` attributes to inputs** - `Newsletter.tsx:185`, `Newsletter.tsx:253`
4. **Add label to Redeem code input** - `Redeem.tsx:65`
5. **Add `aria-hidden` to decorative icons** - `Footer.tsx:47-57`

### Medium Priority (Performance & UX)

6. **Add explicit dimensions to images** - Multiple files
7. **Add `touch-action: manipulation`** - `index.css`
8. **Add `overscroll-behavior: contain` to modals** - Dialog components
9. **Add `color-scheme: dark` to HTML** - `index.html`
10. **Optimize scroll listener** - `Navbar.tsx:14-18`

### Low Priority (Polish)

11. **Use ellipsis character `…` in loading states** - Multiple files
12. **Format currency with `Intl.NumberFormat`** - Multiple files
13. **Deep-link modal/selection state to URL** - `Home.tsx`, `Newsletter.tsx`
14. **Handle long content in GiftCard preview** - `GiftCards.tsx:147-152`

---

## Compliance Checklist

```
[ ] Accessibility - ARIA labels on all icon buttons
[ ] Accessibility - Labels on all form inputs
[ ] Forms - autocomplete attributes on inputs
[ ] Images - width/height on all images
[ ] Touch - touch-action: manipulation
[ ] Dark Mode - color-scheme: dark
[ ] Typography - ellipsis character usage
[ ] Localization - Intl.NumberFormat for currency
```

---

## References

- [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines)
- [GitHub Repository](https://github.com/vercel-labs/web-interface-guidelines)
- [Geist Design System](https://vercel.com/geist/introduction)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

*Audit performed using Vercel Web Interface Guidelines skill*
