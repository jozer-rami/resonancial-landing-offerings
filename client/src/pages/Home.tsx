import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Newsletter } from "@/components/Newsletter";
import logoResonancial from "@assets/logo_resonancial_1767647021538.png";
import logoSymbol from "@assets/logo_1767647555211.png";

// --- Reusable Components ---

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const CourseCard = ({ title, subtitle, description, price, image, link, delay }: any) => {
  return (
    <FadeIn delay={delay} className="group h-full">
      <div className="h-full bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col">
        {/* Image Area */}
        <div className="relative h-64 overflow-hidden">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </div>
        
        {/* Content Area */}
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
            <Button asChild variant="outline" className="border-primary/20 hover:bg-primary hover:text-black rounded-full text-xs uppercase tracking-widest">
              <a href={link} target="_blank" rel="noreferrer">
                Reservar
              </a>
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
                 src={logoResonancial} 
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
      {/* --- PHILOSOPHY SECTION (Trust/About) --- */}
      <section id="filosofia" className="py-32 bg-background relative border-t border-white/5">
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
      </section>
      {/* --- COURSES SECTION (Grid Layout) --- */}
      <section id="servicios" className="py-32 bg-zinc-900/20">
        <div className="container mx-auto px-4 max-w-7xl">
          <FadeIn className="text-center mb-20 max-w-2xl mx-auto">
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
              link="https://wa.me/34640919319?text=Hola,%20quiero%20info%20del%20DETOX%202025"
              delay={0}
            />
            
            <CourseCard 
              title="Reconfiguración"
              subtitle="Estabilidad"
              description="Ajuste profundo de tu vibración base. Activación diseñada para reordenar tu sistema y entrenarlo a sostener nuevas frecuencias de coherencia."
              price="500 Bs"
              image="https://editorialverdadparavivir.my.canva.site/portal-resonancial-2026/_assets/media/b59ee722c5940b56afb67f16129bc193.jpg"
              link="https://wa.me/34640919319?text=Hola,%20me%20interesa%20la%20sesi%C3%B3n%20de%20Reconfiguraci%C3%B3n%20de%20Frecuencia"
              delay={0.1}
            />
            
            <CourseCard 
              title="Mapa Resonancial"
              subtitle="Visión Encarnada"
              description="Activación de la visión encarnada del 2026. Alineación profunda donde mente, cuerpo y espíritu resuenan con la realidad que deseas habitar."
              price="500 Bs"
              image="https://editorialverdadparavivir.my.canva.site/portal-resonancial-2026/_assets/media/3ee229cb1ae74fa5fb3a300db92832e9.jpg"
              link="https://wa.me/34640919319?text=Hola,%20quiero%20m%C3%A1s%20info%20sobre%20el%20Mapa%20Resonancial"
              delay={0.2}
            />
          </div>
        </div>
      </section>
      {/* --- FEATURED BUNDLE (Split Layout) --- */}
      <section id="pack" className="py-32 bg-zinc-950 relative overflow-hidden">
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
                  <h3 className="text-4xl font-heading mb-6 text-white">Pack Completo</h3>
                  <p className="text-muted-foreground font-light mb-8 text-lg">
                    Si sientes que este inicio te resonó, el pack completo te acompaña a sostener y materializar el cambio profundo.
                  </p>

                  <ul className="space-y-4 mb-10">
                    {[
                      "Detox Frecuencial (Sesión 1:1)",
                      "Reconfiguración de Frecuencia (Sesión 1:1)",
                      "Mapa Resonancial (Sesión 1:1)",
                      "BONUS: Almanaque Ritual Resonancial"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-zinc-300">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    asChild
                    size="lg"
                    className="w-full sm:w-auto bg-white text-black hover:bg-primary hover:text-black rounded-full px-8 py-6 text-base font-bold tracking-wide transition-all"
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
      {/* --- CHALLENGE SECTION (Clean Dark) --- */}
      <section id="reto" className="py-32 relative bg-background border-t border-white/5">
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
      <Newsletter />
      <Footer />
    </div>
  );
}
