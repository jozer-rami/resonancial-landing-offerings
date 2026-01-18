# Mobile Improvements

This document tracks mobile UX improvements implemented for the Resonancial landing page.

---

## 1. Testimonials Carousel Touch Scrolling

**Status**: IMPLEMENTED (Embla Carousel)

### Issue Summary

**QA Finding**: The testimonials carousel on mobile devices cannot be navigated using touch/swipe gestures. Users must tap the navigation buttons (prev/next arrows or dot indicators) to change pages.

**Expected Behavior**: Users should be able to swipe left/right to navigate between testimonial pages, providing a native mobile experience.

**Affected Component**: [Testimonials.tsx](../client/src/components/Testimonials.tsx)

---

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

#### Implementation

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

## 2. Modal Close Button Accessibility

**Status**: IMPLEMENTED

### Issue Summary

**QA Finding**: Modal close buttons are fixed at the top-right corner. On mobile devices with long modal content, users must scroll all the way back up to close the modal.

**Expected Behavior**: Users should be able to easily close modals without scrolling, especially on mobile devices.

**Affected Components**:
- [Home.tsx](../client/src/pages/Home.tsx) - CourseModal, AlmanaqueModal
- [Founder.tsx](../client/src/components/Founder.tsx) - FounderModal
- [LegalModals.tsx](../client/src/components/LegalModals.tsx) - PrivacyModal, TermsModal

---

### Solution: Mobile-Friendly Close Button Components

Created reusable close button components that provide different experiences for mobile vs desktop:

**New Component**: [modal-close.tsx](../client/src/components/ui/modal-close.tsx)

#### ModalCloseButton (for modals with hero images)

- **Desktop**: Absolute positioned top-right close button (unchanged behavior)
- **Mobile**: Sticky close button at top that follows scroll

#### SimpleModalCloseButton (for text-only modals like Legal)

- **Desktop**: Absolute positioned top-right close button
- **Mobile**: Sticky close button at top with darker background for visibility

---

### Implementation Details

#### Desktop Behavior (md+ breakpoint)
- Close button remains `absolute top-4 right-4`
- Same visual design as before (frosted glass effect)

#### Mobile Behavior (< md breakpoint)
- Top close button becomes `sticky` and follows scroll
- Enhanced visibility with darker background (`bg-black/70`) and shadow
- Button stays visible as user scrolls through modal content

---

### Code Example

```tsx
// For modals with hero images
import { ModalCloseButton } from "@/components/ui/modal-close";

<DialogContent>
  <div className="relative">
    <img src={heroImage} ... />
    <ModalCloseButton />
    <div className="p-8">
      {/* Modal content */}
    </div>
  </div>
</DialogContent>

// For text-only modals
import { SimpleModalCloseButton } from "@/components/ui/modal-close";

<DialogContent>
  <div className="relative">
    <SimpleModalCloseButton />
    <div className="p-8">
      {/* Modal content */}
    </div>
  </div>
</DialogContent>
```

---

### Files Modified

| File | Changes |
|------|---------|
| [client/src/components/Testimonials.tsx](../client/src/components/Testimonials.tsx) | Embla Carousel integration |
| [client/src/components/ui/modal-close.tsx](../client/src/components/ui/modal-close.tsx) | NEW - Reusable close button components |
| [client/src/pages/Home.tsx](../client/src/pages/Home.tsx) | Updated CourseModal and AlmanaqueModal |
| [client/src/components/Founder.tsx](../client/src/components/Founder.tsx) | Updated FounderModal |
| [client/src/components/LegalModals.tsx](../client/src/components/LegalModals.tsx) | Updated PrivacyModal and TermsModal |

---

### Design Decisions

1. **Sticky vs Fixed**: Used `sticky` positioning instead of `fixed` so the button stays within the modal scroll context and doesn't overlap page content outside the modal.

2. **Two components**: Created separate components for image-header modals and text modals with slightly different styling (darker background for text modals for better visibility).

3. **Preserved desktop experience**: Desktop users see the same familiar top-right close button without changes.

4. **Clean mobile UX**: Sticky X button follows scroll without additional UI elements, keeping the modal content clean.

---

## Testing Checklist

- [ ] Test carousel swipe on iOS Safari
- [ ] Test carousel swipe on Android Chrome
- [ ] Test modal close on iOS Safari
- [ ] Test modal close on Android Chrome
- [ ] Verify button navigation still works
- [ ] Verify "Ver más" expand buttons work

---

## Future Mobile Improvements (Backlog)

1. **Services Section**: Consider horizontal scroll on mobile for service cards
2. **Pack Completo**: Evaluate sticky CTA on mobile scroll
3. **Navigation**: Review hamburger menu touch targets
4. **Forms**: Ensure all form inputs are properly sized for touch
5. **Images**: Lazy loading for below-fold images
6. **Touch Feedback**: Add haptic feedback consideration for CTAs

---

## References

- [Embla Carousel React](https://www.embla-carousel.com/get-started/react/)
- [Framer Motion Drag Gestures](https://www.framer.com/motion/gestures/#drag)
- [Web Content Accessibility Guidelines (Touch Target Size)](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Apple Human Interface Guidelines - Gestures](https://developer.apple.com/design/human-interface-guidelines/gestures)
- [Apple Human Interface Guidelines - Modality](https://developer.apple.com/design/human-interface-guidelines/modality)
- [Material Design - Dialogs](https://m3.material.io/components/dialogs/overview)
