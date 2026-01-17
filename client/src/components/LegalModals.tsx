import { memo } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";

// Privacy Policy Modal
export const PrivacyModal = memo(({ open, onClose }: { open: boolean; onClose: () => void }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto overscroll-contain bg-zinc-950 border-white/10 p-0" aria-describedby="privacy-modal-description">
        <div className="relative">
          <DialogClose className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors" aria-label="Cerrar modal">
            <X className="w-5 h-5" />
          </DialogClose>

          <div className="p-8 md:p-12">
            <span className="text-xs uppercase tracking-[0.3em] text-primary mb-3 block">Legal</span>
            <h2 className="text-3xl md:text-4xl font-heading text-white mb-2">Política de Privacidad</h2>
            <p id="privacy-modal-description" className="text-muted-foreground font-light mb-8">Última actualización: Enero 2026</p>

            <div className="space-y-8 text-white/80 font-light leading-relaxed text-sm">
              {/* Introduction */}
              <section>
                <h3 className="text-lg font-heading text-white mb-3">1. Información General</h3>
                <p>
                  En <strong className="text-white">Terapia Resonancial®</strong> (en adelante, "nosotros" o "el servicio"),
                  operado por Daniela Vargas, nos comprometemos a proteger la privacidad de nuestros usuarios.
                  Esta política describe cómo recopilamos, usamos y protegemos tu información personal.
                </p>
              </section>

              {/* Data Collection */}
              <section>
                <h3 className="text-lg font-heading text-white mb-3">2. Información que Recopilamos</h3>
                <p className="mb-3">Podemos recopilar los siguientes tipos de información:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong className="text-white/90">Información de contacto:</strong> nombre, correo electrónico, número de teléfono/WhatsApp</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong className="text-white/90">Información de sesiones:</strong> notas de sesiones, historial de servicios contratados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong className="text-white/90">Información técnica:</strong> dirección IP, tipo de navegador, páginas visitadas (mediante cookies analíticas)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong className="text-white/90">Información de pago:</strong> datos necesarios para procesar transacciones (no almacenamos datos de tarjetas)</span>
                  </li>
                </ul>
              </section>

              {/* Use of Data */}
              <section>
                <h3 className="text-lg font-heading text-white mb-3">3. Uso de la Información</h3>
                <p className="mb-3">Utilizamos tu información para:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Proveer y personalizar nuestros servicios de terapia y acompañamiento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Comunicarnos contigo sobre sesiones, confirmaciones y seguimiento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Enviarte información sobre nuevos servicios, eventos o contenido (solo con tu consentimiento)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Mejorar nuestra página web y servicios mediante análisis anónimos</span>
                  </li>
                </ul>
              </section>

              {/* Data Protection */}
              <section>
                <h3 className="text-lg font-heading text-white mb-3">4. Protección de Datos</h3>
                <p>
                  Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal
                  contra acceso no autorizado, alteración, divulgación o destrucción. La información de sesiones
                  terapéuticas se mantiene bajo estricta confidencialidad profesional.
                </p>
              </section>

              {/* Data Sharing */}
              <section>
                <h3 className="text-lg font-heading text-white mb-3">5. Compartir Información</h3>
                <p>
                  <strong className="text-white">No vendemos ni compartimos</strong> tu información personal con terceros
                  para fines comerciales. Solo compartimos datos con:
                </p>
                <ul className="space-y-2 ml-4 mt-3">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Proveedores de servicios técnicos (hosting, analytics) bajo acuerdos de confidencialidad</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Autoridades cuando sea requerido por ley</span>
                  </li>
                </ul>
              </section>

              {/* Cookies */}
              <section>
                <h3 className="text-lg font-heading text-white mb-3">6. Cookies</h3>
                <p>
                  Utilizamos cookies para mejorar tu experiencia de navegación y analizar el uso de nuestra página.
                  Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar algunas funcionalidades.
                </p>
              </section>

              {/* User Rights */}
              <section>
                <h3 className="text-lg font-heading text-white mb-3">7. Tus Derechos</h3>
                <p className="mb-3">Tienes derecho a:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Acceder a tu información personal</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Solicitar corrección de datos inexactos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Solicitar eliminación de tu información</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Darte de baja de comunicaciones promocionales</span>
                  </li>
                </ul>
                <p className="mt-3">
                  Para ejercer estos derechos, contáctanos a <a href="mailto:info@terapiaresonancial.com" className="text-primary hover:underline">info@terapiaresonancial.com</a>
                </p>
              </section>

              {/* Contact */}
              <section>
                <h3 className="text-lg font-heading text-white mb-3">8. Contacto</h3>
                <p>
                  Si tienes preguntas sobre esta política de privacidad, puedes contactarnos en:
                </p>
                <div className="mt-3 p-4 bg-white/5 rounded-xl border border-white/10">
                  <p><strong className="text-white">Terapia Resonancial®</strong></p>
                  <p>Email: info@terapiaresonancial.com</p>
                  <p>WhatsApp: +591 69703379</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
PrivacyModal.displayName = "PrivacyModal";

// Terms of Service Modal
export const TermsModal = memo(({ open, onClose }: { open: boolean; onClose: () => void }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto overscroll-contain bg-zinc-950 border-white/10 p-0" aria-describedby="terms-modal-description">
        <div className="relative">
          <DialogClose className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors" aria-label="Cerrar modal">
            <X className="w-5 h-5" />
          </DialogClose>

          <div className="p-8 md:p-12">
            <span className="text-xs uppercase tracking-[0.3em] text-primary mb-3 block">Legal</span>
            <h2 className="text-3xl md:text-4xl font-heading text-white mb-2">Términos y Condiciones</h2>
            <p id="terms-modal-description" className="text-muted-foreground font-light mb-8">Última actualización: Enero 2026</p>

            <div className="space-y-8 text-white/80 font-light leading-relaxed text-sm">
              {/* Introduction */}
              <section>
                <h3 className="text-lg font-heading text-white mb-3">1. Aceptación de Términos</h3>
                <p>
                  Al acceder y utilizar los servicios de <strong className="text-white">Terapia Resonancial®</strong>,
                  aceptas estos términos y condiciones en su totalidad. Si no estás de acuerdo con alguno de estos
                  términos, te pedimos que no utilices nuestros servicios.
                </p>
              </section>

              {/* Services Description */}
              <section>
                <h3 className="text-lg font-heading text-white mb-3">2. Descripción de Servicios</h3>
                <p className="mb-3">
                  Terapia Resonancial® ofrece servicios de bienestar, desarrollo personal y acompañamiento
                  terapéutico holístico, incluyendo pero no limitado a:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Sesiones de Detox Frecuencial, Reconfiguración y Mapa Resonancial</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Pack Completo (combinación de sesiones)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Almanaque Ritual Resonancial (producto digital)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Tarjetas de regalo</span>
                  </li>
                </ul>
              </section>

              {/* Bookings & Payments */}
              <section>
                <h3 className="text-lg font-heading text-white mb-3">3. Reservas y Pagos</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong className="text-white/90">Reservas:</strong> Las sesiones se agendan por WhatsApp previo acuerdo de fecha y hora.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong className="text-white/90">Pago:</strong> El pago se realiza antes de la sesión mediante transferencia bancaria o métodos acordados.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong className="text-white/90">Precios:</strong> Los precios están expresados en Bolivianos (Bs) y Dólares (USD). Nos reservamos el derecho de modificar precios con previo aviso.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong className="text-white/90">Confirmación:</strong> Tu reserva se confirma una vez recibido el pago.</span>
                  </li>
                </ul>
              </section>

              {/* Digital Products */}
              <section>
                <h3 className="text-lg font-heading text-white mb-3">4. Productos Digitales</h3>
                <p>
                  El <strong className="text-white">Almanaque Ritual Resonancial</strong> y otros productos digitales:
                </p>
                <ul className="space-y-2 ml-4 mt-3">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Son para uso personal y no transferible</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>No pueden ser reproducidos, distribuidos o revendidos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>No admiten reembolso una vez entregados</span>
                  </li>
                </ul>
              </section>

              {/* Gift Cards */}
              <section>
                <h3 className="text-lg font-heading text-white mb-3">5. Tarjetas de Regalo</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Válidas por 12 meses desde la fecha de compra</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>No reembolsables ni canjeables por dinero</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Transferibles a terceros</span>
                  </li>
                </ul>
              </section>

              {/* Confidentiality */}
              <section>
                <h3 className="text-lg font-heading text-white mb-3">6. Confidencialidad</h3>
                <p>
                  Todo lo compartido durante las sesiones se mantiene bajo <strong className="text-white">estricta
                  confidencialidad</strong>. No divulgamos información personal de nuestros clientes a terceros,
                  excepto cuando sea requerido por ley o con tu consentimiento expreso.
                </p>
              </section>

              {/* Intellectual Property */}
              <section>
                <h3 className="text-lg font-heading text-white mb-3">7. Propiedad Intelectual</h3>
                <p>
                  <strong className="text-white">Terapia Resonancial®</strong> es una marca registrada. Todo el contenido
                  de esta página web, incluyendo textos, imágenes, logos y metodologías, está protegido por derechos
                  de autor y no puede ser utilizado sin autorización escrita.
                </p>
              </section>

              {/* Limitation of Liability */}
              <section>
                <h3 className="text-lg font-heading text-white mb-3">8. Limitación de Responsabilidad</h3>
                <p>
                  Terapia Resonancial® no se hace responsable de los resultados individuales de cada persona,
                  ya que el proceso de transformación depende del compromiso y participación activa de cada cliente.
                  Los testimonios y experiencias compartidas son individuales y no garantizan resultados similares.
                </p>
              </section>

              {/* Changes */}
              <section>
                <h3 className="text-lg font-heading text-white mb-3">9. Modificaciones</h3>
                <p>
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán
                  publicados en esta página y entrarán en vigor inmediatamente.
                </p>
              </section>

              {/* Contact */}
              <section>
                <h3 className="text-lg font-heading text-white mb-3">10. Contacto</h3>
                <p>
                  Para preguntas sobre estos términos, contáctanos:
                </p>
                <div className="mt-3 p-4 bg-white/5 rounded-xl border border-white/10">
                  <p><strong className="text-white">Terapia Resonancial®</strong></p>
                  <p>Email: info@terapiaresonancial.com</p>
                  <p>WhatsApp: +591 69703379</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
TermsModal.displayName = "TermsModal";
