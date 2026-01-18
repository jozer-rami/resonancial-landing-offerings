/**
 * WhatsApp Service
 *
 * Sends messages via WaSender API.
 * Fallback to console logging in development if WaSender is not configured.
 */

import { config } from "../config";
import { loggers } from "../lib/logger";

const logger = loggers.whatsapp;

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
 *
 * Marketing optimizations (Jan 2026):
 * - Pack Completo upsell with price anchoring (1,700 Bs value -> 1,080 Bs with code)
 * - Almanaque Ritual as entry product (200 Bs)
 * - Numbered reply options for easy response (1, 2, 3)
 * - Correct currency (Bs, not EUR)
 * - Conversational tone for WhatsApp medium
 * - Show discounted prices with visible savings to emphasize 10% discount value
 * - Website link for more information
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

  return `✨ *PORTAL RESONANCIAL* ✨
Terapia Frecuencial

¡Bienvenido/a a la comunidad! 🙏

Tu código exclusivo:
*${code}*
_10% de descuento extra_
⏰ Válido hasta: ${formattedDate}

⭐ *PACK COMPLETO*
Las 3 sesiones + Almanaque GRATIS
~1.200 Bs~ → *1.080 Bs* con tu código
💫 Ahorras 620 Bs en total

*SESIÓN INDIVIDUAL*
~500 Bs~ → *450 Bs* con tu código
💫 Ahorras 50 Bs

*ALMANAQUE RITUAL 2026*
200 Bs (tu guía de transformación)

Responde con:
*1* → Pack Completo (máximo ahorro)
*2* → Sesión individual
*3* → Almanaque Ritual

🌐 terapiaresonancial.com`;
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
      logger.debug("Mock message (WaSender not configured)", {
        to,
        messageLength: message.length,
        mode: "development",
      });
      return {
        success: true,
        messageId: `mock-${Date.now()}`,
      };
    }

    logger.error("WaSender not configured", {
      to,
      error: "Missing WASENDER_API_KEY environment variable",
    });
    return {
      success: false,
      error: "WhatsApp service not configured (missing WASENDER_API_KEY)",
    };
  }

  const startTime = Date.now();
  const phoneWithPrefix = to.startsWith("+") ? to : `+${to}`;
  const apiUrl = "https://www.wasenderapi.com/api/send-message";

  logger.debug("Sending message via WaSender API", {
    to,
    messageLength: message.length,
    apiUrl,
  });

  try {
    const response = await fetch(apiUrl, {
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

    const duration = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || data.error || `HTTP ${response.status}`;
      logger.error("WaSender API error response", {
        to,
        statusCode: response.status,
        error: errorMessage,
        duration: `${duration}ms`,
        responseBody: data,
      });
      return {
        success: false,
        error: errorMessage,
      };
    }

    const messageId = data.messageId || data.id || `wasender-${Date.now()}`;
    logger.info("Message sent successfully", {
      to,
      messageId,
      duration: `${duration}ms`,
    });

    return {
      success: true,
      messageId,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    logger.errorWithData(
      "Failed to send message - network or parsing error",
      {
        to,
        duration: `${duration}ms`,
        errorType: error instanceof Error ? error.constructor.name : "Unknown",
      },
      error instanceof Error ? error : new Error(errorMessage)
    );

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

  logger.debug("Preparing discount code message", {
    phone: formattedPhone,
    countryCode,
    discountCode,
    expiresAt: expiresAt.toISOString(),
  });

  if (!validatePhoneNumber(formattedPhone)) {
    logger.warn("Invalid phone number format", {
      phone: formattedPhone,
      countryCode,
    });
    return {
      success: false,
      error: "Invalid phone number format",
    };
  }

  const message = generateDiscountMessage(discountCode, expiresAt);
  return sendWhatsAppMessage(formattedPhone, message);
}
