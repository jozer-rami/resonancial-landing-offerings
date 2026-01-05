import React, { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Calendar, Star, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Components ---

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const ServiceCard = ({ title, description, price, features, link, image, delay }: any) => {
  return (
    <FadeIn delay={delay} className="group relative h-full">
      <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl blur-md" />
      <div className="glass-card h-full rounded-xl overflow-hidden flex flex-col relative z-10">
        <div className="relative h-48 overflow-hidden">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        </div>
        
        <div className="p-8 flex flex-col flex-grow">
          <div className="mb-4">
            <h3 className="text-3xl text-primary mb-2 italic">{title}</h3>
            <div className="w-12 h-px bg-primary/50 mb-4" />
          </div>
          
          <p className="text-muted-foreground leading-relaxed mb-6 text-sm flex-grow">
            {description}
          </p>

          <div className="space-y-4">
            <div className="text-xl font-heading text-white">{price}</div>
            
            <a 
              href={link} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-primary hover:text-white transition-colors group/link"
            >
              <span>Reservar Sesión</span>
              <ArrowRight className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </FadeIn>
  );
};

export default function Home() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 selection:text-white">
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax */}
        <motion.div 
          style={{ y: y1 }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-black/40 z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background z-20" />
          <img 
            src="https://editorialverdadparavivir.my.canva.site/portal-resonancial-2026/_assets/media/1e4636f01fb53f80b0d9d66fc6885150.jpg" 
            alt="Portal Resonancial Background" 
            className="w-full h-full object-cover object-top opacity-80"
          />
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-30 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-6 flex justify-center"
          >
            {/* Abstract Logo Representation */}
            <div className="w-16 h-16 border border-primary/30 rounded-full flex items-center justify-center relative">
              <div className="absolute inset-0 border border-primary/10 rounded-full animate-ping opacity-20" />
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-6xl md:text-8xl lg:text-9xl font-heading tracking-tighter text-white mb-6 drop-shadow-2xl"
          >
            PORTAL <br />
            <span className="text-primary italic">RESONANCIAL</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed tracking-wide"
          >
            Un proceso de alineación energética para <br/>
            crear y habitar tu nuevo ciclo.
          </motion.p>
          
          <motion.div
            style={{ opacity }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40"
          >
            <span className="text-[10px] uppercase tracking-[0.2em]">Descubre</span>
            <div className="w-px h-12 bg-gradient-to-b from-white/0 via-white/40 to-white/0" />
          </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-4xl md:text-6xl font-heading mb-12 leading-tight">
              El 2026 no se planea. <br/>
              <span className="text-primary italic">Se sintoniza.</span>
            </h2>
          </FadeIn>
          
          <div className="grid md:grid-cols-2 gap-16 items-center mt-20 max-w-6xl mx-auto">
            <FadeIn delay={0.2} className="text-left space-y-6">
              <p className="text-xl text-muted-foreground font-light leading-relaxed">
                <span className="text-white">No puedes vibrar alto con cargas del pasado.</span>
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Antes de elevar tu frecuencia, es necesario vaciar el campo. Todo lo que no se libera (emociones, creencias, memorias) distorsiona la vibración desde la cual intentas crear.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                No se manifiesta desde el deseo mental. <br/>
                <span className="text-primary border-b border-primary/30 pb-1">Se manifiesta desde la frecuencia que habitas.</span>
              </p>
            </FadeIn>
            
            <FadeIn delay={0.4} className="relative aspect-[3/4] md:aspect-square overflow-hidden rounded-2xl group">
               <img 
                src="https://editorialverdadparavivir.my.canva.site/portal-resonancial-2026/_assets/media/213731e69c550df1d9974c08f25a2b27.png" 
                alt="Meditation"
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000"
               />
               <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl" />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-gradient-to-b from-background via-secondary/10 to-background">
        <div className="container mx-auto px-4">
          <FadeIn className="text-center mb-20">
            <span className="text-primary text-xs tracking-[0.3em] uppercase block mb-4">El Proceso</span>
            <h2 className="text-4xl md:text-5xl font-heading">Niveles de Alineación</h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <ServiceCard 
              title="Detox Frecuencial"
              description="Liberación de resistencias y limpieza energética. Experiencia de limpieza para soltar bloqueos, resistencias y cargas que impiden elevar tu frecuencia. Ideal si sientes fatiga vibracional o estancamiento."
              price="500 Bs"
              image="https://editorialverdadparavivir.my.canva.site/portal-resonancial-2026/_assets/media/59f810e40bddf72819eea349b624ba8a.jpg"
              link="https://wa.me/34640919319?text=Hola,%20quiero%20info%20del%20DETOX%202025"
              delay={0}
            />
            
            <ServiceCard 
              title="Reconfiguración"
              description="Ajuste profundo de tu vibración base. Activación diseñada para reordenar tu vibración base y entrenar a tu sistema a sostener nuevas frecuencias de coherencia sin volver al patrón anterior."
              price="500 Bs"
              image="https://editorialverdadparavivir.my.canva.site/portal-resonancial-2026/_assets/media/b59ee722c5940b56afb67f16129bc193.jpg"
              link="https://wa.me/34640919319?text=Hola,%20me%20interesa%20la%20sesi%C3%B3n%20de%20Reconfiguraci%C3%B3n%20de%20Frecuencia"
              delay={0.2}
            />
            
            <ServiceCard 
              title="Mapa Resonancial"
              description="Activación de la visión encarnada del 2026. Experiencia de alineación profunda donde mente, cuerpo y espíritu resuenan con la frecuencia de la realidad que deseas habitar. Primero vibra la realidad, luego créala."
              price="500 Bs"
              image="https://editorialverdadparavivir.my.canva.site/portal-resonancial-2026/_assets/media/3ee229cb1ae74fa5fb3a300db92832e9.jpg"
              link="https://wa.me/34640919319?text=Hola,%20quiero%20m%C3%A1s%20info%20sobre%20el%20Mapa%20Resonancial"
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Bundle Offer Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center bg-zinc-900/50 rounded-3xl p-8 md:p-12 border border-white/5 backdrop-blur-sm">
            
            <FadeIn>
               <div className="relative rounded-xl overflow-hidden aspect-[4/3] group">
                <img 
                  src="https://editorialverdadparavivir.my.canva.site/portal-resonancial-2026/_assets/media/470e2c29e4d7f74594fad0f8ab86ac2d.jpg" 
                  alt="Full Bundle" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <span className="bg-primary text-black px-4 py-1 text-xs font-bold uppercase tracking-wider rounded-full">
                    Oferta Estrella
                  </span>
                </div>
               </div>
            </FadeIn>

            <FadeIn delay={0.2} className="space-y-8">
              <div>
                <h3 className="text-4xl font-heading mb-4">Pack Completo</h3>
                <p className="text-muted-foreground font-light">
                  Si sientes que este inicio te resonó, el pack completo te acompaña a sostener y materializar el cambio.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  "Detox Frecuencial (Sesión 1:1)",
                  "Reconfiguración de Frecuencia (Sesión 1:1)",
                  "Mapa Resonancial (Sesión 1:1)",
                  "BONUS: Almanaque Ritual Resonancial"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base text-gray-300">{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Button 
                  asChild
                  className="bg-primary text-black hover:bg-primary/90 text-lg px-8 py-6 rounded-full font-heading tracking-wide"
                >
                  <a href="https://wa.me/34640919319?text=Hola,%20quiero%20reservar%20el%20pack%20completo%20PORTAL%20RESONANCIAL">
                    Obtener Proceso Completo
                  </a>
                </Button>
              </div>
            </FadeIn>

          </div>
        </div>
      </section>

      {/* Meditation Challenge Section */}
      <section className="py-24 bg-black relative">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-background to-background" />
         
         <div className="container mx-auto px-4 relative z-10">
           <FadeIn className="max-w-4xl mx-auto text-center space-y-8">
             <div className="inline-flex items-center gap-2 text-primary/80 border border-primary/20 px-4 py-2 rounded-full text-sm">
                <Calendar className="w-4 h-4" />
                <span>Inicio: 10 de Enero</span>
             </div>

             <h2 className="text-5xl md:text-7xl font-heading">
               Reto Sintoniza <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary opacity-90">
                 Tu 2026
               </span>
             </h2>

             <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
               Ciclo de 21 días de meditaciones en vivo + grabadas. <br/>
               Acompañamiento diario para sostener tu nueva frecuencia.
             </p>

             <div className="grid grid-cols-2 gap-4 max-w-md mx-auto py-8">
                <div className="glass p-6 rounded-2xl text-center">
                  <div className="text-3xl font-heading text-white mb-2">250 Bs</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest">Individual</div>
                </div>
                <div className="glass p-6 rounded-2xl text-center border-primary/30 relative overflow-hidden">
                  <div className="absolute -right-12 -top-12 w-24 h-24 bg-primary/20 blur-2xl" />
                  <div className="text-3xl font-heading text-primary mb-2">400 Bs</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest">Dúo (2 pax)</div>
                </div>
             </div>

             <Button 
                variant="outline"
                asChild
                className="border-primary/50 text-primary hover:bg-primary hover:text-black text-lg px-8 py-6 rounded-full font-heading tracking-wide transition-all duration-300"
              >
                <a href="https://wa.me/34640919319?text=Hola,%20quiero%20unirme%20al%20reto%20Sintoniza%20tu%202026">
                  Unirme al Reto
                </a>
              </Button>
           </FadeIn>
         </div>
      </section>

      {/* Footer / Contact */}
      <footer className="py-20 border-t border-white/5 bg-black text-center">
        <div className="container mx-auto px-4 space-y-8">
           <FadeIn>
              <h3 className="text-2xl font-heading mb-6">¿Tienes dudas sobre qué proceso es para ti?</h3>
              <p className="text-muted-foreground mb-8 font-light">
                Todas las sesiones 1:1 están disponibles como Gift Card digital para regalar.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                 <a 
                   href="https://wa.me/34640919319?text=Hola,%20tengo%20una%20duda%20sobre%20el%20Portal%20Resonancial" 
                   className="text-sm uppercase tracking-widest hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-1"
                 >
                   Hablar por WhatsApp
                 </a>
                 <span className="hidden sm:inline text-muted-foreground/30">•</span>
                 <a 
                   href="https://wa.me/34640919319?text=Hola,%20quiero%20regalar%20una%20Gift%20Card" 
                   className="text-sm uppercase tracking-widest hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-1"
                 >
                   Ordenar Gift Cards
                 </a>
              </div>
           </FadeIn>

           <div className="pt-20 text-xs text-white/20">
             <p>© 2026 Portal Resonancial. All rights reserved.</p>
           </div>
        </div>
      </footer>

    </div>
  );
}
