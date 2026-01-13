import React, { useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2, Calendar, X, ChevronDown, Book, Moon, Star, Users, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Newsletter } from "@/components/Newsletter";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import logoResonancial from "@assets/logo_resonancial_blanco.png";
import logoSymbol from "@assets/logo_1767647555211.png";
import logo_resonancial_blanco from "@assets/logo_resonancial_blanco.png";
import detoxGif from "@assets/WhatsApp_GIF_2026-01-10_at_21.24.34_1768095023047.gif";
import reconfiguracionGif from "@assets/WhatsApp_GIF_2026-01-10_at_21.26.27_1768148954010.gif";
import mapaGif from "@assets/WhatsApp_GIF_2026-01-10_at_21.28.35_1768149189535.gif";
import detoxModalImg from "@assets/WhatsApp_Image_2026-01-11_at_12.37.51_1768149598199.jpeg";
import reconfigModalImg from "@assets/WhatsApp_Image_2026-01-11_at_12.37.51_(1)_1768149609721.jpeg";
import mapaModalImg from "@assets/WhatsApp_Image_2026-01-11_at_12.37.51_(2)_1768149615012.jpeg";

import WhatsApp_GIF_2026_01_10_at_21_24_51 from "@assets/WhatsApp GIF 2026-01-10 at 21.24.51.gif";

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
    whatsapp: "https://wa.me/34640919319?text=Hola,%20quiero%20reservar%20DETOX%20FRECUENCIAL",
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
    whatsapp: "https://wa.me/34640919319?text=Hola,%20quiero%20reservar%20RECONFIGURACIÓN%20FRECUENCIAL",
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
    whatsapp: "https://wa.me/34640919319?text=Hola,%20quiero%20reservar%20MAPA%20RESONANCIAL",
    image: mapaModalImg
  }
};

// --- Reusable Components ---

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
};

const SectionFadeIn = ({ children, className = "", id }: { children: React.ReactNode, className?: string, id?: string }) => {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.section>
  );
};

const CourseModal = ({ course, open, onClose }: { course: typeof courseDetails.detox | null, open: boolean, onClose: () => void }) => {
  if (!course) return null;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-zinc-950 border-white/10 p-0">
        <div className="relative">
          <div className="h-48 md:h-64 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950 z-10" />
            <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
          </div>
          
          <DialogClose className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
            <X className="w-5 h-5" />
          </DialogClose>
          
          <div className="p-8 md:p-12 -mt-12 relative z-20">
            <span className="text-xs uppercase tracking-[0.3em] text-primary mb-3 block">{course.subtitle}</span>
            <h2 className="text-3xl md:text-4xl font-heading text-white mb-2">{course.title}</h2>
            <p className="text-muted-foreground font-light mb-8">{course.tagline}</p>
            
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
                  <span className="text-3xl font-heading text-white">500 Bs</span>
                  <span className="text-lg font-heading text-muted-foreground">50 USD</span>
                </div>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-primary/20 hover:bg-primary hover:text-black rounded-full px-10 py-6 text-xs uppercase tracking-widest transition-all">
                  <a href={course.whatsapp} target="_blank" rel="noreferrer">
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
};

