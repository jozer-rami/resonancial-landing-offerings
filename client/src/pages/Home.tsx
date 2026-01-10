import React, { useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Newsletter } from "@/components/Newsletter";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import logoResonancial from "@assets/logo_resonancial_blanco.png";
import logoSymbol from "@assets/logo_1767647555211.png";

import logo_resonancial_blanco from "@assets/logo_resonancial_blanco.png";

// --- Course Data ---
const courseDetails = {
  detox: {
    title: "Detox Frecuencial",
    subtitle: "Liberación",
    tagline: "Liberación de resistencias y limpieza del campo energético",
    purpose: "Antes de elevar tu frecuencia, es necesario vaciar el campo. Todo lo que no se libera —emociones, creencias, memorias— distorsiona la vibración desde la cual intentas crear. Detox Frecuencial es una activación profunda diseñada para soltar cargas que impiden sostener frecuencias más altas.",
    works: ["Resistencias conscientes e inconscientes", "Cargas emocionales acumuladas", "Bloqueos energéticos y patrones repetitivos", "Fatiga vibracional y sensación de estancamiento"],
    activates: ["Limpieza del campo energético", "Sensación de ligereza y claridad", "Mayor disponibilidad interna para el cambio", "Preparación real para la reconfiguración"],
    experience: ["Lectura del estado frecuencial actual", "Identificación de resistencias activas", "Limpieza energética guiada", "Liberación frecuencial consciente", "Cierre e integración"],
    quote: "No puedes vibrar alto con cargas del pasado.",
    whatsapp: "https://wa.me/34640919319?text=Hola,%20quiero%20reservar%20DETOX%20FRECUENCIAL",
    image: "https://editorialverdadparavivir.my.canva.site/portal-resonancial-2026/_assets/media/59f810e40bddf72819eea349b624ba8a.jpg"
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
    image: "https://editorialverdadparavivir.my.canva.site/portal-resonancial-2026/_assets/media/b59ee722c5940b56afb67f16129bc193.jpg"
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
    image: "https://editorialverdadparavivir.my.canva.site/portal-resonancial-2026/_assets/media/3ee229cb1ae74fa5fb3a300db92832e9.jpg"
  }
};

