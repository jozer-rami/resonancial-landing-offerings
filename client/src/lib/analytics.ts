/**
 * Umami Analytics Module
 *
 * Privacy-first, cookie-free analytics tracking for Resonancial.
 * Uses Umami Cloud (https://cloud.umami.is) for data collection.
 *
 * Features:
 *   - Zero cookies, no consent banners needed
 *   - ~2KB script (vs 45KB for GA4)
 *   - Full GDPR compliance
 *   - Custom event tracking with typed payloads
 *   - Scroll depth tracking
 *   - Conversion funnel tracking
 *
 * @see https://umami.is/docs/track-events
 */

// ============================================================================
// Type Declarations
// ============================================================================

declare global {
  interface Window {
    umami?: {
      track: {
        (eventName: string, eventData?: EventData): void;
        (callback: (props: PageViewProps) => PageViewProps): void;
      };
    };
  }
}

interface PageViewProps {
  hostname: string;
  language: string;
  referrer: string;
  screen: string;
  title: string;
  url: string;
  website: string;
}

type EventData = Record<string, string | number | boolean>;

// ============================================================================
// Event Types - Strictly typed for consistency
// ============================================================================

export type AnalyticsEventName =
  | 'page_view'
  | 'cta_click'
  | 'whatsapp_click'
  | 'modal_open'
  | 'modal_close'
  | 'newsletter_start'
  | 'newsletter_submit'
  | 'newsletter_error'
  | 'scroll_depth'
  | 'gift_card_step'
  | 'gift_card_complete'
  | 'external_link'
  | 'video_play'
  | 'faq_expand';

export interface CTAClickData {
  cta_name: string;
  cta_location: string;
  cta_variant?: string;
}

export interface WhatsAppClickData {
  service: string;
  source: string;
  price?: number;
}

export interface ModalEventData {
  modal_name: string;
  trigger_location?: string;
}

export interface NewsletterEventData {
  method: 'email' | 'whatsapp';
  source?: string;
}

export interface ScrollDepthData {
  depth: 25 | 50 | 75 | 100;
  page: string;
}

export interface GiftCardStepData {
  step: number;
  step_name: string;
  amount?: number;
}

// ============================================================================
// Core Tracking Functions
// ============================================================================

/**
 * Check if Umami is loaded and available
 */
function isUmamiAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.umami !== 'undefined';
}

/**
 * Track a custom event with optional data payload
 *
 * @param eventName - The name of the event (use snake_case for consistency)
 * @param eventData - Optional key-value pairs for event properties
 *
 * @example
 * trackEvent('cta_click', { cta_name: 'hero_reservar', cta_location: 'hero' });
 */
export function trackEvent(eventName: AnalyticsEventName | string, eventData?: EventData): void {
  if (!isUmamiAvailable()) {
    // Log in development for debugging
    if (import.meta.env.DEV) {
      console.log(`[Analytics] Event: ${eventName}`, eventData);
    }
    return;
  }

  try {
    window.umami!.track(eventName, eventData);
  } catch (error) {
    // Silently fail - analytics should never break the app
    if (import.meta.env.DEV) {
      console.warn('[Analytics] Failed to track event:', error);
    }
  }
}

/**
 * Track a page view manually (useful for SPA route changes)
 * Note: Umami automatically tracks page views, use this only for virtual pages
 *
 * @param url - Optional custom URL path
 * @param title - Optional custom page title
 */
export function trackPageView(url?: string, title?: string): void {
  if (!isUmamiAvailable()) {
    return;
  }

  try {
    window.umami!.track((props) => ({
      ...props,
      url: url || window.location.pathname,
      title: title || document.title,
    }));
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[Analytics] Failed to track page view:', error);
    }
  }
}

// ============================================================================
// Typed Event Helpers - For consistent tracking across the app
// ============================================================================

/**
 * Track CTA button clicks
 *
 * @example
 * trackCTAClick('reservar_detox', 'course_modal', 'primary');
 */
export function trackCTAClick(name: string, location: string, variant?: string): void {
  trackEvent('cta_click', {
    cta_name: name,
    cta_location: location,
    ...(variant && { cta_variant: variant }),
  });
}

