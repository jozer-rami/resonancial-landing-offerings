/**
 * Centralized Contact Configuration
 *
 * All contact information should be imported from this file
 * to ensure consistency across the application.
 */

export const contact = {
  // Primary WhatsApp number for all CTAs
  whatsapp: {
    number: "59169703379", // Without + sign for wa.me links
    display: "+591 69703379", // Formatted for display
    countryCode: "591",
    localNumber: "69703379",
  },

  // Email addresses
  email: {
    contact: "info@terapiaresonancial.com",
    noreply: "noreply@terapiaresonancial.com",
  },

  // Social media
  social: {
    instagram: {
      handle: "@terapiaresonancial",
      url: "https://www.instagram.com/terapiaresonancial/",
    },
  },

  // Website URLs
  website: {
    main: "https://terapiaresonancial.com",
    domain: "terapiaresonancial.com",
  },
} as const;

/**
 * Generate WhatsApp URL with pre-filled message
 */
export function getWhatsAppUrl(message?: string): string {
  const baseUrl = `https://wa.me/${contact.whatsapp.number}`;
  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }
  return baseUrl;
}

/**
 * Pre-defined WhatsApp messages for common actions
 */
export const whatsappMessages = {
  contact: "",
  reserveDetox: "Hola, quiero reservar DETOX FRECUENCIAL",
  reserveReconfiguracion: "Hola, quiero reservar RECONFIGURACIÓN FRECUENCIAL",
  reserveMapa: "Hola, quiero reservar MAPA RESONANCIAL",
  reservePack: "Hola, quiero reservar el pack completo PORTAL RESONANCIAL",
  reserveAlmanaque: "Hola, quiero mi Almanaque Ritual Resonancial Personalizado 2026",
  reserveWithDiscount: "Hola, quiero reservar una sesión con mi código de descuento",
  giftCard: (service: string, price: string, from: string, to: string, message: string) =>
    `Hola, quiero regalar una Gift Card de ${service} (${price}).

De: ${from}
Para: ${to}
Mensaje: ${message}`,
} as const;