const CourseCard = ({ title, subtitle, description, price, image, courseKey, delay, onOpenModal }: any) => {
  return (
    <FadeIn delay={delay} className="group h-full">
      <div className="h-full bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col">
        <div className="relative h-64 overflow-hidden">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
          <img 
            src={image} 
            alt={title} 
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
              <span className="text-sm font-heading text-muted-foreground">50 USD</span>
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
};

export default function Home() {
  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 800], [0, 400]);
  const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);
  const heroContentY = useTransform(scrollY, [0, 400], [0, -60]);
  const gradientOpacity = useTransform(scrollY, [0, 500], [0.6, 1]);
  const [selectedCourse, setSelectedCourse] = useState<keyof typeof courseDetails | null>(null);

  const handleOpenModal = (courseKey: keyof typeof courseDetails) => {
    setSelectedCourse(courseKey);
  };

  const handleCloseModal = () => {
    setSelectedCourse(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 selection:text-white">
      <Navbar />
      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Parallax Background */}
        <motion.div 
          style={{ y: yHero }}
          className="absolute inset-0 z-0 will-change-transform"
        >
          <img 
            src="https://editorialverdadparavivir.my.canva.site/portal-resonancial-2026/_assets/media/1e4636f01fb53f80b0d9d66fc6885150.jpg" 
            alt="Portal Resonancial Background" 
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
              <div className="absolute inset-0 border border-primary/20 rounded-full animate-[ping_3s_ease-in-out_infinite] opacity-30" />
              <img src={logoSymbol} alt="Símbolo" className="w-full h-full object-contain p-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
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
              <h2 className="text-5xl md:text-6xl font-heading leading-tight mb-8">
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
      {/* --- COURSES SECTION (Grid Layout) --- */}
      <SectionFadeIn id="servicios" className="py-12 md:py-16 bg-zinc-900/20">
        <div className="container mx-auto px-4 max-w-7xl">
          <FadeIn className="text-center mb-10 max-w-2xl mx-auto">
            <span className="text-primary text-sm tracking-[0.3em] uppercase font-bold mb-4 block">las tres activaciones para cruzar el 2026</span>
            <h2 className="text-4xl md:text-5xl font-heading mb-6">Portal Resonancial</h2>
            <p className="text-muted-foreground font-light">
              Explora nuestras sesiones diseñadas para limpiar, reconfigurar y proyectar tu energía hacia el nuevo ciclo.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            <CourseCard 
              title="Detox Frecuencial"
              subtitle="Liberación"
              description="Liberación de resistencias y limpieza energética. Experiencia para soltar bloqueos y cargas que impiden elevar tu frecuencia. Ideal si sientes fatiga vibracional."
              price="500 Bs"
              image={detoxGif}
              courseKey="detox"
              onOpenModal={handleOpenModal}
              delay={0}
            />
            
            <CourseCard 
              title="Reconfiguración"
              subtitle="Estabilidad"
              description="Ajuste profundo de tu vibración base. Activación diseñada para reordenar tu sistema y entrenarlo a sostener nuevas frecuencias de coherencia."
              price="500 Bs"
              image={reconfiguracionGif}
              courseKey="reconfiguracion"
              onOpenModal={handleOpenModal}
              delay={0.1}
            />
            
            <CourseCard 
              title="Mapa Resonancial"
              subtitle="Visión Encarnada"
              description="Activación de la visión encarnada del 2026. Alineación profunda donde mente, cuerpo y espíritu resuenan con la realidad que deseas habitar."
              price="500 Bs"
              image={mapaGif}
              courseKey="mapa"
              onOpenModal={handleOpenModal}
              delay={0.2}
            />
          </div>
        </div>
      </SectionFadeIn>
      {/* --- FEATURED BUNDLE (Split Layout) --- */}
      <SectionFadeIn id="pack" className="py-12 md:py-16 bg-zinc-950 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
            <div className="grid lg:grid-cols-2">
              {/* Image Side */}
              <div className="relative min-h-[400px] lg:h-full">
                <img 
                  src={WhatsApp_GIF_2026_01_10_at_21_24_51} 
                  alt="Pack Completo" 
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
                      { name: "Detox Frecuencial (Sesión 1:1)", price: "500 Bs" },
                      { name: "Reconfiguración de Frecuencia (Sesión 1:1)", price: "500 Bs" },
                      { name: "Mapa Resonancial (Sesión 1:1)", price: "500 Bs" },
                      { name: "BONUS: Almanaque Ritual Resonancial", price: "200 Bs", isBonus: true }
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
                      <span className="text-zinc-500 text-lg font-heading line-through">1.700 Bs</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white text-base font-medium">Precio Pack Completo:</span>
                      <span className="text-white text-2xl font-heading">1.200 Bs</span>
                    </div>
                    <div className="flex items-center justify-end">
                      <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium border border-primary/20">
                        Ahorras 500 Bs
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
                    <a href="https://wa.me/34640919319?text=Hola,%20quiero%20reservar%20el%20pack%20completo%20PORTAL%20RESONANCIAL">
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
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <FadeIn>
              <span className="text-primary text-xs tracking-[0.3em] uppercase font-bold mb-6 block">Edición 2026</span>
              <h2 className="text-4xl md:text-6xl font-heading mb-4 leading-tight">
                Almanaque Ritual<br/>
                <span className="text-primary">Resonancial 2026™️</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl mx-auto mb-8">
                Rituales personalizados para habitar el tiempo desde la conciencia
              </p>
              
              <div className="max-w-xl mx-auto mb-10 space-y-2">
                <p className="text-xl md:text-2xl font-heading text-white/90 italic">
                  "El tiempo no se gestiona.
                </p>
                <p className="text-xl md:text-2xl font-heading text-primary italic">
                  Se ritualiza, se habita y se sostiene."
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-10 text-left">
                {[
                  "10 Estaciones Energéticas del 2026",
                  "Rituales claros para sostener tu frecuencia",
                  "Ritual de cumpleaños personalizado según tu signo",
                  "Uso flexible durante todo el año"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-white/80">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center gap-4">
                <Button 
                  asChild
                  size="lg"
                  className="bg-primary text-black hover:bg-primary/90 rounded-full px-10 py-6 text-xs uppercase tracking-widest font-bold transition-all shadow-lg shadow-primary/20"
                >
                  <a href="https://wa.me/34640919319?text=Hola,%20quiero%20mi%20Almanaque%20Ritual%20Resonancial%202026">
                    Quiero Mi Almanaque 2026
                  </a>
                </Button>
                <span className="text-xs text-muted-foreground">Edición limitada · Producto anual · No es suscripción</span>
                
                <button 
                  onClick={() => document.getElementById('almanaque-details')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-2 text-sm text-primary/80 hover:text-primary transition-colors mt-4"
                >
                  Quiero saber más
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </FadeIn>
          </div>

          {/* Expanded Content */}
          <div id="almanaque-details" className="space-y-6 pt-8">
            {/* ¿Qué es este almanaque? */}
            <FadeIn delay={0.1}>
              <div className="bg-zinc-900/30 rounded-2xl p-6 md:p-8 border border-white/5">
                <h3 className="text-lg font-heading text-primary mb-4">¿Qué es este Almanaque?</h3>
                <p className="text-white/70 font-light leading-relaxed">
                  El Almanaque Ritual Resonancial 2026™️ es un objeto ritual anual diseñado para acompañarte energéticamente durante todo el año. No organiza fechas. <span className="text-primary">Organiza tu energía en el tiempo.</span>
                </p>
              </div>
            </FadeIn>

            {/* ¿Por qué no funcionan los planners? */}
            <FadeIn delay={0.15}>
              <div className="bg-zinc-900/30 rounded-2xl p-6 md:p-8 border border-white/5">
                <h3 className="text-lg font-heading text-primary mb-4">¿Por qué no funcionan los planners comunes?</h3>
                <ul className="space-y-3 mb-4">
                  {[
                    "Porque trabajan la mente, no el campo energético",
                    "Porque exigen constancia en lugar de conciencia",
                    "Porque no acompañan los momentos de quiebre"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/70 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-primary/80 italic">Este Almanaque responde a momentos internos, no a obligaciones externas.</p>
              </div>
            </FadeIn>

            {/* ¿Qué lo hace diferente? */}
            <FadeIn delay={0.2}>
              <div className="bg-primary/5 rounded-2xl p-6 md:p-8 border border-primary/10">
                <h3 className="text-lg font-heading text-primary mb-4">¿Qué lo hace diferente?</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    "10 Estaciones Energéticas",
                    "Rituales paso a paso",
                    "Uso no lineal",
                    "Ritual de cumpleaños personalizado por signo",
                    "Rituales lunares esenciales",
                    "Portales energéticos clave del 2026"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm text-white/80">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Las 10 Estaciones */}
            <FadeIn delay={0.25}>
              <div className="bg-zinc-900/30 rounded-2xl p-6 md:p-8 border border-white/5">
                <h3 className="text-lg font-heading text-primary mb-4">Las 10 Estaciones Energéticas</h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {[
                    "Estación de Sintonización",
                    "Estación de Enraizamiento",
                    "Estación de Activación del Deseo",
                    "Estación de Expansión",
                    "Estación de Cosecha",
                    "Estación de Integración",
                    "Estación de Transmutación",
                    "Estación de Renovación",
                    "Estación de Manifestación",
                    "Estación de Cierre y Sellado"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-white/60">
                      <span className="text-primary/60 text-xs">{String(i + 1).padStart(2, '0')}</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Ritual de Cumpleaños */}
            <FadeIn delay={0.3}>
              <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-2xl p-6 md:p-8 border border-primary/20 relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <Star className="w-6 h-6 text-primary/40" />
                </div>
                <h3 className="text-lg font-heading text-primary mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Ritual de Cumpleaños Personalizado
                </h3>
                <p className="text-white/70 font-light leading-relaxed">
                  Tu cumpleaños es el portal energético más importante del año. Recibirás un ritual diseñado según tu signo solar, alineado a tu elemento y energía natal. <span className="text-primary">Este ritual es único y no se repite.</span>
                </p>
              </div>
            </FadeIn>

            {/* Rituales Lunares */}
            <FadeIn delay={0.35}>
              <div className="bg-zinc-900/30 rounded-2xl p-6 md:p-8 border border-white/5">
                <h3 className="text-lg font-heading text-primary mb-4 flex items-center gap-2">
                  <Moon className="w-5 h-5" />
                  Rituales Lunares
                </h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { phase: "Luna Nueva", action: "siembra" },
                    { phase: "Luna Llena", action: "revelación" },
                    { phase: "Luna Menguante", action: "liberación" }
                  ].map((item, i) => (
                    <div key={i} className="text-center p-4 bg-white/5 rounded-xl">
                      <div className="text-sm text-white/80 mb-1">{item.phase}</div>
                      <div className="text-xs text-primary/70">{item.action}</div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* ¿Qué incluye? */}
            <FadeIn delay={0.4}>
              <div className="bg-zinc-900/30 rounded-2xl p-6 md:p-8 border border-white/5">
                <h3 className="text-lg font-heading text-primary mb-4 flex items-center gap-2">
                  <Book className="w-5 h-5" />
                  ¿Qué incluye exactamente?
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { icon: "📘", text: "Almanaque Ritual Resonancial 2026™️" },
                    { icon: "🔹", text: "Guía de uso" },
                    { icon: "🔹", text: "10 Estaciones Energéticas" },
                    { icon: "🔹", text: "Rituales escritos" },
                    { icon: "🔹", text: "Rituales lunares" },
                    { icon: "🔹", text: "Ritual de cumpleaños personalizado" },
                    { icon: "🔹", text: "Portales energéticos 2026" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-white/70">
                      <span>{item.icon}</span>
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Para quién es / No es */}
            <FadeIn delay={0.45}>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-zinc-900/30 rounded-2xl p-6 border border-white/5">
                  <h3 className="text-base font-heading text-primary mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Para quién es
                  </h3>
                  <ul className="space-y-2">
                    {[
                      "Personas conscientes",
                      "Quienes ya hicieron trabajo personal",
                      "Buscan sostén energético real"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-zinc-900/30 rounded-2xl p-6 border border-white/5">
                  <h3 className="text-base font-heading text-zinc-400 mb-4 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    No es para
                  </h3>
                  <ul className="space-y-2">
                    {[
                      "Quienes buscan predicciones",
                      "Consumo pasivo sin acción"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-white/50">
                        <X className="w-4 h-4 text-zinc-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </FadeIn>

            {/* Inversión */}
            <FadeIn delay={0.5}>
              <div className="bg-zinc-900/50 rounded-2xl p-8 border border-primary/20 text-center">
                <h3 className="text-lg font-heading text-primary mb-2">Formato · Inversión · Entrega</h3>
                <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm text-white/60">
                  <span>Formato: Digital</span>
                  <span className="text-primary/40">·</span>
                  <span>Personalización incluida</span>
                </div>
                <div className="text-4xl font-heading text-white mb-2">200 Bs</div>
                <div className="text-lg font-heading text-muted-foreground mb-6">20 USD</div>
                <Button 
                  asChild
                  size="lg"
                  className="bg-primary text-black hover:bg-primary/90 rounded-full px-10 py-6 text-xs uppercase tracking-widest font-bold transition-all shadow-lg shadow-primary/20"
                >
                  <a href="https://wa.me/34640919319?text=Hola,%20quiero%20mi%20Almanaque%20Ritual%20Resonancial%20Personalizado%202026">
                    Quiero Mi Almanaque Personalizado
                  </a>
                </Button>
              </div>
            </FadeIn>

            {/* Cierre Emocional */}
            <FadeIn delay={0.55}>
              <div className="text-center py-8">
                <p className="text-xl md:text-2xl font-heading text-white/80 italic leading-relaxed">
                  "El tiempo va a pasar igual.<br/>
                  <span className="text-primary">La diferencia es desde qué frecuencia lo atraviesas."</span>
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </SectionFadeIn>
      <Newsletter />
      <Footer />
      <CourseModal 
        course={selectedCourse ? courseDetails[selectedCourse] : null}
        open={selectedCourse !== null}
        onClose={handleCloseModal}
      />
    </div>
  );
}
