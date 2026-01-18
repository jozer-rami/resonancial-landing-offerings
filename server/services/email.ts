/**
 * Email Service
 *
 * Sends emails via Resend API.
 * Fallback to console logging in development if Resend is not configured.
 */

import { Resend } from "resend";
import { config } from "../config";
import { loggers } from "../lib/logger";

const logger = loggers.email;

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
    ? "Portal Resonancial <noreply@terapiaresonancial.com>"
    : "Portal Resonancial <onboarding@resend.dev>";
  const fromEmail = process.env.RESEND_FROM_EMAIL || defaultFromEmail;

  if (!apiKey) {
    return null;
  }

  return { apiKey, fromEmail };
}

/**
 * Generate discount code email HTML template
 *
 * Design System (matches landing page branding):
 * - Primary color: #a96935 (copper/warm brown)
 * - Background: #0d0d0d (deep black)
 * - Card background: #141414 (charcoal)
 * - Text: #ebe7e0 (warm off-white)
 * - Muted text: rgba(255,255,255,0.6)
 * - Typography: Serif headings (Georgia fallback), sans-serif body
 * - Border radius: 16px for cards, 24px for buttons
 * - Borders: rgba(255,255,255,0.1)
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

  // Brand colors from landing page design system
  const colors = {
    primary: "#a96935",
    primaryLight: "#c4854d",
    background: "#0d0d0d",
    card: "#141414",
    cardBorder: "rgba(255,255,255,0.1)",
    text: "#ebe7e0",
    textMuted: "rgba(255,255,255,0.6)",
    textSubtle: "rgba(255,255,255,0.4)",
  };

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu código de descuento - Portal Resonancial</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: 'Montserrat', 'Segoe UI', Arial, sans-serif; background-color: ${colors.background}; color: ${colors.text}; -webkit-font-smoothing: antialiased;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: ${colors.background};">
    <tr>
      <td align="center" style="padding: 48px 20px;">
        <table role="presentation" style="width: 100%; max-width: 560px; border-collapse: collapse;">

          <!-- Logo/Header -->
          <tr>
            <td align="center" style="padding: 0 0 40px 0;">
              <table role="presentation" style="border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <!-- Circular logo container -->
                    <div style="width: 64px; height: 64px; background-color: rgba(169,105,53,0.15); border-radius: 50%; margin: 0 auto 20px auto; line-height: 64px; text-align: center;">
                      <span style="font-size: 28px; line-height: 64px;">&#10024;</span>
                    </div>
                    <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 400; color: ${colors.text}; letter-spacing: 0.05em;">
                      Portal Resonancial
                    </h1>
                    <p style="margin: 8px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; color: ${colors.textMuted};">
                      Terapia Frecuencial
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background-color: ${colors.card}; border: 1px solid ${colors.cardBorder}; border-radius: 24px; padding: 48px 40px;">

              <!-- Welcome Message -->
              <h2 style="margin: 0 0 12px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: 400; text-align: center; color: ${colors.text}; line-height: 1.3;">
                Bienvenido/a a nuestra comunidad
              </h2>

              <p style="margin: 0 0 32px 0; font-size: 15px; line-height: 1.7; text-align: center; color: ${colors.textMuted}; font-weight: 300;">
                Gracias por unirte. Aquí está tu código de descuento exclusivo para tu primera sesión de sanación frecuencial.
              </p>

              <!-- Discount Code Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 32px 0;">
                <tr>
                  <td align="center">
                    <div style="background-color: rgba(169,105,53,0.08); border: 1px solid rgba(169,105,53,0.3); border-radius: 16px; padding: 28px 32px; text-align: center;">
                      <p style="margin: 0 0 8px 0; font-size: 11px; color: ${colors.textMuted}; text-transform: uppercase; letter-spacing: 0.15em;">
                        Tu código de descuento
                      </p>
                      <p style="margin: 0 0 8px 0; font-size: 32px; font-family: 'Courier New', Courier, monospace; font-weight: bold; color: ${colors.primary}; letter-spacing: 0.1em;">
                        ${code}
                      </p>
                      <p style="margin: 0; font-size: 16px; color: ${colors.text}; font-weight: 500;">
                        10% de descuento
                      </p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Expiration -->
              <p style="margin: 0 0 32px 0; font-size: 13px; text-align: center; color: ${colors.textSubtle};">
                Válido hasta el ${formattedDate}
              </p>

              <!-- Divider -->
              <div style="height: 1px; background-color: ${colors.cardBorder}; margin: 0 0 28px 0;"></div>

              <!-- Services Section -->
              <p style="margin: 0 0 16px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: ${colors.textMuted}; text-align: center;">
                Aplica en cualquiera de nuestros servicios
              </p>

              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 32px 0;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="color: ${colors.text}; font-size: 14px; font-weight: 400;">Detox Frecuencial</td>
                        <td style="color: ${colors.textMuted}; font-size: 13px; text-align: right;">45 min</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="color: ${colors.text}; font-size: 14px; font-weight: 400;">Reconfiguración Frecuencial</td>
                        <td style="color: ${colors.textMuted}; font-size: 13px; text-align: right;">60 min</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="color: ${colors.text}; font-size: 14px; font-weight: 400;">Mapa Resonancial</td>
                        <td style="color: ${colors.textMuted}; font-size: 13px; text-align: right;">90 min</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="https://wa.me/59169703379?text=Hola,%20quiero%20reservar%20una%20sesión%20con%20mi%20código%20de%20descuento"
                       style="display: inline-block; background-color: ${colors.primary}; color: #000000; text-decoration: none; padding: 16px 48px; border-radius: 50px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">
                      Reservar mi sesión
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 40px 20px 0 20px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 14px; font-style: italic; color: ${colors.primary};">
                Namaste
              </p>
              <p style="margin: 0 0 24px 0; font-size: 13px; color: ${colors.textMuted}; font-weight: 300;">
                El equipo de Portal Resonancial
              </p>

              <!-- Social/Contact -->
              <p style="margin: 0 0 16px 0; font-size: 12px; color: ${colors.textSubtle};">
                <a href="https://terapiaresonancial.com" style="color: ${colors.textMuted}; text-decoration: none;">terapiaresonancial.com</a>
              </p>

              <!-- Legal -->
              <p style="margin: 0; font-size: 11px; color: ${colors.textSubtle}; line-height: 1.6;">
                Si no solicitaste este código, puedes ignorar este mensaje.<br>
                Este correo fue enviado porque te suscribiste a nuestra comunidad.
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
 * Matches the tone and structure of the HTML template
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
PORTAL RESONANCIAL
Terapia Frecuencial

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bienvenido/a a nuestra comunidad

Gracias por unirte. Aquí está tu código de descuento exclusivo para tu primera sesión de sanación frecuencial.

┌─────────────────────────────────┐
│                                 │
│   TU CÓDIGO DE DESCUENTO        │
│   ${code}             │
│   10% de descuento              │
│                                 │
└─────────────────────────────────┘

Válido hasta el ${formattedDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

APLICA EN CUALQUIERA DE NUESTROS SERVICIOS:

• Detox Frecuencial ............. 45 min
• Reconfiguración Frecuencial ... 60 min
• Mapa Resonancial .............. 90 min

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

¿Listo/a para reservar?
Escríbenos por WhatsApp: https://wa.me/59169703379

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Namaste,
El equipo de Portal Resonancial

terapiaresonancial.com

---
Si no solicitaste este código, puedes ignorar este mensaje.
Este correo fue enviado porque te suscribiste a nuestra comunidad.
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
      logger.debug("Mock email (Resend not configured)", {
        to,
        subject,
        mode: "development",
      });
      return {
        success: true,
        messageId: `mock-email-${Date.now()}`,
      };
    }

    logger.error("Resend not configured", {
      to,
      subject,
      error: "Missing RESEND_API_KEY environment variable",
    });
    return {
      success: false,
      error: "Email service not configured (missing RESEND_API_KEY)",
    };
  }

  const startTime = Date.now();

  logger.debug("Sending email via Resend API", {
    to,
    subject,
    from: resendConfig.fromEmail,
    htmlLength: html.length,
    hasText: !!text,
  });

  try {
    const resend = new Resend(resendConfig.apiKey);

    const response = await resend.emails.send({
      from: resendConfig.fromEmail,
      to: [to],
      subject,
      html,
      text: text || undefined,
    });

    const duration = Date.now() - startTime;

    if (response.error) {
      logger.error("Resend API error response", {
        to,
        subject,
        error: response.error.message,
        errorName: response.error.name,
        duration: `${duration}ms`,
      });
      return {
        success: false,
        error: response.error.message,
      };
    }

    const messageId = response.data?.id || `resend-${Date.now()}`;
    logger.info("Email sent successfully", {
      to,
      subject,
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
      "Failed to send email - network or API error",
      {
        to,
        subject,
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
 * Send discount code via Email
 */
export async function sendDiscountCodeViaEmail(
  email: string,
  discountCode: string,
  expiresAt: Date
): Promise<SendEmailResult> {
  logger.debug("Preparing discount code email", {
    email,
    discountCode,
    expiresAt: expiresAt.toISOString(),
  });

  const subject = "Tu código de descuento del 10% - Portal Resonancial ✨";
  const html = generateDiscountEmailHtml(discountCode, expiresAt);
  const text = generateDiscountEmailText(discountCode, expiresAt);

  return sendEmail(email, subject, html, text);
}
