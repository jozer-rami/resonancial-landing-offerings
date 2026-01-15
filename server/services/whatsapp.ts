/**
 * WhatsApp Service
 *
 * Sends messages via Twilio WhatsApp API.
 * Fallback to console logging in development if Twilio is not configured.
 */

import { config } from "../config";

interface WhatsAppConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Twilio configuration from environment
function getTwilioConfig(): WhatsAppConfig | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return null;
  }

  return { accountSid, authToken, fromNumber };
}

/**
 * Format phone number for WhatsApp (E.164 format)
 */
export function formatPhoneForWhatsApp(phone: string, countryCode: string): string {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, "");
  const cleanCountryCode = countryCode.replace(/\D/g, "");

  // Combine country code and phone
  return `+${cleanCountryCode}${cleanPhone}`;
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  // Basic E.164 validation: + followed by 10-15 digits
  const e164Pattern = /^\+[1-9]\d{9,14}$/;
  return e164Pattern.test(phone);
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
https://portalresonancial.com

💫 Namaste`;
}

/**
 * Send WhatsApp message via Twilio
 */
export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<SendMessageResult> {
  const twilioConfig = getTwilioConfig();

  // If Twilio is not configured, log to console in development
  if (!twilioConfig) {
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
      error: "WhatsApp service not configured (missing Twilio credentials)",
    };
  }

  try {
    // Dynamically import Twilio to avoid issues if not installed
    const twilio = await import("twilio");
    const client = twilio.default(twilioConfig.accountSid, twilioConfig.authToken);

    const response = await client.messages.create({
      from: `whatsapp:${twilioConfig.fromNumber}`,
      to: `whatsapp:${to}`,
      body: message,
    });

    console.log(`[WhatsApp] Message sent successfully. SID: ${response.sid}`);

    return {
      success: true,
      messageId: response.sid,
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
