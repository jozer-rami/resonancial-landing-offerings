import React, { useState, memo } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { CheckCircle2, X, Moon, Star, Users, XCircle } from "lucide-react";
import { trackWhatsAppClick, trackModalOpen, trackModalClose } from "@/lib/analytics";
import { useScrollTracking } from "@/hooks/useScrollTracking";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Newsletter } from "@/components/Newsletter";
import { Testimonials } from "@/components/Testimonials";
import { Founder, FounderModal } from "@/components/Founder";
import { FAQ } from "@/components/FAQ";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ModalCloseButton } from "@/components/ui/modal-close";
// Optimized WebP images (98%+ size reduction)
const logoSymbol = "/images/optimized/logo-symbol.webp";
const logo_resonancial_blanco = "/images/optimized/logo-white.webp";
const detoxModalImg = "/images/optimized/detox-modal.webp";
const reconfigModalImg = "/images/optimized/reconfig-modal.webp";
const mapaModalImg = "/images/optimized/mapa-modal.webp";
const almanaqueImg = "/images/optimized/almanaque.webp";

// Roman numeral converter for station labels
const toRomanNumeral = (num: number): string => {
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  return romanNumerals[num - 1] || String(num);
};

// Video assets (converted from GIFs - 92% size reduction)
const videoAssets = {
  detox: { webm: "/videos/detox.webm", mp4: "/videos/detox.mp4" },
  reconfiguracion: { webm: "/videos/reconfiguracion.webm", mp4: "/videos/reconfiguracion.mp4" },
  mapa: { webm: "/videos/mapa.webm", mp4: "/videos/mapa.mp4" },
  heroAnimation: { webm: "/videos/hero-animation.webm", mp4: "/videos/hero-animation.mp4" },
};

// Optimized video component for course cards
const VideoBackground = memo(({ videoKey, className = "" }: { videoKey: keyof typeof videoAssets, className?: string }) => {
  const video = videoAssets[videoKey];
  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      aria-hidden="true"
      className={className}
    >
      <source src={video.webm} type="video/webm" />
      <source src={video.mp4} type="video/mp4" />
    </video>
  );
});
VideoBackground.displayName = "VideoBackground";

// --- Course Data ---
const courseDetails = {
  detox: {
    title: "Detox Frecuencial",
    subtitle: "Liberación",
    tagline: "Liberación de resistencias y limpieza del campo energético",
    purpose: "Antes de elevar tu frecuencia, es necesario vaciar el campo. Todo lo que no se libera (emociones, creencias, memorias) distorsiona la vibración desde la cual intentas crear. Detox Frecuencial es una activación profunda diseñada para soltar cargas que impiden sostener frecuencias más altas.",
    works: ["Resistencias conscientes e inconscientes", "Cargas emocionales acumuladas", "Bloqueos energéticos y patrones repetitivos", "Fatiga vibracional y sensación de estancamiento"],
    activates: ["Limpieza del campo energético", "Sensación de ligereza y claridad", "Mayor disponibilidad interna para el cambio", "Preparación real para la reconfiguración"],
    experience: ["Lectura del estado frecuencial actual", "Identificación de resistencias activas", "Limpieza energética guiada", "Liberación frecuencial consciente", "Cierre e integración"],
    quote: "No puedes vibrar alto con cargas del pasado.",
    whatsapp: "https://wa.me/59169703379?text=Hola,%20quiero%20reservar%20DETOX%20FRECUENCIAL",
    image: detoxModalImg
  },
  reconfiguracion: {
    title: "Reconfiguración Frecuencial",
    subtitle: "Estabilidad",
    tagline: "Ajuste profundo de tu vibración base",
    purpose: "Limpiar no es suficiente. El sistema necesita aprender a integrar una nueva frecuencia sin volver automáticamente al patrón anterior. Reconfiguración de Frecuencia permite reordenar tu vibración base, alineando mente, cuerpo y emoción en coherencia.",
    works: ["Patrón vibracional habitual", "Desajustes entre intención y energía", "Inestabilidad emocional o mental", "Dificultad para integrar estados elevados"],
    activates: ["Coherencia interna", "Estabilidad energética", "Mayor claridad y presencia", "Capacidad de integrar nuevas realidades"],
    experience: ["Diagnóstico de la vibración base", "Ajuste frecuencial profundo", "Alineación mente–emoción–energía", "Anclaje de la nueva frecuencia", "Integración consciente"],
    quote: "No se trata de subir la frecuencia, sino de integrarla y sostenerla.",
    whatsapp: "https://wa.me/59169703379?text=Hola,%20quiero%20reservar%20RECONFIGURACIÓN%20FRECUENCIAL",
    image: reconfigModalImg
  },
  mapa: {
    title: "Mapa Resonancial",
    subtitle: "Visión Encarnada",
    tagline: "Activación de la visión encarnada del 2026",
    purpose: "No se manifiesta desde el deseo mental. Se manifiesta desde la frecuencia que habitas. Mapa Resonancial es una experiencia donde la visión del nuevo ciclo emerge desde la coherencia interna, no desde la fantasía.",
    works: ["Claridad de dirección", "Visión alineada con la frecuencia real", "Coherencia entre lo que deseas y lo que vibras", "Encarnación de una nueva identidad energética"],
    activates: ["Visión clara y sostenida", "Sensación de dirección y propósito", "Alineación con la energía del 2026", "Capacidad de crear sin resistencia"],
    experience: ["Lectura del estado resonancial", "Conexión con la frecuencia del nuevo ciclo", "Construcción simbólica del Mapa Resonancial", "Anclaje de la visión en el campo energético", "Integración cuerpo–mente–espíritu"],
    quote: "Primero vibra la realidad. Luego créala y habitala.",
    whatsapp: "https://wa.me/59169703379?text=Hola,%20quiero%20reservar%20MAPA%20RESONANCIAL",
    image: mapaModalImg
  }
};