/**
 * Track WhatsApp conversion clicks - PRIMARY CONVERSION EVENT
 *
 * @example
 * trackWhatsAppClick('detox_frecuencial', 'course_modal', 50);
 */
export function trackWhatsAppClick(service: string, source: string, price?: number): void {
  trackEvent('whatsapp_click', {
    service,
    source,
    ...(price && { price }),
  });
}

/**
 * Track modal open events
 *
 * @example
 * trackModalOpen('detox_frecuencial', 'services_section');
 */
export function trackModalOpen(modalName: string, triggerLocation?: string): void {
  trackEvent('modal_open', {
    modal_name: modalName,
    ...(triggerLocation && { trigger_location: triggerLocation }),
  });
}

/**
 * Track modal close events
 *
 * @example
 * trackModalClose('detox_frecuencial');
 */
export function trackModalClose(modalName: string): void {
  trackEvent('modal_close', {
    modal_name: modalName,
  });
}

/**
 * Track newsletter form interactions
 *
 * @example
 * trackNewsletterStart('email', 'footer');
 * trackNewsletterSubmit('whatsapp', 'footer');
 * trackNewsletterError('email', 'invalid_email');
 */
export function trackNewsletterStart(method: 'email' | 'whatsapp', source?: string): void {
  trackEvent('newsletter_start', {
    method,
    ...(source && { source }),
  });
}

export function trackNewsletterSubmit(method: 'email' | 'whatsapp', source?: string): void {
  trackEvent('newsletter_submit', {
    method,
    ...(source && { source }),
  });
}

export function trackNewsletterError(method: 'email' | 'whatsapp', errorType: string): void {
  trackEvent('newsletter_error', {
    method,
    error_type: errorType,
  });
}

/**
 * Track scroll depth milestones
 *
 * @example
 * trackScrollDepth(50, '/');
 */
export function trackScrollDepth(depth: 25 | 50 | 75 | 100, page?: string): void {
  trackEvent('scroll_depth', {
    depth,
    page: page || window.location.pathname,
  });
}

/**
 * Track gift card funnel steps
 *
 * @example
 * trackGiftCardStep(1, 'select_amount', 555);
 * trackGiftCardStep(2, 'enter_details');
 * trackGiftCardStep(3, 'preview');
 */
export function trackGiftCardStep(step: number, stepName: string, amount?: number): void {
  trackEvent('gift_card_step', {
    step,
    step_name: stepName,
    ...(amount && { amount }),
  });
}

/**
 * Track gift card completion
 */
export function trackGiftCardComplete(amount: number): void {
  trackEvent('gift_card_complete', {
    amount,
  });
}

/**
 * Track external link clicks
 *
 * @example
 * trackExternalLink('https://instagram.com/resonancial', 'footer');
 */
export function trackExternalLink(url: string, location: string): void {
  trackEvent('external_link', {
    url,
    location,
  });
}

/**
 * Track video play events
 *
 * @example
 * trackVideoPlay('hero_background', 'hero');
 */
export function trackVideoPlay(videoName: string, location: string): void {
  trackEvent('video_play', {
    video_name: videoName,
    location,
  });
}

/**
 * Track FAQ accordion expansions
 *
 * @example
 * trackFAQExpand('como_funcionan_sesiones');
 */
export function trackFAQExpand(questionId: string): void {
  trackEvent('faq_expand', {
    question_id: questionId,
  });
}

// ============================================================================
// Utility: Create tracked link handler
// ============================================================================

/**
 * Create an onClick handler that tracks before navigation
 * Useful for wrapping existing click handlers
 *
 * @example
 * <a href={whatsappUrl} onClick={createTrackedHandler(() => trackWhatsAppClick('detox', 'modal'))}>
 */
export function createTrackedHandler(
  trackFn: () => void,
  originalHandler?: (e: React.MouseEvent) => void
): (e: React.MouseEvent) => void {
  return (e: React.MouseEvent) => {
    trackFn();
    originalHandler?.(e);
  };
}