// --- Reusable Components ---

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const SectionTransition = ({ variant = "default" }: { variant?: "default" | "dark" | "light" }) => {
  const gradients = {
    default: "from-transparent via-zinc-900/30 to-transparent",
    dark: "from-background via-zinc-950 to-background",
    light: "from-zinc-900/20 via-zinc-800/10 to-zinc-900/20"
  };
  return (
    <div className={`h-16 md:h-20 bg-gradient-to-b ${gradients[variant]} relative`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.02] to-transparent" />
    </div>
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
  const yHero = useTransform(scrollY, [0, 500], [0, 150]);
  const opacityHero = useTransform(scrollY, [0, 300], [1, 0]);
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
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-black/60 z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background z-20" />
          <img 
            src="https://editorialverdadparavivir.my.canva.site/portal-resonancial-2026/_assets/media/1e4636f01fb53f80b0d9d66fc6885150.jpg" 
            alt="Portal Resonancial Background" 
            className="w-full h-full object-cover object-center"
          />
        </motion.div>

        {/* Hero Content - Clean & Centered */}
        <div className="relative z-30 container mx-auto px-4 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex flex-col items-center gap-8"
          >
            {/* Symbol */}
            <div className="w-24 h-24 relative flex items-center justify-center">
              <div className="absolute inset-0 border border-primary/20 rounded-full animate-[ping_3s_ease-in-out_infinite] opacity-30" />
              <img src={logoSymbol} alt="Símbolo" className="w-full h-full object-contain p-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
            </div>

            {/* Main Logo Text */}
            <div className="w-full max-w-lg mx-auto">
               <img 
                 src={logo_resonancial_blanco} 
                 alt="Terapia Resonancial" 
                 className="w-full h-auto"
               />
            </div>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed max-w-2xl mx-auto">
              Un proceso de alineación energética para <br className="hidden md:block" />
              crear y habitar tu nuevo ciclo.
            </p>

            
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            style={{ opacity: opacityHero }}
            className="absolute -bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
          >
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">Descubre</span>
            <div className="w-px h-16 bg-gradient-to-b from-primary/0 via-primary/50 to-primary/0" />
          </motion.div>
        </div>
      </section>
      
      <SectionTransition variant="dark" />
      
      {/* --- PHILOSOPHY SECTION (Trust/About) --- */}
      <section id="filosofia" className="py-20 md:py-28 bg-background relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="max-w-4xl mx-auto text-center">
            <FadeIn>
              <h2 className="text-4xl md:text-6xl font-heading leading-tight mb-6 md:mb-8">
                El 2026 no se planea. <br/>
                <span className="text-primary italic">Se sintoniza.</span>
              </h2>
              <div className="space-y-5 text-base md:text-lg text-muted-foreground font-light leading-relaxed">
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
      </section>
      
      <SectionTransition variant="light" />
      
      {/* --- COURSES SECTION (Grid Layout) --- */}
      <section id="servicios" className="py-16 md:py-24 bg-zinc-900/20">
        <div className="container mx-auto px-4 max-w-7xl">
          <FadeIn className="text-center mb-12 md:mb-16 max-w-2xl mx-auto">
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
              image="https://editorialverdadparavivir.my.canva.site/portal-resonancial-2026/_assets/media/59f810e40bddf72819eea349b624ba8a.jpg"
              courseKey="detox"
              onOpenModal={handleOpenModal}
              delay={0}
            />
            
            <CourseCard 
              title="Reconfiguración"
              subtitle="Estabilidad"
              description="Ajuste profundo de tu vibración base. Activación diseñada para reordenar tu sistema y entrenarlo a sostener nuevas frecuencias de coherencia."
              price="500 Bs"
              image="https://editorialverdadparavivir.my.canva.site/portal-resonancial-2026/_assets/media/b59ee722c5940b56afb67f16129bc193.jpg"
              courseKey="reconfiguracion"
              onOpenModal={handleOpenModal}
              delay={0.1}
            />
            
            <CourseCard 
              title="Mapa Resonancial"
              subtitle="Visión Encarnada"
              description="Activación de la visión encarnada del 2026. Alineación profunda donde mente, cuerpo y espíritu resuenan con la realidad que deseas habitar."
              price="500 Bs"
              image="https://editorialverdadparavivir.my.canva.site/portal-resonancial-2026/_assets/media/3ee229cb1ae74fa5fb3a300db92832e9.jpg"
              courseKey="mapa"
              onOpenModal={handleOpenModal}
              delay={0.2}
            />
          </div>
        </div>
      </section>
      
      <SectionTransition variant="default" />
      
      {/* --- FEATURED BUNDLE (Split Layout) --- */}
      <section id="pack" className="py-16 md:py-24 bg-zinc-950 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
            <div className="grid lg:grid-cols-2">
              {/* Image Side */}
              <div className="relative min-h-[400px] lg:h-full">
                <img 
                  src="https://editorialverdadparavivir.my.canva.site/portal-resonancial-2026/_assets/media/470e2c29e4d7f74594fad0f8ab86ac2d.jpg" 
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
      </section>
      
      <SectionTransition variant="dark" />
      
      {/* --- CHALLENGE SECTION (Clean Dark) --- */}
      <section id="reto" className="py-16 md:py-24 relative bg-background">
         <div className="container mx-auto px-4 max-w-4xl text-center">
           <FadeIn>
             <div className="inline-flex items-center gap-2 text-primary border border-primary/20 px-6 py-2 rounded-full text-sm mb-8 bg-primary/5">
                <Calendar className="w-4 h-4" />
                <span>Inicio: 10 de Enero</span>
             </div>

             <h2 className="text-5xl md:text-7xl font-heading mb-6">
               Reto Sintoniza <br/>
               <span className="text-zinc-500">Tu 2026</span>
             </h2>

             <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto mb-12">
               Ciclo de 21 días de meditaciones en vivo + grabadas. <br/>
               Acompañamiento diario para sostener tu nueva frecuencia.
             </p>

             <div className="grid sm:grid-cols-2 gap-6 max-w-xl mx-auto mb-12">
                <div className="bg-zinc-900/50 p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="text-4xl font-heading text-white mb-2">250 Bs</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest">Individual</div>
                </div>
                <div className="bg-zinc-900/50 p-8 rounded-2xl border border-primary/30 relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 w-20 h-20 bg-primary/20 blur-2xl" />
                  <div className="text-4xl font-heading text-primary mb-2">400 Bs</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest">Dúo (2 pax)</div>
                </div>
             </div>

             <Button 
                asChild
                className="bg-transparent border border-white/20 text-white hover:bg-white hover:text-black rounded-full px-10 py-6 text-lg transition-all"
              >
                <a href="https://wa.me/34640919319?text=Hola,%20quiero%20unirme%20al%20reto%20Sintoniza%20tu%202026">
                  Unirme al Reto
                </a>
              </Button>
           </FadeIn>
         </div>
      </section>
      
      <SectionTransition variant="light" />
      
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
