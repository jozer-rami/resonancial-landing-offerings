/**
 * Email Service
 *
 * Sends emails via Resend API.
 * Fallback to console logging in development if Resend is not configured.
 */

import { Resend } from "resend";
import { config } from "../config";

interface ResendConfig {
  apiKey: string;
  fromEmail: string;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Resend configuration from environment
function getResendConfig(): ResendConfig | null {
  const apiKey = process.env.RESEND_API_KEY;
  // Use Resend's test email in development, or custom domain in production
  // Note: For production, verify your domain at https://resend.com/domains
  const defaultFromEmail = process.env.NODE_ENV === "production"
    ? "Portal Resonancial <noreply@portalresonancial.com>"
    : "Portal Resonancial <onboarding@resend.dev>";
  const fromEmail = process.env.RESEND_FROM_EMAIL || defaultFromEmail;

  if (!apiKey) {
    return null;
  }

  return { apiKey, fromEmail };
}

/**
 * Generate discount code email HTML template
 */
export function generateDiscountEmailHtml(
  code: string,
  expiresAt: Date
): string {
  const formattedDate = expiresAt.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu código de descuento - Portal Resonancial</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding: 30px 0;">
              <h1 style="margin: 0; font-size: 28px; color: #d4af37; letter-spacing: 2px;">
                ✨ Portal Resonancial ✨
              </h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 20px; padding: 40px 30px;">

              <h2 style="margin: 0 0 20px 0; font-size: 24px; text-align: center; color: #ffffff;">
                ¡Gracias por unirte a nuestra comunidad!
              </h2>

              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; text-align: center; color: #b0b0b0;">
                Aquí está tu código de descuento exclusivo para tu primera sesión:
              </p>

              <!-- Discount Code Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 30px 0;">
                <tr>
                  <td align="center">
                    <div style="background: rgba(212, 175, 55, 0.1); border: 2px solid #d4af37; border-radius: 15px; padding: 25px 30px; display: inline-block;">
                      <p style="margin: 0 0 10px 0; font-size: 14px; color: #b0b0b0; text-transform: uppercase; letter-spacing: 1px;">
                        Tu código de descuento
                      </p>
                      <p style="margin: 0 0 10px 0; font-size: 32px; font-family: 'Courier New', monospace; font-weight: bold; color: #d4af37; letter-spacing: 3px;">
                        ${code}
                      </p>
                      <p style="margin: 0; font-size: 18px; color: #ffffff;">
                        10% de descuento
                      </p>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 25px 0; font-size: 14px; text-align: center; color: #888888;">
                ⏰ Válido hasta: ${formattedDate}
              </p>

              <!-- Services -->
              <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; margin: 0 0 30px 0;">
                <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #ffffff;">
                  Nuestros servicios:
                </p>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #b0b0b0; font-size: 14px;">• Detox Frecuencial (45 min)</td>
                    <td style="padding: 8px 0; color: #d4af37; font-size: 14px; text-align: right;">€55 → €49.50</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #b0b0b0; font-size: 14px;">• Reconfiguración Frecuencial (60 min)</td>
                    <td style="padding: 8px 0; color: #d4af37; font-size: 14px; text-align: right;">€70 → €63</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #b0b0b0; font-size: 14px;">• Mapa Resonancial (90 min)</td>
                    <td style="padding: 8px 0; color: #d4af37; font-size: 14px; text-align: right;">€95 → €85.50</td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="https://portalresonancial.com"
                       style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); color: #000000; text-decoration: none; padding: 16px 40px; border-radius: 30px; font-size: 16px; font-weight: 600; letter-spacing: 1px;">
                      Reservar mi sesión ahora
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 0; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #d4af37;">
                💫 Namaste
              </p>
              <p style="margin: 0 0 20px 0; font-size: 12px; color: #666666;">
                El equipo de Portal Resonancial
              </p>
              <p style="margin: 0; font-size: 11px; color: #444444;">
                ¿No solicitaste este código? Puedes ignorar este mensaje.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version of the email
 */
export function generateDiscountEmailText(
  code: string,
  expiresAt: Date
): string {
  const formattedDate = expiresAt.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `
✨ Portal Resonancial ✨

¡Gracias por unirte a nuestra comunidad!

Tu código de descuento exclusivo:
${code}
10% de descuento en tu primera sesión

Válido hasta: ${formattedDate}

Nuestros servicios:
• Detox Frecuencial (45 min) - €55 → €49.50
• Reconfiguración Frecuencial (60 min) - €70 → €63
• Mapa Resonancial (90 min) - €95 → €85.50

Reserva ahora: https://portalresonancial.com

💫 Namaste
El equipo de Portal Resonancial

---
¿No solicitaste este código? Puedes ignorar este mensaje.
  `.trim();
}

/**
 * Send email via Resend API
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<SendEmailResult> {
  const resendConfig = getResendConfig();

  // If Resend is not configured, log to console in development
  if (!resendConfig) {
    if (config.isDevelopment) {
      console.log("\n📧 [Email Mock] Email would be sent to:", to);
      console.log("Subject:", subject);
      console.log("---\n");
      return {
        success: true,
        messageId: `mock-email-${Date.now()}`,
      };
    }

    return {
      success: false,
      error: "Email service not configured (missing RESEND_API_KEY)",
    };
  }

  try {
    const resend = new Resend(resendConfig.apiKey);

    const response = await resend.emails.send({
      from: resendConfig.fromEmail,
      to: [to],
      subject,
      html,
      text: text || undefined,
    });

    if (response.error) {
      console.error("[Email] Resend API error:", response.error);
      return {
        success: false,
        error: response.error.message,
      };
    }

    console.log(`[Email] Email sent successfully via Resend:`, response.data);

    return {
      success: true,
      messageId: response.data?.id || `resend-${Date.now()}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Email] Failed to send email:", errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send discount code via Email
 */
export async function sendDiscountCodeViaEmail(
  email: string,
  discountCode: string,
  expiresAt: Date
): Promise<SendEmailResult> {
  const subject = "Tu código de descuento del 10% - Portal Resonancial ✨";
  const html = generateDiscountEmailHtml(discountCode, expiresAt);
  const text = generateDiscountEmailText(discountCode, expiresAt);

  return sendEmail(email, subject, html, text);
}
