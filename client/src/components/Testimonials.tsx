import { useState, memo, useCallback, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

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

// Testimonials data - ordered by relevance (geographic diversity, depth, course variety)
const testimonios: Testimonial[] = [
  // FEATURED (Anya) - displayed separately
  {
    id: "anya-lapaz",
    nombre: "Anya",
    ubicacion: "La Paz, Bolivia",
    pais: "BO",
    curso: "Coaching Holístico",
    cursoSlug: "coaching-holistico",
    texto: "La conocí en un punto de quiebre en mi vida. Poder tomar sus cursos me permitió comprender que no todo se resuelve con medicación o estudios médicos que muchas veces no dan respuestas reales. A través de esta formación aprendí a ir más allá: al origen, al inconsciente y a las cadenas transgeneracionales que condicionan nuestra vida sin que lo sepamos. Gracias a este proceso entendí que sí podía sanar, recuperé la confianza en mi mente y volví a estudiar y aprender, en un momento en el que creía que ya no era posible. Este camino no solo me brindó conocimiento, me devolvió claridad, fuerza y libertad interior. Hoy puedo decir que su acompañamiento y formación marcaron un antes y un después en mi vida personal y profesional. Estoy infinitamente agradecida con mi maestra de luz ✨️",
    textoCorto: "Este camino me devolvió claridad, fuerza y libertad interior.",
    destacado: true,
    fecha: "2026"
  },
  // 1. Cristina - Strong endorsement of Daniela, professional credibility
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
  // 2. Blanca - Detailed journey, multiple courses, strong recommendation
  {
    id: "blanca-lapaz",
    nombre: "Blanca",
    ubicacion: "La Paz, Bolivia",
    pais: "BO",
    curso: "Coaching Holístico",
    cursoSlug: "coaching-holistico",
    texto: "Comencé este camino espiritual gracias a la recomendación de una amiga, y fue así como conecté con Danny e inicié el Coaching Holístico. Ha sido realmente una experiencia maravillosa, ya que Danny logra que cada clase sea única, profunda y significativa. Cada encuentro me permitió conectar con mis emociones, con algo más grande que yo, e incluso recordar sensaciones y momentos que sentía haber vivido antes. Danny no solo cuenta con una sólida formación y amplia experiencia, sino que también es un ser humano extraordinario, con dones únicos, mágicos y profundamente transformadores. Su acompañamiento va más allá de lo profesional; transmite calidez, compromiso y una energía que inspira confianza y crecimiento. Después del coaching, continué participando en varios talleres y cursos, y hoy seguimos avanzando en este camino de aprendizaje y expansión. Sin duda, ha sido una experiencia enriquecedora que recomiendo plenamente.",
    textoCorto: "Danny logra que cada clase sea única, profunda y significativa.",
    destacado: false,
    fecha: "2026"
  },
  // 3. Lorena - International (Germany), detailed, emotional
  {
    id: "lorena-bremen",
    nombre: "Lorena",
    ubicacion: "Bremen, Alemania",
    pais: "DE",
    curso: "Coaching Holístico",
    cursoSlug: "coaching-holistico",
    texto: "Mi experiencia en coaching holístico fue extra-ordinaria. Digo extraordinaria porque las herramientas que uno aprende y las muchas enseñanzas transmitidas por las coaches te obligan a salir de lo ordinario, de la vida común. Dar un pie más cercano a la vida que deseabas. La única manera es mirar dentro, y el equipo de profesionales junto a los compañeros que uno conoce en el taller hacen de esta experiencia una memoria inolvidable, valiosa y enfocada en el crecimiento y el amor. Muy agradecida con todos los que me acompañaron en este viaje y nada más que recomendarlo.",
    textoCorto: "Las herramientas que uno aprende te obligan a salir de lo ordinario, de la vida común.",
    destacado: false,
    fecha: "2025"
  },
  // 4. Laura - International (Spain), professional credibility
  {
    id: "laura-barcelona",
    nombre: "Laura",
    ubicacion: "Barcelona, España",
    pais: "ES",
    curso: "Terapia Resonancial®️",
    cursoSlug: "terapia-resonancial",
    texto: "Mi experiencia fue muy positiva, linda y transformadora. Daniela es una terapeuta muy profesional, con una gran capacidad para acompañar procesos personales. Este tipo de terapias me ayudaron mucho a nivel emocional y personal. Me sentí en un espacio de confianza y respeto. Sin dudas super recomendada.",
    textoCorto: "Una experiencia muy positiva, linda y transformadora.",
    destacado: false,
    fecha: "2026"
  },
  // 5. Alvaro - International (USA), male perspective (diversity)
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
  // 6. Luisa - Safe space, self-healing focus
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
  // 7. Karin - Spiritual depth, self-recognition
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
  // 8. Anneth - Professional + personal growth
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
  },
  // 9. Ilse - Professional growth focus
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
  // 10. Patricia - Family healing, forgiveness
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
  // 11. Paola - Family roots discovery
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
  // 12. Silvia - Community aspect
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

// Carousel Navigation with Embla integration
const CarouselNav = memo(({
  currentIndex,
  totalSlides,
  onPrev,
  onNext,
  onDotClick,
  canScrollPrev,
  canScrollNext
}: {
  currentIndex: number;
  totalSlides: number;
  onPrev: () => void;
  onNext: () => void;
  onDotClick: (index: number) => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
}) => (
  <div className="flex items-center justify-center gap-4 mt-6">
    <button
      onClick={onPrev}
      className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus-visible:outline-none"
      disabled={!canScrollPrev}
      aria-label="Anterior"
    >
      <ChevronLeft className="w-4 h-4" />
    </button>

    <div className="flex items-center gap-2">
      {Array.from({ length: totalSlides }).map((_, i) => (
        <button
          key={i}
          onClick={() => onDotClick(i)}
          className={`w-2 h-2 rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950 focus-visible:outline-none ${
            i === currentIndex
              ? "bg-primary w-5"
              : "bg-white/20 hover:bg-white/40"
          }`}
          aria-label={`Ir a página ${i + 1}`}
        />
      ))}
    </div>

    <button
      onClick={onNext}
      className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus-visible:outline-none"
      disabled={!canScrollNext}
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
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [featuredExpanded, setFeaturedExpanded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Embla Carousel setup with touch/swipe support
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    skipSnaps: false,
    dragFree: false,
    containScroll: "trimSnaps",
    // Respect reduced motion preference
    duration: shouldReduceMotion ? 0 : 20,
  });

  // Update scroll state when carousel changes
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  const onInit = useCallback(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onInit();
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onInit);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onInit);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onInit, onSelect]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

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
      className="py-12 md:py-16 bg-zinc-950 relative overflow-hidden scroll-mt-20"
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
              <h2 className="text-4xl md:text-5xl font-heading mb-4 text-balance">
                Lo que dicen quienes ya <br className="hidden md:block" />
                <span className="text-primary italic">cruzaron el portal</span>
              </h2>
              <p className="text-muted-foreground font-light max-w-xl mx-auto">
                Experiencias reales de personas que han transformado su vida a través de nuestro acompañamiento.
              </p>
            </div>

            {/* Featured Testimonial - Compact with expand/collapse */}
            <div className="bg-white/5 border border-primary/10 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xl shrink-0">
                  {flag}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header with name and badge */}
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-heading text-base">{featuredTestimonial.nombre}</p>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-medium border border-primary/20">
                      Destacado
                    </span>
                  </div>
                  <p className="text-white/50 text-xs flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3" />
                    {featuredTestimonial.ubicacion}
                  </p>

                  {/* Quote - truncated or full */}
                  <div className="relative">
                    <Quote className="w-4 h-4 text-primary/40 absolute -left-1 -top-1" />
                    <blockquote className="text-white/80 text-sm font-light leading-relaxed pl-4">
                      "{featuredExpanded ? featuredTestimonial.texto : featuredTestimonial.textoCorto}"
                    </blockquote>
                  </div>

                  {/* Expand/Collapse button */}
                  <button
                    onClick={() => setFeaturedExpanded(!featuredExpanded)}
                    className="text-primary/70 text-xs hover:text-primary transition-colors mt-2 pl-4 focus-visible:outline-none focus-visible:underline"
                  >
                    {featuredExpanded ? "Ver menos" : "Ver testimonio completo"}
                  </button>
                </div>
              </div>
            </div>

            {/* Embla Carousel - Touch/Swipe enabled */}
            <div
              className="overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
              ref={emblaRef}
              role="region"
              aria-roledescription="carrusel"
              aria-label="Testimonios de clientes"
            >
              <div className="flex gap-4">
                {otherTestimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="flex-none w-full md:w-[calc(33.333%-11px)]"
                    role="group"
                    aria-roledescription="diapositiva"
                  >
                    <TestimonialCard
                      testimonial={testimonial}
                      isExpanded={expandedCards.has(testimonial.id)}
                      onToggle={() => toggleCardExpansion(testimonial.id)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Navigation */}
            {scrollSnaps.length > 1 && (
              <CarouselNav
                currentIndex={selectedIndex}
                totalSlides={scrollSnaps.length}
                onPrev={scrollPrev}
                onNext={scrollNext}
                onDotClick={scrollTo}
                canScrollPrev={canScrollPrev}
                canScrollNext={canScrollNext}
              />
            )}

            {/* Stats Bar */}
            <div className="mt-8 pt-6 border-t border-white/5">
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-center">
                <div className="flex items-center gap-2">
                  <span className="text-primary text-xl font-heading">13+</span>
                  <span className="text-white/50 text-sm">personas transformadas</span>
                </div>
                <div className="hidden md:block w-px h-5 bg-white/10" />
                <div className="flex items-center gap-2">
                  <span className="text-white/50 text-sm">Participantes de</span>
                  <div className="flex items-center gap-1">
                    <span className="text-base">🇧🇴</span>
                    <span className="text-base">🇩🇪</span>
                    <span className="text-base">🇺🇸</span>
                    <span className="text-base">🇪🇸</span>
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
