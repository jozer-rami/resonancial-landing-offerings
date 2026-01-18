import { memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, GraduationCap, Sparkles, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ModalCloseButton } from "@/components/ui/modal-close";
import { OptimizedImage } from "@/components/ui/optimized-image";

// Use optimized WebP image (72KB vs 6MB original)
const founderImageWebP = "/images/optimized/daniela-vargas.webp";

// Founder data
const founderData = {
  nombre: "Daniela Vargas",
  titulo: "Terapeuta & Creadora de Terapia Resonancial®️",
  quote: "Creo profundamente que cuando una persona se ordena por dentro, su energía, sus decisiones y su realidad comienzan a reacomodarse de manera natural.",
  bioCorta: "Soy Daniela Vargas, terapeuta y creadora de Terapia Resonancial®️. Mi formación es holística e integrativa, con más de diez años de estudio y experiencia en disciplinas de conciencia, energía y desarrollo personal.\n\nIntegro coaching holístico, constelaciones familiares, psicogenealogía, meditación, mindfulness, biodescodificación, bioneuroemoción, sintonización de biocampo, tarot evolutivo y diseño humano, sustentado por una sólida base académica en comunicación, liderazgo e inteligencia emocional.\n\nTerapia Resonancial®️ nace como la síntesis de este recorrido: un método para limpiar, reordenar y reconectar con tu frecuencia original, transformando la vida desde adentro hacia afuera.",
  bioExtendida: [
    "Soy Daniela Vargas, terapeuta y creadora del método Terapia Resonancial®️. Mi trabajo integra formación académica, desarrollo humano y conciencia espiritual aplicada, acompañando procesos de transformación profunda desde una mirada holística y estructurada.",
    "Mi base profesional se construyó en el ámbito de la Comunicación Corporativa, complementada con una Maestría en Coaching y Liderazgo, una Maestría en Inteligencia Emocional y una Maestría en Marketing con Inteligencia Artificial. Esta formación me permitió comprender con claridad cómo las personas piensan, sienten, se vinculan y toman decisiones, tanto en contextos personales como profesionales.",
    "Durante varios años me desempeñé como docente universitaria en prestigiosas universidades de Bolivia, experiencia que fortaleció mi capacidad de análisis, síntesis y transmisión de conocimiento, así como el diseño de procesos formativos claros, éticos y aplicables a la vida real.",
    "Paralelamente a mi recorrido académico y profesional, inicié un camino profundo de búsqueda interior, con el propósito de integrar la espiritualidad a mi desarrollo mental, emocional y profesional. Este proceso comenzó desde la experiencia personal, transitando primero el rol de paciente, luego el de aprendiz y finalmente el de facilitadora de las herramientas que generaron transformación real en mi propia vida.",
    "A lo largo de más de diez años de estudio y práctica continua, me he formado en coaching y coaching holístico, constelaciones familiares, enfoque transgeneracional y psicogenealogía, meditación y mindfulness, thetahealing, biodescodificación (con Christian Flèche), proyecto sentido (con Jean Guillaume), bioneuroemoción (con Enric Corbera), sintonización de biocampo, tarot evolutivo y diseño humano.",
    "Este recorrido me permitió comprender que la transformación verdadera no ocurre desde la exigencia ni la repetición de patrones, sino desde la alineación interna, la conciencia y la coherencia entre pensamiento, emoción, energía y acción.",
    "Como síntesis de esta experiencia nace Terapia Resonancial®️, un método propio orientado a la limpieza, reconfiguración y alineación del sistema interno, que acompaña a las personas a reconectar con su frecuencia original, fortalecer su autoliderazgo consciente y sostener cambios reales en su vida personal y profesional."
  ],
  quoteModal: "No se trata de convertirse en alguien distinto, sino de recordar quién eres y aprender a vivir desde ese lugar, con mayor claridad, presencia y propósito.",
  credenciales: [
    { label: "10+ años de experiencia", icon: "experience" },
    { label: "Método propio registrado", icon: "method" },
    { label: "3 Maestrías", icon: "academic" },
    { label: "Docente universitaria", icon: "teaching" }
  ],
  formacionAcademica: [
    "Comunicación Corporativa",
    "Maestría en Coaching y Liderazgo",
    "Maestría en Inteligencia Emocional",
    "Maestría en Marketing con IA",
    "Docente universitaria en Bolivia"
  ],
  formacionHolistica: [
    "Coaching y Coaching Holístico",
    "Constelaciones Familiares",
    "Enfoque Transgeneracional y Psicogenealogía",
    "Meditación y Mindfulness",
    "ThetaHealing",
    "Biodescodificación (Christian Flèche)",
    "Proyecto Sentido (Jean Guillaume)",
    "Bioneuroemoción (Enric Corbera)",
    "Sintonización de Biocampo",
    "Tarot Evolutivo",
    "Diseño Humano"
  ],
  whatsapp: "https://wa.me/59169703379?text=Hola%20Daniela,%20me%20gustaría%20conocer%20más%20sobre%20tu%20trabajo"
};

