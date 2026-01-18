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
 *
 * Marketing optimizations (Jan 2026):
 * - Pack Completo upsell with price anchoring (1,700 Bs value -> 1,080 Bs with code)
 * - Almanaque Ritual as low-commitment entry product (200 Bs)
 * - Three-tier structure for different buyer personas
 * - Brand quote for emotional connection
 * - Show discounted prices with visible savings to emphasize 10% discount value
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
    featureBg: "rgba(169,105,53,0.05)",
    featureBorder: "rgba(169,105,53,0.15)",
    savingsBg: "rgba(169,105,53,0.1)",
    savingsBorder: "rgba(169,105,53,0.2)",
  };

  // WhatsApp links with discount code
  const whatsappPackCompleto = `https://wa.me/59169703379?text=Hola,%20quiero%20reservar%20el%20Pack%20Completo%20con%20mi%20código%20${code}`;
  const whatsappSesion = `https://wa.me/59169703379?text=Hola,%20quiero%20reservar%20una%20sesión%20con%20mi%20código%20${code}`;
  const whatsappAlmanaque = `https://wa.me/59169703379?text=Hola,%20quiero%20mi%20Almanaque%20Ritual%20Resonancial%202026`;

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
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">

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
                Gracias por dar el primer paso hacia tu transformación frecuencial. Tu código exclusivo está listo para activar tu nuevo ciclo.
              </p>

              <!-- Discount Code Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 32px 0;">
                <tr>
                  <td align="center">
                    <table role="presentation" style="background-color: rgba(169,105,53,0.08); border: 1px solid rgba(169,105,53,0.3); border-radius: 16px; padding: 28px 32px; text-align: center; width: 100%;">
                      <tr>
                        <td align="center">
                          <p style="margin: 0 0 8px 0; font-size: 11px; color: ${colors.textMuted}; text-transform: uppercase; letter-spacing: 0.15em;">
                            Tu código exclusivo
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <p style="margin: 0 0 8px 0; font-size: 32px; font-family: 'Courier New', Courier, monospace; font-weight: bold; color: ${colors.primary}; letter-spacing: 0.1em;">
                            ${code}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <p style="margin: 0; font-size: 18px; color: ${colors.text}; font-weight: 600;">
                            10% DE DESCUENTO EXTRA
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <p style="margin: 8px 0 0 0; font-size: 12px; color: ${colors.textSubtle};">
                            Válido hasta el ${formattedDate}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 32px 0;">
                <tr>
                  <td style="height: 1px; background-color: ${colors.cardBorder};"></td>
                </tr>
              </table>

              <!-- PACK COMPLETO - Featured Upsell -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 32px 0;">
                <tr>
                  <td style="background-color: ${colors.featureBg}; border: 1px solid ${colors.featureBorder}; border-radius: 20px; padding: 32px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <!-- Star badge -->
                      <tr>
                        <td align="center" style="padding: 0 0 16px 0;">
                          <span style="display: inline-block; background-color: ${colors.primary}; color: #000000; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 6px 16px; border-radius: 20px;">
                            ⭐ Oferta Estrella · 10% EXTRA
                          </span>
                        </td>
                      </tr>
                      <!-- Title -->
                      <tr>
                        <td align="center">
                          <h3 style="margin: 0 0 8px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 400; text-align: center; color: ${colors.text};">
                            Pack Completo
                          </h3>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding: 0 0 24px 0;">
                          <p style="margin: 0; font-size: 14px; text-align: center; color: ${colors.primary}; font-style: italic;">
                            La experiencia completa de transformación
                          </p>
                        </td>
                      </tr>
                      <!-- What's included -->
                      <tr>
                        <td>
                          <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 24px 0;">
                            <tr>
                              <td style="padding: 8px 0; color: ${colors.text}; font-size: 13px;">
                                ✓ Detox Frecuencial (45 min)
                              </td>
                              <td style="padding: 8px 0; color: ${colors.textMuted}; font-size: 13px; text-align: right;">
                                500 Bs
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: ${colors.text}; font-size: 13px;">
                                ✓ Reconfiguración Frecuencial (60 min)
                              </td>
                              <td style="padding: 8px 0; color: ${colors.textMuted}; font-size: 13px; text-align: right;">
                                500 Bs
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: ${colors.text}; font-size: 13px;">
                                ✓ Mapa Resonancial (90 min)
                              </td>
                              <td style="padding: 8px 0; color: ${colors.textMuted}; font-size: 13px; text-align: right;">
                                500 Bs
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: ${colors.primary}; font-size: 13px; font-weight: 600;">
                                🎁 BONUS: Almanaque Ritual 2026
                              </td>
                              <td style="padding: 8px 0; color: ${colors.primary}; font-size: 13px; text-align: right;">
                                200 Bs
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- Pricing -->
                      <tr>
                        <td style="border-top: 1px solid ${colors.cardBorder}; padding-top: 20px;">
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td align="center">
                                <p style="margin: 0 0 4px 0; font-size: 13px; color: ${colors.textMuted};">
                                  Valor total: <span style="text-decoration: line-through;">1.700 Bs</span>
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td align="center">
                                <p style="margin: 0 0 4px 0; font-size: 14px; color: ${colors.textMuted};">
                                  Precio regular: <span style="text-decoration: line-through;">1.200 Bs</span>
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td align="center">
                                <p style="margin: 0 0 8px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 32px; color: ${colors.primary}; font-weight: 400;">
                                  1.080 Bs
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td align="center">
                                <p style="margin: 0 0 16px 0; font-size: 14px; color: ${colors.text}; font-weight: 600; background-color: rgba(169,105,53,0.2); padding: 6px 12px; border-radius: 4px; display: inline-block;">
                                  CON TU 10% EXTRA
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="padding: 0 0 20px 0;">
                                <span style="display: inline-block; background-color: ${colors.savingsBg}; border: 1px solid ${colors.savingsBorder}; color: ${colors.primary}; font-size: 12px; font-weight: 600; padding: 8px 16px; border-radius: 20px;">
                                  💫 Ahorras 620 Bs en total + Almanaque GRATIS
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td align="center">
                                <a href="${whatsappPackCompleto}"
                                   style="display: inline-block; background-color: ${colors.primary}; color: #000000; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">
                                  Obtener Pack Completo
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider with "O" -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 32px 0;">
                <tr>
                  <td style="width: 45%; height: 1px; background-color: ${colors.cardBorder};"></td>
                  <td style="width: 10%; text-align: center; color: ${colors.textMuted}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">o</td>
                  <td style="width: 45%; height: 1px; background-color: ${colors.cardBorder};"></td>
                </tr>
              </table>

              <!-- Alternative Options Header -->
              <p style="margin: 0 0 20px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: ${colors.textMuted}; text-align: center;">
                Elige tu camino
              </p>

              <!-- Two Column Layout: Sessions | Almanaque -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 32px 0;">
                <tr>
                  <!-- Individual Sessions Column -->
                  <td style="width: 48%; vertical-align: top; padding-right: 12px;">
                    <table role="presentation" style="width: 100%; background-color: rgba(255,255,255,0.02); border: 1px solid ${colors.cardBorder}; border-radius: 16px; padding: 24px;">
                      <tr>
                        <td align="center" style="padding-bottom: 8px;">
                          <span style="display: inline-block; background-color: rgba(169,105,53,0.2); color: ${colors.primary}; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 10px;">
                            10% CON TU CÓDIGO
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <h4 style="margin: 0 0 16px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 16px; font-weight: 400; color: ${colors.text};">
                            Sesiones Individuales
                          </h4>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 16px 0;">
                            <tr>
                              <td style="padding: 6px 0; font-size: 12px; color: ${colors.textMuted};">Detox Frecuencial</td>
                              <td style="padding: 6px 0; font-size: 12px; text-align: right;"><span style="text-decoration: line-through; color: ${colors.textSubtle};">500</span> <strong style="color: ${colors.primary};">450 Bs</strong></td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; font-size: 12px; color: ${colors.textMuted};">Reconfiguración</td>
                              <td style="padding: 6px 0; font-size: 12px; text-align: right;"><span style="text-decoration: line-through; color: ${colors.textSubtle};">500</span> <strong style="color: ${colors.primary};">450 Bs</strong></td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; font-size: 12px; color: ${colors.textMuted};">Mapa Resonancial</td>
                              <td style="padding: 6px 0; font-size: 12px; text-align: right;"><span style="text-decoration: line-through; color: ${colors.textSubtle};">500</span> <strong style="color: ${colors.primary};">450 Bs</strong></td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-bottom: 16px;">
                          <p style="margin: 0; font-size: 11px; color: ${colors.primary};">
                            💫 Ahorras 50 Bs por sesión
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <a href="${whatsappSesion}"
                             style="display: inline-block; border: 1px solid rgba(169,105,53,0.3); color: ${colors.primary}; text-decoration: none; padding: 10px 20px; border-radius: 50px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                            Reservar Sesión
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Almanaque Column -->
                  <td style="width: 48%; vertical-align: top; padding-left: 12px;">
                    <table role="presentation" style="width: 100%; background-color: rgba(255,255,255,0.02); border: 1px solid ${colors.cardBorder}; border-radius: 16px; padding: 24px;">
                      <tr>
                        <td align="center">
                          <h4 style="margin: 0 0 16px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 16px; font-weight: 400; color: ${colors.text};">
                            Almanaque Ritual 2026
                          </h4>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0 0 12px 0; font-size: 12px; color: ${colors.textMuted}; line-height: 1.5;">
                            ✨ 10 Estaciones Energéticas<br>
                            ✨ Rituales para cada fase lunar<br>
                            ✨ Ritual de cumpleaños personalizado<br>
                            ✨ Portales energéticos 2026
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-bottom: 16px;">
                          <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 20px; color: ${colors.text};">200 Bs</span>
                          <span style="font-size: 12px; color: ${colors.textMuted};"> (20 USD)</span>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-bottom: 16px;">
                          <p style="margin: 0; font-size: 10px; color: ${colors.textSubtle};">
                            Edición 2026 limitada
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <a href="${whatsappAlmanaque}"
                             style="display: inline-block; border: 1px solid rgba(169,105,53,0.3); color: ${colors.primary}; text-decoration: none; padding: 10px 20px; border-radius: 50px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                            Obtener Almanaque
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Brand Quote -->
              <table role="presentation" style="width: 100%; background-color: rgba(255,255,255,0.02); border-radius: 16px; padding: 24px; margin: 0 0 8px 0;">
                <tr>
                  <td align="center">
                    <p style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 16px; font-style: italic; color: ${colors.textMuted}; line-height: 1.6;">
                      "No se manifiesta desde el deseo mental.<br>
                      <span style="color: ${colors.primary};">Se manifiesta desde la frecuencia que habitas."</span>
                    </p>
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

