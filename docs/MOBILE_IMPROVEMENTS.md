# Mobile Improvements - Testimonials Carousel Touch Scrolling

## Issue Summary

**QA Finding**: The testimonials carousel on mobile devices cannot be navigated using touch/swipe gestures. Users must tap the navigation buttons (prev/next arrows or dot indicators) to change pages.

**Expected Behavior**: Users should be able to swipe left/right to navigate between testimonial pages, providing a native mobile experience.

**Affected Component**: [Testimonials.tsx](../client/src/components/Testimonials.tsx)

**Status**: IMPLEMENTED (Option B - Embla Carousel)

---

## Root Cause Analysis

The original testimonials carousel used a **custom state-based pagination system** with Framer Motion for animations. The implementation:

1. Used `useState` for page tracking (`currentPage`)
2. Rendered only the current page's testimonials
3. Animated page transitions with `AnimatePresence` and `motion.div`
4. Provided only **button-based navigation** (arrows + dots)

**Missing**: Touch/swipe gesture detection and handling.

### Previous Implementation (Before Fix)

```tsx
<div className="relative overflow-hidden">
  <AnimatePresence mode="wait">
    <motion.div
      key={currentPage}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="grid md:grid-cols-3 gap-4"
    >
      {getCurrentPageItems().map((testimonial) => (
        <TestimonialCard key={testimonial.id} ... />
      ))}
    </motion.div>
  </AnimatePresence>
</div>
```

---

## Implementation (Completed)

### Solution: Embla Carousel Integration

The testimonials carousel was refactored to use **Embla Carousel**, which was already available in the project via the shadcn/ui carousel component.

#### Key Changes Made

1. **Replaced AnimatePresence/motion.div pagination with Embla Carousel**
   - Native touch/swipe support out of the box
   - Momentum scrolling for natural feel
   - Automatic snap points based on slide width

2. **Responsive slide sizing**
   - Mobile: Full-width slides (1 testimonial visible)
   - Desktop (md+): 33.333% width slides (3 testimonials visible)

3. **Updated navigation to use Embla API**
   - `scrollPrev()` / `scrollNext()` for button navigation
   - `scrollTo(index)` for dot navigation
   - Real-time `canScrollPrev` / `canScrollNext` state

4. **Accessibility improvements**
   - Added `role="region"` with `aria-roledescription="carrusel"`
   - Each slide has `role="group"` with `aria-roledescription="diapositiva"`
   - Respects `prefers-reduced-motion` via Embla's `duration` option

#### New Implementation

```tsx
// Embla Carousel setup with touch/swipe support
const [emblaRef, emblaApi] = useEmblaCarousel({
  align: "start",
  skipSnaps: false,
  dragFree: false,
  containScroll: "trimSnaps",
  duration: shouldReduceMotion ? 0 : 20,
});

// Carousel container with touch support
<div
  className="overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
  ref={emblaRef}
  role="region"
  aria-roledescription="carrusel"
>
  <div className="flex gap-4">
    {otherTestimonials.map((testimonial) => (
      <div className="flex-none w-full md:w-[calc(33.333%-11px)]">
        <TestimonialCard ... />
      </div>
    ))}
  </div>
</div>
```

---

## Implementation Options (Reference)

### Option A: Use Framer Motion Drag Gestures (Recommended)

Leverage Framer Motion's built-in drag functionality, which is already installed and used in the project.

#### Pros
- No new dependencies
- Native integration with existing animations
- Lightweight solution
- Built-in velocity detection for natural feel

#### Cons
- Requires careful threshold tuning
- Need to handle drag constraints manually

#### Implementation Steps

1. **Add drag gesture handlers to the carousel container**
   - Enable `drag="x"` on the motion.div
   - Set `dragConstraints` to prevent over-dragging
   - Use `onDragEnd` to detect swipe direction and trigger page change

2. **Calculate swipe threshold**
   - Minimum drag distance: ~50px or 20% of container width
   - Use velocity to detect quick flicks vs. slow drags

3. **Update animation direction based on swipe**
   - Track drag direction to animate exit in correct direction
   - Maintain visual consistency with button navigation

#### Code Changes

```tsx
// New state for tracking drag direction
const [dragDirection, setDragDirection] = useState<'left' | 'right'>('right');

// Drag end handler
const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
  const threshold = 50;
  const velocity = info.velocity.x;
  const offset = info.offset.x;

  // Quick flick or sufficient drag distance
  if (velocity < -500 || offset < -threshold) {
    // Swiped left -> go next
    if (currentPage < totalPages - 1) {
      setDragDirection('left');
      setCurrentPage(p => p + 1);
    }
  } else if (velocity > 500 || offset > threshold) {
    // Swiped right -> go prev
    if (currentPage > 0) {
      setDragDirection('right');
      setCurrentPage(p => p - 1);
    }
  }
};

// Updated motion.div
<motion.div
  key={currentPage}
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  dragElastic={0.2}
  onDragEnd={handleDragEnd}
  initial={{ opacity: 0, x: dragDirection === 'left' ? 100 : -100 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: dragDirection === 'left' ? -100 : 100 }}
  transition={{ duration: 0.3 }}
  className="grid md:grid-cols-3 gap-4 cursor-grab active:cursor-grabbing"
>
```