// Credential Badge Component
const CredentialBadge = memo(({ label }: { label: string }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-white/70">
    <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
    {label}
  </div>
));
CredentialBadge.displayName = "CredentialBadge";

// Founder Modal Component
export const FounderModal = memo(({ open, onClose }: { open: boolean; onClose: () => void }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto overscroll-contain bg-zinc-950 border-white/10 p-0" aria-describedby="founder-modal-description">
        <div className="relative">
          {/* Header Image */}
          <div className="h-64 md:h-80 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950 z-10" />
            <OptimizedImage
              src={founderImageWebP}
              alt={founderData.nombre}
              width={800}
              height={1200}
              className="w-full h-full object-cover object-top"
            />
          </div>

          <ModalCloseButton />

          <div className="p-8 md:p-12 -mt-12 relative z-20">
            {/* Name & Title */}
            <span className="text-xs uppercase tracking-[0.3em] text-primary mb-3 block">Tu Guía</span>
            <h2 className="text-3xl md:text-4xl font-heading text-white mb-2">{founderData.nombre}</h2>
            <p id="founder-modal-description" className="text-muted-foreground font-light mb-8">{founderData.titulo}</p>

            <div className="space-y-8">
              {/* Mi Historia */}
              <div>
                <h3 className="text-sm uppercase tracking-widest text-primary mb-4">Mi Historia</h3>
                <div className="space-y-4">
                  {founderData.bioExtendida.map((paragraph, i) => (
                    <p key={i} className="text-white/80 font-light leading-relaxed text-sm">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Formation Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Academic Formation */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                  <h3 className="text-sm uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Formación Académica
                  </h3>
                  <ul className="space-y-2">
                    {founderData.formacionAcademica.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Holistic Formation */}
                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                  <h3 className="text-sm uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Formación Holística (10+ años)
                  </h3>
                  <ul className="space-y-2">
                    {founderData.formacionHolistica.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Quote */}
              <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5 text-center">
                <p className="text-xl md:text-2xl font-heading text-white italic">"{founderData.quoteModal}"</p>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-white/5">
                <Button asChild size="lg" className="w-full sm:w-auto bg-primary text-black hover:bg-primary/90 rounded-full px-10 py-6 text-xs uppercase tracking-widest font-bold transition-all">
                  <a href={founderData.whatsapp} target="_blank" rel="noreferrer">
                    Agendar Sesión
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
FounderModal.displayName = "FounderModal";

// Main Founder Section Component
interface FounderProps {
  onOpenModal: () => void;
}

export const Founder = memo(({ onOpenModal }: FounderProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      id="guia"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="py-16 md:py-24 bg-zinc-900/20 relative overflow-hidden scroll-mt-20"
    >
      {/* Background Gradient */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Section Header */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0 }}
          className="text-center mb-12"
        >
          <span className="text-primary text-sm tracking-[0.3em] uppercase font-bold mb-4 block">
            Conoce a tu guía
          </span>
          <h2 className="text-4xl md:text-5xl font-heading text-balance">
            Quien te acompaña en <br className="hidden md:block" />
            <span className="text-primary italic">tu transformación</span>
          </h2>
        </motion.div>

        {/* Founder Card */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.1 }}
          className="bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm"
        >
          <div className="grid lg:grid-cols-5 gap-0">
            {/* Image Side - 2 columns */}
            <div className="lg:col-span-2 relative">
              <div className="aspect-[4/5] lg:aspect-auto lg:h-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-zinc-900/80 via-transparent to-transparent z-10" />
                <OptimizedImage
                  src={founderImageWebP}
                  alt={founderData.nombre}
                  width={800}
                  height={1200}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            {/* Content Side - 3 columns */}
            <div className="lg:col-span-3 p-8 md:p-12 flex flex-col justify-center">
              {/* Name & Title */}
              <h3 className="text-3xl md:text-4xl font-heading text-white mb-2">
                {founderData.nombre}
              </h3>
              <p className="text-primary/80 font-light mb-6 text-base">
                {founderData.titulo}
              </p>

              {/* Quote */}
              <div className="mb-6 pl-4 border-l-2 border-primary/30">
                <Quote className="w-5 h-5 text-primary/40 mb-2" />
                <p className="text-white/80 font-light italic leading-relaxed">
                  "{founderData.quote}"
                </p>
              </div>

              {/* Short Bio */}
              <div className="mb-6 space-y-3">
                {founderData.bioCorta.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-white/60 font-light leading-relaxed text-sm">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Credentials */}
              <div className="flex flex-wrap gap-2 mb-8">
                {founderData.credenciales.map((cred, i) => (
                  <CredentialBadge key={i} label={cred.label} />
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={onOpenModal}
                  className="border-primary/20 hover:bg-primary hover:text-black rounded-full text-xs uppercase tracking-widest px-6"
                >
                  Conocer más
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-black hover:bg-primary/90 rounded-full px-8 text-xs uppercase tracking-widest font-bold transition-all"
                >
                  <a href={founderData.whatsapp} target="_blank" rel="noreferrer">
                    Agendar Sesión
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
});
Founder.displayName = "Founder";

export default Founder;
