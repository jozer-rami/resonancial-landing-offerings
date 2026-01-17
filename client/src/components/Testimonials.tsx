import { useState, memo, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, MapPin } from "lucide-react";

// Country flag mapping
const countryFlags: Record<string, string> = {
  BO: "🇧🇴",
  DE: "🇩🇪",
  US: "🇺🇸",
  ES: "🇪🇸",
  MX: "🇲🇽",
  AR: "🇦🇷",
  CO: "🇨🇴",
  CL: "🇨🇱",
  PE: "🇵🇪",
};

interface Testimonial {
  id: string;
  nombre: string;
  ubicacion: string;
  pais: string;
  curso: string;
  cursoSlug: string;
  texto: string;
  textoCorto: string;
  destacado: boolean;
  fecha: string;
}

// Testimonials data
const testimonios: Testimonial[] = [
  {
    id: "lorena-bremen",
    nombre: "Lorena",
    ubicacion: "Bremen, Alemania",
    pais: "DE",
    curso: "Coaching Holístico",
    cursoSlug: "coaching-holistico",
    texto: "Mi experiencia en coaching holístico fue extra-ordinaria. Digo extraordinaria porque las herramientas que uno aprende y las muchas enseñanzas transmitidas por las coaches te obligan a salir de lo ordinario, de la vida común. Dar un pie más cercano a la vida que deseabas. La única manera es mirar dentro, y el equipo de profesionales junto a los compañeros que uno conoce en el taller hacen de esta experiencia una memoria inolvidable, valiosa y enfocada en el crecimiento y el amor. Muy agradecida con todos los que me acompañaron en este viaje y nada más que recomendarlo.",
    textoCorto: "Las herramientas que uno aprende te obligan a salir de lo ordinario, de la vida común.",
    destacado: true,
    fecha: "2025"
  },
  {
    id: "karin-lapaz",
    nombre: "Karin",
    ubicacion: "La Paz, Bolivia",
    pais: "BO",
    curso: "Coaching Holístico",
    cursoSlug: "coaching-holistico",
    texto: "La terapia resonancial, me permitió fortalecer un camino amoroso hacia lo más profundo de mi alma, abrazando con amor mi luz y mi sombra, abrazando con amor las diferencias, reconociéndome en todo y en todos y reconociendo a todo y todos en mí.",
    textoCorto: "Me permitió fortalecer un camino amoroso hacia lo más profundo de mi alma.",
    destacado: false,
    fecha: "2025"
  },
  {
    id: "ilse-lapaz",
    nombre: "Ilse",
    ubicacion: "La Paz, Bolivia",
    pais: "BO",
    curso: "Coaching Holístico",
    cursoSlug: "coaching-holistico",
    texto: "Realizar el curso de Coaching Holístico no sólo es una gran oportunidad para crecer profesionalmente sino y sobre todo como ser humano reconociendo el poder interno en una combinación perfecta con el todo basada en el amor hacia uno mismo y los otros.",
    textoCorto: "Una gran oportunidad para crecer profesionalmente y como ser humano.",
    destacado: false,
    fecha: "2025"
  },
  {
    id: "alvaro-houston",
    nombre: "Alvaro",
    ubicacion: "Houston, USA",
    pais: "US",
    curso: "Coaching Holístico",
    cursoSlug: "coaching-holistico",
    texto: "Una experiencia maravillosa, fue una expedición hacia nuestro interior y aprender a conectar con nuestro Centro Corazón, de donde podemos cambiar nuestra vida y ayudar a cambiar la vida de otros. Gracias por el acompañamiento y por ayudarme a descubrir la capacidad de ser un encendedor de luz.",
    textoCorto: "Una expedición hacia nuestro interior para conectar con nuestro Centro Corazón.",
    destacado: false,
    fecha: "2025"
  },
  {
    id: "silvia-cochabamba",
    nombre: "Silvia",
    ubicacion: "Cochabamba, Bolivia",
    pais: "BO",
    curso: "Transgeneracional Profundo y Psicogenealogía",
    cursoSlug: "transgeneracional",
    texto: "Me encantaron las experiencias compartidas tanto de la docente como de las compañer@s",
    textoCorto: "Me encantaron las experiencias compartidas de la docente y compañeros.",
    destacado: false,
    fecha: "2025"
  },
  {
    id: "patricia-cochabamba",
    nombre: "Patricia",
    ubicacion: "Cochabamba, Bolivia",
    pais: "BO",
    curso: "Transgeneracional Profundo y Psicogenealogía",
    cursoSlug: "transgeneracional",
    texto: "El poder estar consciente de mi fuerza interior y tener el poder de curarme y curar a mi familia mediante el perdón y agradecimiento a mis ancestros",
    textoCorto: "Tener el poder de curarme y curar a mi familia mediante el perdón.",
    destacado: false,
    fecha: "2025"
  },
  {
    id: "paola-cochabamba",
    nombre: "Paola",
    ubicacion: "Cochabamba, Bolivia",
    pais: "BO",
    curso: "Transgeneracional Profundo y Psicogenealogía",
    cursoSlug: "transgeneracional",
    texto: "Lo que más me gustó de este curso fue el poder encontrar el principio de mi raíz familiar, muchas cosas que no sabía, ahora miro con otros ojos a mi familia. Y descubrí que tengo mucho que trabajar.",
    textoCorto: "Poder encontrar el principio de mi raíz familiar y mirar con otros ojos.",
    destacado: false,
    fecha: "2025"
  },
  {
    id: "cristina-bolivia",
    nombre: "Cristina",
    ubicacion: "Bolivia",
    pais: "BO",
    curso: "Terapia Resonancial®️",
    cursoSlug: "terapia-resonancial",
    texto: "Vivir el proceso con Daniela fue profundamente transformador para mí. Sus clases y acompañamientos fueron dinámicos, claros y muy conscientes, invitándome a mirarme con honestidad y a integrar aprendizajes reales en mi vida. Daniela enseña desde la experiencia y la coherencia, lo que no solo impactó mi crecimiento personal y espiritual, sino también la forma en que hoy acompaño a otros en sus propios procesos. Su guía deja huella porque genera transformaciones auténticas y sostenibles.",
    textoCorto: "Su guía deja huella porque genera transformaciones auténticas y sostenibles.",
    destacado: false,
    fecha: "2026"
  },
  {
    id: "luisa-bolivia",
    nombre: "Luisa",
    ubicacion: "Bolivia",
    pais: "BO",
    curso: "Terapia Resonancial®️",
    cursoSlug: "terapia-resonancial",
    texto: "Es uno de mis lugares seguros, que te brinda las herramientas necesarias para sanarte a ti misma. Te acompaña en este camino interno tan profundo de sanación de una forma amorosa y segura a tu ritmo.",
    textoCorto: "Te brinda las herramientas necesarias para sanarte a ti misma.",
    destacado: false,
    fecha: "2026"
  },
  {
    id: "anneth-bolivia",
    nombre: "Anneth",
    ubicacion: "Bolivia",
    pais: "BO",
    curso: "Terapia Resonancial®️",
    cursoSlug: "terapia-resonancial",
    texto: "Participar de los cursos fundamentales orientados al desarrollo espiritual y consciente, ha significado una experiencia profundamente transformadora tanto a nivel personal como profesional. Este camino me permitió fortalecer la autoconciencia, el equilibrio emocional y la coherencia entre pensamiento, acción y propósito de vida. Me brindó herramientas prácticas para gestionar emociones, potenciar habilidades internas y tomar decisiones más alineadas con valores éticos y humanos con una visión más amplia y empática de la realidad, fomentando el liderazgo consciente, la comunicación asertiva y la responsabilidad personal desde una mirada más humana y equilibrada.",
    textoCorto: "Me brindó herramientas prácticas para gestionar emociones y tomar decisiones alineadas.",
    destacado: false,
    fecha: "2026"
  }
];