Bienvenido/a a nuestra comunidad

Gracias por dar el primer paso hacia tu transformación frecuencial.
Tu código exclusivo está listo para activar tu nuevo ciclo.

TU CÓDIGO EXCLUSIVO
${code}
10% de descuento extra
Válido hasta el ${formattedDate}

⭐ PACK COMPLETO

La experiencia completa de transformación:

✓ Detox Frecuencial (45 min) .......... 500 Bs
✓ Reconfiguración Frecuencial (60 min)  500 Bs
✓ Mapa Resonancial (90 min) ........... 500 Bs
🎁 BONUS: Almanaque Ritual 2026 ....... 200 Bs

Valor total: 1.700 Bs
Precio regular: 1.200 Bs
CON TU CÓDIGO: 1.080 Bs (108 USD)

💫 Ahorras 620 Bs en total + Almanaque GRATIS

Reservar Pack Completo:
https://wa.me/59169703379?text=Hola,%20quiero%20reservar%20el%20Pack%20Completo%20con%20mi%20código%20${code}

SESIONES INDIVIDUALES

• Detox Frecuencial ........... 500 Bs → 450 Bs con tu código
• Reconfiguración Frecuencial . 500 Bs → 450 Bs con tu código
• Mapa Resonancial ............ 500 Bs → 450 Bs con tu código

💫 Ahorras 50 Bs por sesión

Reservar Sesión:
https://wa.me/59169703379?text=Hola,%20quiero%20reservar%20una%20sesión%20con%20mi%20código%20${code}

ALMANAQUE RITUAL 2026

✨ 10 Estaciones Energéticas
✨ Rituales para cada fase lunar
✨ Ritual de cumpleaños personalizado
✨ Portales energéticos 2026

200 Bs (20 USD) · Edición 2026 limitada

Obtener Almanaque:
https://wa.me/59169703379?text=Hola,%20quiero%20mi%20Almanaque%20Ritual%20Resonancial%202026

"No se manifiesta desde el deseo mental.
Se manifiesta desde la frecuencia que habitas."

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

  const subject = "Tu portal al 2026 está listo (+ 10% descuento) ✨";
  const html = generateDiscountEmailHtml(discountCode, expiresAt);
  const text = generateDiscountEmailText(discountCode, expiresAt);

  return sendEmail(email, subject, html, text);
}
