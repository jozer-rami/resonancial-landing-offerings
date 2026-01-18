import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Loader2, CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { api, ApiError } from "@/lib/api";
import { trackNewsletterStart, trackNewsletterSubmit, trackNewsletterError, trackWhatsAppClick } from "@/lib/analytics";

type ContactPreference = "whatsapp" | "email";

interface SubscriptionResult {
  message?: string;
  discountCode?: {
    code: string;
    value: string;
    expiresAt: string;
    deliveryChannel?: string;
    deliveryStatus?: string;
    redeemed?: boolean;
  };
}

// Country codes for Spain and Latin America
const countryCodes = [
  { code: "591", country: "Bolivia", flag: "🇧🇴" },
  { code: "34", country: "España", flag: "🇪🇸" },
  { code: "52", country: "México", flag: "🇲🇽" },
  { code: "54", country: "Argentina", flag: "🇦🇷" },
  { code: "57", country: "Colombia", flag: "🇨🇴" },
  { code: "56", country: "Chile", flag: "🇨🇱" },
  { code: "51", country: "Perú", flag: "🇵🇪" },
  { code: "593", country: "Ecuador", flag: "🇪🇨" },
  { code: "1", country: "USA", flag: "🇺🇸" },
];

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("591");
  const [contactPreference, setContactPreference] = useState<ContactPreference>("whatsapp");
  const [consentWhatsapp, setConsentWhatsapp] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<SubscriptionResult | null>(null);
  const [hasTrackedStart, setHasTrackedStart] = useState(false);

  const handleEmailFocus = () => {
    if (!hasTrackedStart) {
      trackNewsletterStart(contactPreference, 'newsletter_section');
      setHasTrackedStart(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Validate email
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage("Por favor ingresa un correo electrónico válido.");
      setStatus("error");
      trackNewsletterError(contactPreference, 'invalid_email');
      return;
    }

    // Validate WhatsApp fields
    if (contactPreference === "whatsapp") {
      if (!phone || phone.length < 6) {
        setErrorMessage("Por favor ingresa un número de teléfono válido.");
        setStatus("error");
        trackNewsletterError(contactPreference, 'invalid_phone');
        return;
      }
      if (!consentWhatsapp) {
        setErrorMessage("Debes aceptar recibir mensajes por WhatsApp.");
        setStatus("error");
        trackNewsletterError(contactPreference, 'no_consent');
        return;
      }
    }

    setStatus("loading");

    try {
      const response = await api.newsletter.subscribe({
        email,
        contactPreference,
        phone: contactPreference === "whatsapp" ? phone : undefined,
        phoneCountryCode: contactPreference === "whatsapp" ? countryCode : undefined,
        consentWhatsapp: contactPreference === "whatsapp" ? consentWhatsapp : false,
        consentEmail: true,
      });

      setResult(response);
      setStatus("success");
      trackNewsletterSubmit(contactPreference, 'newsletter_section');
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      if (error instanceof ApiError) {
        const errorData = error.data as Record<string, unknown> | undefined;
        const errorMsg = errorData?.error ? String(errorData.error) : "Error al suscribirse. Por favor intenta de nuevo.";
        setErrorMessage(errorMsg);
        trackNewsletterError(contactPreference, 'api_error');
      } else {
        setErrorMessage("Error al suscribirse. Por favor intenta de nuevo.");
        trackNewsletterError(contactPreference, 'network_error');
      }
      setStatus("error");
    }
  };

  const formatExpirationDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <section className="py-10 md:py-12 bg-background relative border-t border-white/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="relative bg-zinc-900/40 backdrop-blur-sm border border-white/10 rounded-[2rem] p-8 md:p-12 overflow-hidden text-center">
            {/* Soft decorative gradient */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1/2 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
                <Mail className="w-6 h-6" />
              </div>

              {status === "success" && result ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 py-4"
                >
                  {/* Case 1: Existing subscriber with redeemed code OR no code */}
                  {result.message === "Already subscribed" && (!result.discountCode || result.discountCode.redeemed) ? (
                    <>
                      <div className="flex items-center justify-center gap-2 text-primary text-xl font-heading">
                        <CheckCircle2 className="w-6 h-6" />
                        <h3>Ya eres parte de nuestra comunidad</h3>
                      </div>
                      <p className="text-muted-foreground font-light max-w-md mx-auto">
                        {result.discountCode?.redeemed
                          ? "Tu código de descuento ya fue utilizado. ¡Gracias por confiar en nosotros!"
                          : "Este email ya está registrado en nuestra comunidad."}
                      </p>
                      <p className="text-white/60 text-sm">
                        ¿Deseas información sobre nuevas promociones?
                      </p>
                      <Button
                        className="bg-primary text-black hover:bg-primary/90 h-12 px-8 rounded-xl font-medium tracking-wide"
                        onClick={() => {
                          trackWhatsAppClick('new_promotions', 'newsletter_existing_redeemed');
                          window.open("https://wa.me/59169703379?text=Hola,%20me%20gustaría%20conocer%20las%20nuevas%20promociones", "_blank");
                        }}
                      >
                        Contactar por WhatsApp
                      </Button>
                    </>
                  ) : result.message === "Already subscribed" && result.discountCode ? (
                    /* Case 2: Existing subscriber with valid code */
                    <>
                      <div className="flex items-center justify-center gap-2 text-blue-400 text-xl font-heading">
                        <Mail className="w-6 h-6" />
                        <h3>Ya tienes un código de descuento</h3>
                      </div>
                      <p className="text-muted-foreground font-light max-w-md mx-auto">
                        Este email ya está registrado en nuestra comunidad. Aquí está tu código existente:
                      </p>
                      <div className="bg-black/30 border border-primary/30 rounded-xl p-6 max-w-sm mx-auto">
                        <p className="text-white/60 text-sm mb-2">Tu código de descuento:</p>
                        <p className="text-2xl font-mono font-bold text-primary tracking-wider">
                          {result.discountCode.code}
                        </p>
                        <p className="text-white/60 text-sm mt-3">
                          {result.discountCode.value} de descuento
                        </p>
                        <p className="text-white/40 text-xs mt-1">
                          Válido hasta: {formatExpirationDate(result.discountCode.expiresAt)}
                        </p>
                      </div>
                      <Button
                        className="bg-primary text-black hover:bg-primary/90 h-12 px-8 rounded-xl font-medium tracking-wide"
                        onClick={() => {
                          trackWhatsAppClick('discount_reservation', 'newsletter_existing_valid');
                          window.open("https://wa.me/59169703379?text=Hola,%20quiero%20reservar%20una%20sesión%20con%20mi%20código%20de%20descuento", "_blank");
                        }}
                      >
                        Reservar ahora con descuento
                      </Button>
                    </>
                  ) : result.discountCode ? (
                    /* Case 3: New subscriber with discount code */
                    <>
                      <div className="flex items-center justify-center gap-2 text-primary text-xl font-heading">
                        <CheckCircle2 className="w-6 h-6" />
                        <h3>¡Gracias por unirte!</h3>
                      </div>

                      <p className="text-muted-foreground font-light max-w-md mx-auto">
                        Tu código de descuento ha sido enviado a:
                      </p>

                      <div className="flex items-center justify-center gap-2 text-white">
                        {result.discountCode.deliveryChannel === "whatsapp" ? (
                          <>
                            <MessageCircle className="w-5 h-5 text-green-400" />
                            <span>+{countryCode} {phone}</span>
                          </>
                        ) : (
                          <>
                            <Mail className="w-5 h-5 text-primary" />
                            <span>{email}</span>
                          </>
                        )}
                      </div>

                      <div className="bg-black/30 border border-primary/30 rounded-xl p-6 max-w-sm mx-auto">
                        <p className="text-white/60 text-sm mb-2">Tu código de descuento:</p>
                        <p className="text-2xl font-mono font-bold text-primary tracking-wider">
                          {result.discountCode.code}
                        </p>
                        <p className="text-white/60 text-sm mt-3">
                          {result.discountCode.value} de descuento
                        </p>
                        <p className="text-white/40 text-xs mt-1">
                          Válido hasta: {formatExpirationDate(result.discountCode.expiresAt)}
                        </p>
                      </div>

                      <Button
                        className="bg-primary text-black hover:bg-primary/90 h-12 px-8 rounded-xl font-medium tracking-wide"
                        onClick={() => {
                          trackWhatsAppClick('discount_reservation', 'newsletter_success');
                          window.open("https://wa.me/59169703379?text=Hola,%20quiero%20reservar%20una%20sesión%20con%20mi%20código%20de%20descuento", "_blank");
                        }}
                      >
                        Reservar ahora con descuento
                      </Button>
                    </>
                  ) : (
                    /* Case 4: Fallback - subscription successful but no code (edge case) */
                    <>
                      <div className="flex items-center justify-center gap-2 text-primary text-xl font-heading">
                        <CheckCircle2 className="w-6 h-6" />
                        <h3>¡Gracias por unirte!</h3>
                      </div>
                      <p className="text-muted-foreground font-light max-w-md mx-auto">
                        Te has suscrito exitosamente a nuestra comunidad.
                      </p>
                      <Button
                        className="bg-primary text-black hover:bg-primary/90 h-12 px-8 rounded-xl font-medium tracking-wide"
                        onClick={() => {
                          trackWhatsAppClick('contact', 'newsletter_success_no_code');
                          window.open("https://wa.me/59169703379?text=Hola,%20me%20gustaría%20más%20información", "_blank");
                        }}
                      >
                        Contactar por WhatsApp
                      </Button>
                    </>
                  )}
                </motion.div>
              ) : (
                <>
                  <h2 className="text-3xl md:text-4xl font-heading text-white mb-4">Obtén 10% de descuento</h2>
                  <p className="text-muted-foreground font-light max-w-lg mx-auto mb-8 text-lg">
                    Únete a nuestra comunidad resonancial y recibe tu código de descuento.
                  </p>

                  <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-6">
                    {/* Email Input */}
                    <div>
                      <label htmlFor="newsletter-email" className="sr-only">Correo electrónico</label>
                      <Input
                        id="newsletter-email"
                        type="email"
                        placeholder="tu@email.com…"
                        autoComplete="email"
                        spellCheck={false}
                        value={email}
                        onFocus={handleEmailFocus}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (status === "error") setStatus("idle");
                        }}
                        className={cn(
                          "bg-black/20 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl focus-visible:ring-primary/50",
                          status === "error" && errorMessage.includes("correo") && "border-red-500/50"
                        )}
                      />
                    </div>

                    {/* Contact Preference Selection */}
                    <div className="space-y-3">
                      <p className="text-white/60 text-sm text-left">¿Cómo prefieres recibir tu código de descuento?</p>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setContactPreference("whatsapp")}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all",
                            contactPreference === "whatsapp"
                              ? "bg-green-500/20 border-green-500/50 text-green-400"
                              : "bg-black/20 border-white/10 text-white/60 hover:border-white/30"
                          )}
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span>WhatsApp</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setContactPreference("email")}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all",
                            contactPreference === "email"
                              ? "bg-primary/20 border-primary/50 text-primary"
                              : "bg-black/20 border-white/10 text-white/60 hover:border-white/30"
                          )}
                        >
                          <Mail className="w-5 h-5" />
                          <span>Email</span>
                        </button>
                      </div>
                    </div>

                    {/* WhatsApp Phone Input */}
                    {contactPreference === "whatsapp" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        <div className="flex gap-2">
                          <label htmlFor="country-code" className="sr-only">Código de país</label>
                          <select
                            id="country-code"
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="bg-black/20 border border-white/10 text-white h-12 rounded-xl px-3 focus:ring-primary/50 focus:border-primary/50"
                          >
                            {countryCodes.map((cc) => (
                              <option key={cc.code} value={cc.code} className="bg-zinc-900">
                                {cc.flag} +{cc.code}
                              </option>
                            ))}
                          </select>
                          <label htmlFor="phone-number" className="sr-only">Número de teléfono</label>
                          <Input
                            id="phone-number"
                            type="tel"
                            placeholder="69703379…"
                            autoComplete="tel"
                            inputMode="numeric"
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              if (status === "error") setStatus("idle");
                            }}
                            className={cn(
                              "flex-1 bg-black/20 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl focus-visible:ring-primary/50",
                              status === "error" && errorMessage.includes("teléfono") && "border-red-500/50"
                            )}
                          />
                        </div>

                        {/* WhatsApp Consent */}
                        <div className="flex items-start gap-3 text-left">
                          <Checkbox
                            id="consent-whatsapp"
                            checked={consentWhatsapp}
                            onCheckedChange={(checked) => setConsentWhatsapp(checked as boolean)}
                            className="mt-1 border-white/30 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                          />
                          <label htmlFor="consent-whatsapp" className="text-sm text-white/60 cursor-pointer">
                            Acepto recibir mi código de descuento y comunicaciones por WhatsApp
                          </label>
                        </div>
                      </motion.div>
                    )}

                    {/* Error Message */}
                    {status === "error" && errorMessage && (
                      <p className="text-red-400 text-sm text-left">{errorMessage}</p>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full bg-primary text-black hover:bg-primary/90 h-12 px-8 rounded-xl font-medium tracking-wide"
                    >
                      {status === "loading" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Obtener mi descuento"
                      )}
                    </Button>

                    <p className="text-xs text-white/20 pt-2">
                      Sin spam. Puedes darte de baja en cualquier momento.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