// Get featured testimonial and others
const featuredTestimonial = testimonios.find(t => t.destacado) || testimonios[0];
const otherTestimonials = testimonios.filter(t => !t.destacado);

// Testimonial Card Component
const TestimonialCard = memo(({ testimonial, isExpanded, onToggle }: {
  testimonial: Testimonial;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const flag = countryFlags[testimonial.pais] || "🌍";

  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:border-primary/20 transition-colors duration-300 h-full flex flex-col">
      <div className="flex-1">
        <Quote className="w-5 h-5 text-primary/40 mb-3" />
        <p className="text-white/80 font-light leading-relaxed text-sm mb-3">
          "{isExpanded ? testimonial.texto : testimonial.textoCorto}"
        </p>
        {testimonial.texto.length > 100 && (
          <button
            onClick={onToggle}
            className="text-primary/70 text-xs hover:text-primary transition-colors mb-3"
          >
            {isExpanded ? "Ver menos" : "Ver más"}
          </button>
        )}
      </div>

      <div className="pt-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-base">
            {flag}
          </div>
          <div>
            <p className="text-white font-medium text-sm">{testimonial.nombre}</p>
            <p className="text-white/40 text-xs flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {testimonial.ubicacion}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
TestimonialCard.displayName = "TestimonialCard";

// Carousel Navigation
const CarouselNav = memo(({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onDotClick
}: {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onDotClick: (index: number) => void;
}) => (
  <div className="flex items-center justify-center gap-4 mt-6">
    <button
      onClick={onPrev}
      className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      disabled={currentPage === 0}
      aria-label="Anterior"
    >
      <ChevronLeft className="w-4 h-4" />
    </button>

    <div className="flex items-center gap-2">
      {Array.from({ length: totalPages }).map((_, i) => (
        <button
          key={i}
          onClick={() => onDotClick(i)}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            i === currentPage
              ? "bg-primary w-5"
              : "bg-white/20 hover:bg-white/40"
          }`}
          aria-label={`Ir a página ${i + 1}`}
        />
      ))}
    </div>

    <button
      onClick={onNext}
      className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      disabled={currentPage === totalPages - 1}
      aria-label="Siguiente"
    >
      <ChevronRight className="w-4 h-4" />
    </button>
  </div>
));
CarouselNav.displayName = "CarouselNav";

// Main Testimonials Component
export function Testimonials() {
  const shouldReduceMotion = useReducedMotion();
  const [currentPage, setCurrentPage] = useState(0);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const itemsPerPage = 3;
  const totalPages = Math.ceil(otherTestimonials.length / itemsPerPage);

  const getCurrentPageItems = useCallback(() => {
    const start = currentPage * itemsPerPage;
    return otherTestimonials.slice(start, start + itemsPerPage);
  }, [currentPage]);

  const handlePrev = useCallback(() => {
    setCurrentPage(p => Math.max(0, p - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentPage(p => Math.min(totalPages - 1, p + 1));
  }, [totalPages]);

  const handleDotClick = useCallback((index: number) => {
    setCurrentPage(index);
  }, []);

  const toggleCardExpansion = useCallback((id: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const flag = countryFlags[featuredTestimonial.pais] || "🌍";

  return (
    <motion.section
      id="testimonios"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="py-12 md:py-16 bg-zinc-950 relative overflow-hidden"
    >
      {/* Background Gradient - matching Pack Completo */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Main Container - matching Pack Completo style */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
          <div className="p-8 md:p-12">
            {/* Section Header */}
            <div className="text-center mb-10">
              <span className="text-primary text-sm tracking-[0.3em] uppercase font-bold mb-4 block">
                Testimonios
              </span>
              <h2 className="text-4xl md:text-5xl font-heading mb-4">
                Lo que dicen quienes ya <br className="hidden md:block" />
                <span className="text-primary italic">cruzaron el portal</span>
              </h2>
              <p className="text-muted-foreground font-light max-w-xl mx-auto">
                Experiencias reales de personas que han transformado su vida a través de nuestro acompañamiento.
              </p>
            </div>

            {/* Featured Testimonial */}
            <div className="bg-white/5 border border-primary/10 rounded-2xl p-6 md:p-8 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium border border-primary/20">
                  Destacado
                </span>
              </div>

              <Quote className="w-8 h-8 text-primary/30 mb-4" />

              <blockquote className="text-white/90 text-base md:text-lg font-light leading-relaxed mb-6">
                "{featuredTestimonial.texto}"
              </blockquote>

              <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xl">
                  {flag}
                </div>
                <div>
                  <p className="text-white font-heading text-base">{featuredTestimonial.nombre}</p>
                  <p className="text-white/50 text-sm flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {featuredTestimonial.ubicacion}
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial Cards Grid/Carousel */}
            <div className="relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={shouldReduceMotion ? false : { opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
                  transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3 }}
                  className="grid md:grid-cols-3 gap-4"
                >
                  {getCurrentPageItems().map((testimonial) => (
                    <TestimonialCard
                      key={testimonial.id}
                      testimonial={testimonial}
                      isExpanded={expandedCards.has(testimonial.id)}
                      onToggle={() => toggleCardExpansion(testimonial.id)}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Carousel Navigation */}
            {totalPages > 1 && (
              <CarouselNav
                currentPage={currentPage}
                totalPages={totalPages}
                onPrev={handlePrev}
                onNext={handleNext}
                onDotClick={handleDotClick}
              />
            )}

            {/* Stats Bar */}
            <div className="mt-8 pt-6 border-t border-white/5">
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-center">
                <div className="flex items-center gap-2">
                  <span className="text-primary text-xl font-heading">10+</span>
                  <span className="text-white/50 text-sm">personas transformadas</span>
                </div>
                <div className="hidden md:block w-px h-5 bg-white/10" />
                <div className="flex items-center gap-2">
                  <span className="text-white/50 text-sm">Participantes de</span>
                  <div className="flex items-center gap-1">
                    <span className="text-base">🇧🇴</span>
                    <span className="text-base">🇩🇪</span>
                    <span className="text-base">🇺🇸</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
