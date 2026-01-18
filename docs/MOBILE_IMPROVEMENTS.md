# Mobile Improvements

This document tracks mobile UX improvements implemented for the Resonancial landing page.

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
- **Mobile**:
  - Sticky close button at top that follows scroll
  - Bottom close bar with "Cerrar" button for thumb-friendly access

#### SimpleModalCloseButton (for text-only modals like Legal)

- **Desktop**: Absolute positioned top-right close button
- **Mobile**: Sticky close button at top with darker background for visibility

---

### Implementation Details

#### Desktop Behavior (md+ breakpoint)
- Close button remains `absolute top-4 right-4`
- Same visual design as before (frosted glass effect)
- No bottom bar

#### Mobile Behavior (< md breakpoint)
- Top close button becomes `sticky` and follows scroll
- Enhanced visibility with darker background and shadow
- Bottom bar appears with full-width "Cerrar" button
- Gradient background on bottom bar for content fade

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
| [client/src/components/ui/modal-close.tsx](../client/src/components/ui/modal-close.tsx) | NEW - Reusable close button components |
| [client/src/pages/Home.tsx](../client/src/pages/Home.tsx) | Updated CourseModal and AlmanaqueModal |
| [client/src/components/Founder.tsx](../client/src/components/Founder.tsx) | Updated FounderModal |
| [client/src/components/LegalModals.tsx](../client/src/components/LegalModals.tsx) | Updated PrivacyModal and TermsModal |

---

### Implementation Checklist

- [x] Create `ModalCloseButton` component with sticky mobile behavior
- [x] Create `SimpleModalCloseButton` for text-only modals
- [x] Update CourseModal to use new component
- [x] Update AlmanaqueModal to use new component
- [x] Update FounderModal to use new component
- [x] Update PrivacyModal to use new component
- [x] Update TermsModal to use new component
- [x] TypeScript check passes
- [x] Production build succeeds
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome

---

### Design Decisions

1. **Sticky vs Fixed**: Used `sticky` positioning instead of `fixed` so the button stays within the modal scroll context and doesn't overlap page content outside the modal.

2. **Bottom bar with gradient**: Added a gradient fade from transparent to zinc-950 so the bottom bar blends smoothly with modal content.

3. **Two components**: Created separate components for image-header modals (with bottom bar) and text modals (simpler, no bottom bar) to avoid unnecessary UI elements.

4. **Thumb-friendly**: Bottom close bar is full-width and positioned in the thumb zone for easy one-handed mobile use.

5. **Preserved desktop experience**: Desktop users see the same familiar top-right close button without changes.

---

## Future Mobile Improvements (Backlog)

1. **Services Section**: Consider horizontal scroll on mobile for service cards
2. **Pack Completo**: Evaluate sticky CTA on mobile scroll
3. **Navigation**: Review hamburger menu touch targets
4. **Forms**: Ensure all form inputs are properly sized for touch
5. **Images**: Lazy loading for below-fold images

---

## References

- [Web Content Accessibility Guidelines (Touch Target Size)](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Apple Human Interface Guidelines - Modality](https://developer.apple.com/design/human-interface-guidelines/modality)
- [Material Design - Dialogs](https://m3.material.io/components/dialogs/overview)