// --- Reusable Components with Memoization & Reduced Motion Support ---

const FadeIn = memo(({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay, ease: "easeOut" }}
      className={className}
      style={{ willChange: shouldReduceMotion ? "auto" : "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
});
FadeIn.displayName = "FadeIn";

const SectionFadeIn = memo(({ children, className = "", id }: { children: React.ReactNode, className?: string, id?: string }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      id={id}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`${className} scroll-mt-20`}
      style={{ willChange: shouldReduceMotion ? "auto" : "transform, opacity" }}
    >
      {children}
    </motion.section>
  );
});
SectionFadeIn.displayName = "SectionFadeIn";

const CourseModal = memo(({ course, open, onClose }: { course: typeof courseDetails.detox | null, open: boolean, onClose: () => void }) => {
  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto overscroll-contain bg-zinc-950 border-white/10 p-0" aria-describedby="course-modal-description">
        <div className="relative">
          <div className="h-48 md:h-64 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950 z-10" />
            <img src={course.image} alt={course.title} width={768} height={256} loading="lazy" className="w-full h-full object-cover" />
          </div>
          
          <ModalCloseButton />

          <div className="p-8 md:p-12 -mt-12 relative z-20">
            <span className="text-xs uppercase tracking-[0.3em] text-primary mb-3 block">{course.subtitle}</span>
            <h2 className="text-3xl md:text-4xl font-heading text-white mb-2">{course.title}</h2>
            <p id="course-modal-description" className="text-muted-foreground font-light mb-8">{course.tagline}</p>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-sm uppercase tracking-widest text-primary mb-4">Propósito</h3>
                <p className="text-white/80 font-light leading-relaxed">{course.purpose}</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                  <h3 className="text-sm uppercase tracking-widest text-primary mb-4">¿Qué se trabaja?</h3>
                  <ul className="space-y-2">
                    {course.works.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                  <h3 className="text-sm uppercase tracking-widest text-primary mb-4">¿Qué activa?</h3>
                  <ul className="space-y-2">
                    {course.activates.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm uppercase tracking-widest text-primary mb-4">Experiencia (1 Activación)</h3>
                <div className="flex flex-wrap gap-2">
                  {course.experience.map((item, i) => (
                    <span key={i} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/70">
                      {i + 1}. {item}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5 text-center">
                <p className="text-xl md:text-2xl font-heading text-white italic">"{course.quote}"</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
                <div className="flex flex-col">
                  <span className="text-3xl font-heading text-white">369 Bs</span>
                  <span className="text-lg font-heading text-muted-foreground">36.9 USD</span>
                </div>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-primary/20 hover:bg-primary hover:text-black rounded-full px-10 py-6 text-xs uppercase tracking-widest transition-all">
                  <a
                    href={course.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackWhatsAppClick(course.title.toLowerCase().replace(/\s+/g, '_'), 'course_modal', 36.9)}
                  >
                    Reservar Ahora
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
CourseModal.displayName = "CourseModal";

const AlmanaqueModal = memo(({ open, onClose }: { open: boolean, onClose: () => void }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto overscroll-contain bg-zinc-950 border-white/10 p-0" aria-describedby="almanaque-modal-description">
        <div className="relative">
          <div className="h-64 md:h-80 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950 z-10" />
            <img src={almanaqueImg} alt="Almanaque Ritual Resonancial 2026" width={768} height={320} loading="lazy" className="w-full h-full object-cover object-top" />
          </div>

          <ModalCloseButton />

          <div className="p-8 md:p-12 -mt-12 relative z-20">
            <span className="text-xs uppercase tracking-[0.3em] text-primary mb-3 block">Objeto Ritual Anual</span>
            <h2 className="text-3xl md:text-4xl font-heading text-white mb-2">Almanaque Ritual Resonancial 2026™️</h2>
            <p id="almanaque-modal-description" className="text-muted-foreground font-light mb-8">Rituales personalizados para habitar el tiempo desde la conciencia</p>
            
            <div className="space-y-8">
              {/* ¿Qué es? */}
              <div>
                <h3 className="text-sm uppercase tracking-widest text-primary mb-4">¿Qué es este Almanaque?</h3>
                <p className="text-white/80 font-light leading-relaxed">
                  El Almanaque Ritual Resonancial 2026™️ es un objeto ritual anual diseñado para acompañarte energéticamente durante todo el año. No organiza fechas. <span className="text-primary">Organiza tu energía en el tiempo.</span>
                </p>
              </div>
              
              {/* Por qué no funcionan los planners */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                <h3 className="text-sm uppercase tracking-widest text-primary mb-4">¿Por qué no funcionan los planners comunes?</h3>
                <ul className="space-y-2 mb-4">
                  {[
                    "Porque trabajan la mente, no el campo energético",
                    "Porque exigen constancia en lugar de conciencia",
                    "Porque no acompañan los momentos de quiebre"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-primary/80 italic">Este Almanaque responde a momentos internos, no a obligaciones externas.</p>
              </div>
              
              {/* Qué lo hace diferente */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                  <h3 className="text-sm uppercase tracking-widest text-primary mb-4">¿Qué lo hace diferente?</h3>
                  <ul className="space-y-2">
                    {[
                      "10 Estaciones Energéticas",
                      "Rituales paso a paso",
                      "Uso no lineal",
                      "Ritual de cumpleaños personalizado",
                      "Rituales lunares esenciales",
                      "Portales energéticos clave 2026"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                  <h3 className="text-sm uppercase tracking-widest text-primary mb-4">Las 10 Estaciones</h3>
                  <ul className="space-y-1">
                    {[
                      "El Umbral Silencioso", "El Latido Intencional", "La Emergencia Sutil",
                      "El Anclaje Consciente", "La Expansión Auténtica", "La Fricción Sagrada",
                      "La Integración del Ser", "El Refinamiento del Ser", "El Vacío Metamórfico", "El Renacimiento Frecuencial"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-white/60">
                        <span className="text-primary/50">{toRomanNumeral(i + 1)}</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Ritual de Cumpleaños */}
              <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-2xl p-6 border border-primary/20 relative overflow-hidden">
                <Star className="absolute top-4 right-4 w-6 h-6 text-primary/30" />
                <h3 className="text-sm uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Ritual de Cumpleaños Personalizado
                </h3>
                <p className="text-white/70 font-light leading-relaxed text-sm">
                  Tu cumpleaños es el portal energético más importante del año. Recibirás un ritual diseñado según tu signo solar, alineado a tu elemento y energía natal. <span className="text-primary">Este ritual es único y no se repite.</span>
                </p>
              </div>
              
              {/* Rituales Lunares */}
              <div>
                <h3 className="text-sm uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  Rituales Lunares
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { phase: "Luna Nueva", action: "siembra" },
                    { phase: "Luna Llena", action: "revelación" },
                    { phase: "Luna Menguante", action: "liberación" }
                  ].map((item, i) => (
                    <span key={i} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/70">
                      {item.phase} — <span className="text-primary/70">{item.action}</span>
                    </span>
                  ))}
                </div>
              </div>
              
              {/* ¿Qué incluye? */}
              <div>
                <h3 className="text-sm uppercase tracking-widest text-primary mb-4">¿Qué incluye exactamente?</h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {[
                    "Almanaque Ritual Resonancial 2026™️",
                    "Guía de uso",
                    "10 Estaciones Energéticas",
                    "Rituales escritos",
                    "Rituales lunares",
                    "Ritual de cumpleaños personalizado",
                    "Portales energéticos 2026"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                      <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Para quién es / No es */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                  <h3 className="text-xs uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    Para quién es
                  </h3>
                  <ul className="space-y-1">
                    {["Personas conscientes", "Quienes ya hicieron trabajo personal", "Buscan sostén energético real"].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-white/60">
                        <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                  <h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
                    <XCircle className="w-3 h-3" />
                    No es para
                  </h3>
                  <ul className="space-y-1">
                    {["Quienes buscan predicciones", "Consumo pasivo sin acción"].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-white/40">
                        <X className="w-3 h-3 text-zinc-600 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Quote */}
              <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5 text-center">
                <p className="text-xl md:text-2xl font-heading text-white italic">"El tiempo va a pasar igual.<br/><span className="text-primary">La diferencia es desde qué frecuencia lo atraviesas."</span></p>
              </div>
              
              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
                <div className="flex flex-col text-center sm:text-left">
                  <span className="text-xs text-muted-foreground mb-1">Formato Digital · Personalización incluida</span>
                  <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                    <span className="text-3xl font-heading text-white">444 Bs</span>
                    <span className="text-lg font-heading text-muted-foreground">44.4 USD</span>
                  </div>
                </div>
                <Button asChild size="lg" className="w-full sm:w-auto bg-primary text-black hover:bg-primary/90 rounded-full px-10 py-6 text-xs uppercase tracking-widest font-bold transition-all">
                  <a
                    href="https://wa.me/59169703379?text=Hola,%20quiero%20mi%20Almanaque%20Ritual%20Resonancial%20Personalizado%202026"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackWhatsAppClick('almanaque_ritual', 'almanaque_modal', 44.4)}
                  >
                    Quiero Mi Almanaque
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
AlmanaqueModal.displayName = "AlmanaqueModal";

const CourseCard = memo(({ title, subtitle, description, price, videoKey, courseKey, delay, onOpenModal }: {
  title: string;
  subtitle: string;
  description: string;
  price: string;
  videoKey: keyof typeof videoAssets;
  courseKey: keyof typeof courseDetails;
  delay: number;
  onOpenModal: (key: keyof typeof courseDetails) => void;
}) => {
  return (
    <FadeIn delay={delay} className="group h-full">
      <div className="h-full bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col">
        <div className="relative h-64 overflow-hidden">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
          <VideoBackground
            videoKey={videoKey}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </div>
        
        <div className="p-8 flex flex-col flex-grow">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 block">{subtitle}</span>
          <h3 className="text-2xl font-heading text-primary mb-3">{title}</h3>
          <p className="text-muted-foreground leading-relaxed mb-6 text-sm flex-grow font-light">
            {description}
          </p>

          <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
            <div className="flex flex-col">
              <span className="text-xl font-heading text-white">{price}</span>
              <span className="text-sm font-heading text-muted-foreground">36.9 USD</span>
            </div>
            <Button 
              variant="outline" 
              className="border-primary/20 hover:bg-primary hover:text-black rounded-full text-xs uppercase tracking-widest"
              onClick={() => onOpenModal(courseKey)}
            >
              Ver detalles
            </Button>
          </div>
        </div>
      </div>
    </FadeIn>
  );
});
CourseCard.displayName = "CourseCard";

export default function Home() {
  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 800], [0, 400]);
  const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);
  const heroContentY = useTransform(scrollY, [0, 400], [0, -60]);
  const gradientOpacity = useTransform(scrollY, [0, 500], [0.6, 1]);
  const [selectedCourse, setSelectedCourse] = useState<keyof typeof courseDetails | null>(null);
  const [almanaqueModalOpen, setAlmanaqueModalOpen] = useState(false);
  const [founderModalOpen, setFounderModalOpen] = useState(false);

  // Track scroll depth milestones (25%, 50%, 75%, 100%)
  useScrollTracking();

  const handleOpenModal = (courseKey: keyof typeof courseDetails) => {
    setSelectedCourse(courseKey);
    trackModalOpen(courseKey, 'services_section');
  };

  const handleCloseModal = () => {
    if (selectedCourse) {
      trackModalClose(selectedCourse);
    }
    setSelectedCourse(null);
  };

  const handleAlmanaqueModalOpen = () => {
    setAlmanaqueModalOpen(true);
    trackModalOpen('almanaque_ritual', 'almanaque_section');
  };

  const handleAlmanaqueModalClose = () => {
    trackModalClose('almanaque_ritual');
    setAlmanaqueModalOpen(false);
  };

  const handleFounderModalOpen = () => {
    setFounderModalOpen(true);
    trackModalOpen('founder_bio', 'founder_section');
  };

  const handleFounderModalClose = () => {
    trackModalClose('founder_bio');
    setFounderModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 selection:text-white">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-black focus:px-4 focus:py-2 focus:rounded-full focus:outline-none focus:font-medium"
      >
        Saltar al contenido
      </a>
      <Navbar />
      {/* --- HERO SECTION --- */}
      <main id="main-content">
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Visually hidden h1 for accessibility */}
        <h1 className="sr-only">Portal Resonancial - Terapia de Alineación Energética</h1>
        {/* Parallax Background */}
        <motion.div
          style={{ y: yHero }}
          className="absolute inset-0 z-0 will-change-transform"
        >
          <img
            src="https://editorialverdadparavivir.my.canva.site/portal-resonancial-2026/_assets/media/1e4636f01fb53f80b0d9d66fc6885150.jpg"
            alt=""
            aria-hidden="true"
            width={1920}
            height={1080}
            fetchPriority="high"
            decoding="async"
            className="w-full h-[120%] object-cover object-center"
          />
        </motion.div>
        
        {/* Static dark overlay */}
        <div className="absolute inset-0 bg-black/50 z-10" />
        
        {/* Dynamic gradient overlay that darkens on scroll */}
        <motion.div 
          style={{ opacity: gradientOpacity }}
          className="absolute inset-0 bg-gradient-to-b from-[rgba(26,20,15,0.3)] via-[rgba(26,20,15,0.6)] to-background z-20 will-change-opacity"
        />

        {/* Hero Content - Clean & Centered with fade out */}
        <motion.div 
          style={{ opacity: opacityHero, y: heroContentY }}
          className="relative z-30 container mx-auto px-4 text-center max-w-4xl will-change-transform"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center gap-8"
          >
            {/* Symbol */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-24 h-24 relative flex items-center justify-center"
            >
              <div className="absolute inset-0 border border-primary/20 rounded-full opacity-30 motion-safe:animate-[ping_3s_ease-in-out_infinite]" />
              <img src={logoSymbol} alt="Portal Resonancial" width={96} height={96} className="w-full h-full object-contain p-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
            </motion.div>

            {/* Main Logo Text */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-full max-w-lg mx-auto"
            >
               <img
                 src={logo_resonancial_blanco}
                 alt="Terapia Resonancial"
                 width={512}
                 height={128}
                 className="w-full h-auto"
               />
            </motion.div>

            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl md:text-2xl text-white/90 font-light leading-relaxed max-w-2xl mx-auto"
            >
              Un proceso de alineación energética para <br className="hidden md:block" />
              crear y habitar tu nuevo ciclo.
            </motion.p>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={{ opacity: opacityHero }}
            className="absolute -bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
          >
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">Descubre</span>
            <div className="w-px h-16 bg-gradient-to-b from-primary/0 via-primary/50 to-primary/0" />
          </motion.div>
        </motion.div>
      </section>
      {/* --- PHILOSOPHY SECTION (Trust/About) --- */}
      <SectionFadeIn id="filosofia" className="py-12 md:py-16 bg-background relative border-t border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="max-w-4xl mx-auto text-center">
            <FadeIn>
              <h2 className="text-5xl md:text-6xl font-heading leading-tight mb-8 text-balance">
                El 2026 no se planea. <br/>
                <span className="text-primary italic">Se sintoniza.</span>
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground font-light leading-relaxed">
                <p>
                  <strong className="text-white font-medium">No puedes vibrar alto con cargas del pasado.</strong>
                </p>
                <p>
                  Antes de elevar tu frecuencia, es necesario vaciar el campo. Todo lo que no se libera (emociones, creencias, memorias) distorsiona la vibración desde la cual intentas crear.
                </p>
                <p>
                  No se manifiesta desde el deseo mental. <br/>
                  <span className="text-primary border-b border-primary/30 pb-1 inline-block mt-2">Se manifiesta desde la frecuencia que habitas.</span>
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </SectionFadeIn>
      {/* --- FOUNDER SECTION --- */}
      <Founder onOpenModal={handleFounderModalOpen} />
      {/* --- COURSES SECTION (Grid Layout) --- */}
      <SectionFadeIn id="servicios" className="py-12 md:py-16 bg-zinc-900/20">
        <div className="container mx-auto px-4 max-w-7xl">
          <FadeIn className="text-center mb-10 max-w-2xl mx-auto">
            <span className="text-primary text-sm tracking-[0.3em] uppercase font-bold mb-4 block">las tres activaciones para cruzar el 2026</span>
            <h2 className="text-4xl md:text-5xl font-heading mb-6 text-balance">Portal Resonancial</h2>
            <p className="text-muted-foreground font-light">
              Explora nuestras sesiones diseñadas para limpiar, reconfigurar y proyectar tu energía hacia el nuevo ciclo.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            <CourseCard
              title="Detox Frecuencial"
              subtitle="Liberación"
              description="Liberación de resistencias y limpieza energética. Experiencia para soltar bloqueos y cargas que impiden elevar tu frecuencia. Ideal si sientes fatiga vibracional."
              price="369 Bs"
              videoKey="detox"
              courseKey="detox"
              onOpenModal={handleOpenModal}
              delay={0}
            />

            <CourseCard
              title="Reconfiguración"
              subtitle="Estabilidad"
              description="Ajuste profundo de tu vibración base. Activación diseñada para reordenar tu sistema y entrenarlo a sostener nuevas frecuencias de coherencia."
              price="369 Bs"
              videoKey="reconfiguracion"
              courseKey="reconfiguracion"
              onOpenModal={handleOpenModal}
              delay={0.1}
            />

            <CourseCard
              title="Mapa Resonancial"
              subtitle="Visión Encarnada"
              description="Activación de la visión encarnada del 2026. Alineación profunda donde mente, cuerpo y espíritu resuenan con la realidad que deseas habitar."
              price="369 Bs"
              videoKey="mapa"
              courseKey="mapa"
              onOpenModal={handleOpenModal}
              delay={0.2}
            />
          </div>
        </div>
      </SectionFadeIn>
      {/* --- TESTIMONIALS SECTION --- */}
      <Testimonials />
      {/* --- FEATURED BUNDLE (Split Layout) --- */}
      <SectionFadeIn id="pack" className="py-12 md:py-16 bg-zinc-950 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
            <div className="grid lg:grid-cols-2">
              {/* Video Side */}
              <div className="relative min-h-[400px] lg:h-full">
                <VideoBackground
                  videoKey="heroAnimation"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-6 left-6">
                  <span className="bg-primary text-black px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                    Oferta Estrella
                  </span>
                </div>
              </div>

              {/* Content Side */}
              <div className="p-10 md:p-16 flex flex-col justify-center">
                <FadeIn>
                  <h3 className="text-4xl font-heading mb-2 text-white">Pack Completo</h3>
                  <p className="text-primary/80 font-light mb-8 text-base italic">
                    La experiencia completa, con un beneficio exclusivo
                  </p>

                  <ul className="space-y-4 mb-8">
                    {[
                      { name: "Detox Frecuencial (Sesión 1:1)", price: "369 Bs" },
                      { name: "Reconfiguración de Frecuencia (Sesión 1:1)", price: "369 Bs" },
                      { name: "Mapa Resonancial (Sesión 1:1)", price: "369 Bs" },
                      { name: "BONUS: Almanaque Ritual Resonancial", price: "444 Bs", isBonus: true }
                    ].map((item, i) => (
                      <li key={i} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className={`w-5 h-5 shrink-0 ${item.isBonus ? 'text-primary' : 'text-zinc-500'}`} />
                          <span className={`${item.isBonus ? 'text-primary font-medium' : 'text-zinc-300'}`}>{item.name}</span>
                        </div>
                        <span className="text-zinc-500 text-sm font-heading whitespace-nowrap">{item.price}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-white/10 pt-6 mb-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 text-sm">Valor total individual:</span>
                      <span className="text-zinc-500 text-lg font-heading line-through">1.551 Bs</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white text-base font-medium">Precio Pack Completo:</span>
                      <span className="text-white text-2xl font-heading">999 Bs</span>
                    </div>
                    <div className="flex items-center justify-end">
                      <span className="text-primary/80 text-sm italic">
                        Ahorras 551 Bs
                      </span>
                    </div>
                  </div>

                  <p className="text-zinc-400 text-sm font-light mb-8 leading-relaxed">
                    El pack es la forma recomendada de vivir el proceso completo y sostener el cambio.
                  </p>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-primary/20 hover:bg-primary hover:text-black rounded-full px-8 py-6 text-xs uppercase tracking-widest transition-all"
                  >
                    <a
                      href="https://wa.me/59169703379?text=Hola,%20quiero%20reservar%20el%20pack%20completo%20PORTAL%20RESONANCIAL"
                      onClick={() => trackWhatsAppClick('pack_completo', 'pack_section', 99.9)}
                    >
                      Obtener Pack Completo
                    </a>
                  </Button>
                </FadeIn>
              </div>
            </div>
          </div>
        </div>
      </SectionFadeIn>
      {/* --- ALMANAQUE RITUAL RESONANCIAL SECTION --- */}
      <SectionFadeIn id="almanaque" className="py-16 md:py-24 relative bg-background border-t border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image Side */}
            <FadeIn className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl opacity-50" />
                <img
                  src={almanaqueImg}
                  alt="Almanaque Ritual Resonancial 2026"
                  width={600}
                  height={800}
                  loading="lazy"
                  className="relative w-full rounded-2xl shadow-2xl shadow-black/50 border border-white/10"
                />
              </div>
            </FadeIn>

            {/* Content Side */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <FadeIn>
                <span className="text-primary text-xs tracking-[0.3em] uppercase font-bold mb-4 block">Edición 2026</span>
                <h2 className="text-4xl md:text-5xl font-heading mb-4 leading-tight text-balance">
                  Almanaque Ritual<br/>
                  <span className="text-primary">Resonancial 2026™️</span>
                </h2>
                <p className="text-lg text-muted-foreground font-light max-w-xl mb-6">
                  Rituales personalizados para habitar el tiempo desde la conciencia
                </p>
                
                <div className="max-w-xl mb-8 space-y-1">
                  <p className="text-lg md:text-xl font-heading text-white/90 italic">
                    "El tiempo no se gestiona.
                  </p>
                  <p className="text-lg md:text-xl font-heading text-primary italic">
                    Se ritualiza, se habita y se sostiene."
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 max-w-lg mx-auto lg:mx-0 mb-8 text-left">
                  {[
                    "10 Estaciones Energéticas del 2026",
                    "Rituales claros para sostener tu frecuencia",
                    "Ritual de cumpleaños personalizado según tu signo",
                    "Uso flexible durante todo el año"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-white/80">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-primary/20 hover:bg-primary hover:text-black rounded-full px-8 py-6 text-xs uppercase tracking-widest transition-all"
                  >
                    <a
                      href="https://wa.me/59169703379?text=Hola,%20quiero%20mi%20Almanaque%20Ritual%20Resonancial%202026"
                      onClick={() => trackWhatsAppClick('almanaque_ritual', 'almanaque_section', 44.4)}
                    >
                      Quiero Mi Almanaque
                    </a>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleAlmanaqueModalOpen}
                    className="border-primary/20 hover:bg-primary hover:text-black rounded-full text-xs uppercase tracking-widest"
                  >
                    Ver detalles
                  </Button>
                </div>
                <span className="text-xs text-muted-foreground mt-4 block">Edición limitada · Producto anual · No es suscripción</span>
              </FadeIn>
            </div>
          </div>
        </div>
      </SectionFadeIn>
      {/* --- FAQ SECTION --- */}
      <FAQ />
      <Newsletter />
      </main>
      <Footer />
      <CourseModal 
        course={selectedCourse ? courseDetails[selectedCourse] : null}
        open={selectedCourse !== null}
        onClose={handleCloseModal}
      />
      <AlmanaqueModal
        open={almanaqueModalOpen}
        onClose={handleAlmanaqueModalClose}
      />
      <FounderModal
        open={founderModalOpen}
        onClose={handleFounderModalClose}
      />
    </div>
  );
}