---

### Option B: Use Embla Carousel (Available in Project)

The project already has `embla-carousel-react` installed and a base [carousel.tsx](../client/src/components/ui/carousel.tsx) component. This would provide full-featured carousel functionality.

#### Pros
- Already installed in the project
- Battle-tested touch handling
- Automatic momentum scrolling
- Many advanced features (loop, autoplay, etc.)

#### Cons
- Requires restructuring the component
- More significant code changes
- May need visual adjustments to match current design

#### Implementation Steps

1. Import and configure Embla carousel hooks
2. Restructure testimonials to use Embla's slide container pattern
3. Adapt current styling to work with Embla's structure
4. Connect existing navigation buttons to Embla API

---

### Option C: Custom Touch Event Handlers

Implement touch events manually using `touchstart`, `touchmove`, and `touchend`.

#### Pros
- Full control over behavior
- No dependency on external libraries
- Can be tuned precisely

#### Cons
- More code to maintain
- Need to handle edge cases manually
- Browser compatibility considerations

---

## Chosen Approach: Option B (Embla Carousel)

**Rationale**:
1. **Already available**: Embla was already installed via shadcn/ui
2. **Battle-tested**: Proven touch handling across all mobile browsers
3. **Native momentum**: Provides physics-based scrolling out of the box
4. **Responsive snapping**: Automatically calculates snap points based on viewport
5. **Accessibility**: Built-in keyboard navigation and ARIA support
6. **Maintainability**: Uses established patterns from shadcn/ui ecosystem

---

## Implementation Checklist

- [x] Import `useEmblaCarousel` hook
- [x] Configure Embla with touch-friendly options
- [x] Replace AnimatePresence grid with flex container
- [x] Make slides responsive (full width mobile, 1/3 desktop)
- [x] Connect navigation buttons to Embla API
- [x] Update dot indicators to use `scrollSnaps`
- [x] Add visual feedback (cursor: grab/grabbing)
- [x] Add `touch-pan-y` for vertical scroll passthrough
- [x] Verify reduced motion preference is respected
- [x] Ensure "Ver más/Ver menos" buttons still work on touch
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Test on Android Firefox

---

## Testing Plan

### Device Testing Matrix

| Device | Browser | Status |
|--------|---------|--------|
| iPhone 15 | Safari | Pending |
| iPhone 15 | Chrome | Pending |
| iPad Pro | Safari | Pending |
| Samsung Galaxy S24 | Chrome | Pending |
| Pixel 8 | Chrome | Pending |
| Android Tablet | Chrome | Pending |

### Test Cases

1. **Basic swipe left**: Advances to next page
2. **Basic swipe right**: Returns to previous page
3. **Quick flick**: Responds to velocity-based swipes
4. **Slow drag release**: Returns to original position if threshold not met
5. **Edge behavior**: Cannot swipe past first/last page
6. **Button navigation**: Still works after implementing swipe
7. **Expand/collapse**: "Ver más" buttons work without triggering swipe
8. **Reduced motion**: Respects `prefers-reduced-motion` setting
9. **Orientation change**: Works in both portrait and landscape

---

## Accessibility Considerations

1. **Keep button navigation**: Swipe is enhancement, not replacement
2. **Respect reduced motion**: Disable drag animations when user prefers reduced motion
3. **Announce page changes**: Consider adding `aria-live` region for screen readers
4. **Touch target sizes**: Ensure all interactive elements are at least 44x44px

---

## Performance Considerations

1. **Use `will-change: transform`** on draggable element
2. **Avoid layout thrashing** during drag
3. **Throttle drag position updates** if needed
4. **Use `touch-action: pan-y`** to allow vertical scrolling while capturing horizontal

---

## Files to Modify

| File | Changes |
|------|---------|
| [client/src/components/Testimonials.tsx](../client/src/components/Testimonials.tsx) | Add drag gestures, direction tracking |

---

## Future Mobile Improvements (Backlog)

These additional mobile UX improvements were identified during this analysis:

1. **Services Section**: Consider horizontal scroll on mobile for service cards
2. **Pack Completo**: Evaluate sticky CTA on mobile scroll
3. **Navigation**: Review hamburger menu touch targets
4. **Forms**: Ensure all form inputs are properly sized for touch
5. **Images**: Lazy loading for below-fold images
6. **Touch Feedback**: Add haptic feedback consideration for CTAs

---

## References

- [Framer Motion Drag Gestures](https://www.framer.com/motion/gestures/#drag)
- [Embla Carousel React](https://www.embla-carousel.com/get-started/react/)
- [Web Content Accessibility Guidelines (Touch Target Size)](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Apple Human Interface Guidelines - Gestures](https://developer.apple.com/design/human-interface-guidelines/gestures)
