/**
 * WhatsApp Service
 *
 * Sends messages via WaSender API.
 * Fallback to console logging in development if WaSender is not configured.
 */

import { config } from "../config";

interface WaSenderConfig {
  apiKey: string;
}

interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// WaSender configuration from environment
function getWaSenderConfig(): WaSenderConfig | null {
  const apiKey = process.env.WASENDER_API_KEY;

  if (!apiKey) {
    return null;
  }

  return { apiKey };
}

/**
 * Format phone number for WhatsApp (E.164 format without +)
 * WaSender expects the phone number without the + prefix
 */
export function formatPhoneForWhatsApp(phone: string, countryCode: string): string {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, "");
  const cleanCountryCode = countryCode.replace(/\D/g, "");

  // Combine country code and phone (without + for WaSender)
  return `${cleanCountryCode}${cleanPhone}`;
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  // Validate: 10-15 digits (without + prefix for WaSender)
  const pattern = /^[1-9]\d{9,14}$/;
  return pattern.test(phone);
}

/**
 * Generate discount code WhatsApp message
 */
export function generateDiscountMessage(
  code: string,
  expiresAt: Date
): string {
  const formattedDate = expiresAt.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `✨ *Portal Resonancial* ✨

¡Gracias por unirte a nuestra comunidad!

🎁 Tu código de descuento:
*${code}*
_10% en tu primera sesión_

⏰ Válido hasta: ${formattedDate}

Nuestros servicios:
• Detox Frecuencial (45 min) - €55 → €49.50
• Reconfiguración Frecuencial (60 min) - €70 → €63
• Mapa Resonancial (90 min) - €95 → €85.50

Reserva ahora:
https://terapiaresonancial.com

💫 Namaste`;
}

/**
 * Send WhatsApp message via WaSender API
 */
export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<SendMessageResult> {
  const wasenderConfig = getWaSenderConfig();

  // If WaSender is not configured, log to console in development
  if (!wasenderConfig) {
    if (config.isDevelopment) {
      console.log("\n📱 [WhatsApp Mock] Message would be sent to:", to);
      console.log("Message:", message);
      console.log("---\n");
      return {
        success: true,
        messageId: `mock-${Date.now()}`,
      };
    }

    return {
      success: false,
      error: "WhatsApp service not configured (missing WASENDER_API_KEY)",
    };
  }

  try {
    // WaSender API expects 'to' in E.164 format with + prefix
    const phoneWithPrefix = to.startsWith("+") ? to : `+${to}`;

    const response = await fetch("https://www.wasenderapi.com/api/send-message", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${wasenderConfig.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: phoneWithPrefix,
        text: message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || data.error || `HTTP ${response.status}`;
      console.error("[WhatsApp] WaSender API error:", errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }

    console.log(`[WhatsApp] Message sent successfully via WaSender:`, data);

    return {
      success: true,
      messageId: data.messageId || data.id || `wasender-${Date.now()}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[WhatsApp] Failed to send message:", errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send discount code via WhatsApp
 */
export async function sendDiscountCodeViaWhatsApp(
  phone: string,
  countryCode: string,
  discountCode: string,
  expiresAt: Date
): Promise<SendMessageResult> {
  const formattedPhone = formatPhoneForWhatsApp(phone, countryCode);

  if (!validatePhoneNumber(formattedPhone)) {
    return {
      success: false,
      error: "Invalid phone number format",
    };
  }

  const message = generateDiscountMessage(discountCode, expiresAt);
  return sendWhatsAppMessage(formattedPhone, message);
}
