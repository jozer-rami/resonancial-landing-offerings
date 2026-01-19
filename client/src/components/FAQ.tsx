import { memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { HelpCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

// FAQ Data - Essential questions from CRO analysis
const faqItems: FAQItem[] = [
  {
    id: "como-funcionan",
    question: "¿Cómo funcionan las sesiones?",
    answer: "Las sesiones de Terapia Resonancial®️ son 1:1, privadas y completamente personalizadas. Se realizan por videollamada, previa reserva en agenda, y siguen protocolos terapéuticos propios que permiten leer, ordenar y reconfigurar tu frecuencia interna de forma consciente y profunda. Cada sesión es un espacio cuidado, confidencial y guiado con precisión.",
    category: "proceso"
  },
  {
    id: "que-esperar",
    question: "¿Qué puedo esperar después de una sesión?",
    answer: "Tras una sesión, la mayoría de las personas experimentan mayor claridad, alivio emocional y una sensación de alineación interna. El trabajo no termina en la sesión: la frecuencia reordenada continúa integrándose en los días posteriores, generando cambios sostenibles y coherentes en tu vida cotidiana.",
    category: "resultados"
  },
  {
    id: "por-que-pack",
    question: "¿Por qué elegir el Pack Completo?",
    answer: "El Pack Completo está diseñado para quienes buscan una transformación real y sostenida, no intervenciones aisladas. Integra las etapas necesarias para: limpiar interferencias, estabilizar una nueva frecuencia, y alinear propósito, intención y acción. Es la experiencia más profunda y recomendada dentro de Terapia Resonancial®️.",
    category: "servicios"
  },
  {
    id: "pagos",
    question: "¿Cómo se realizan los pagos?",
    answer: "Los pagos se realizan de forma anticipada. Una vez confirmado el pago, la sesión queda reservada en agenda y se envía la información para la videollamada. Este sistema garantiza orden, disponibilidad y respeto por el espacio terapéutico.",
    category: "pagos"
  },
  {
    id: "regalar",
    question: "¿Puedo regalar una sesión?",
    answer: "Sí. Puedes regalar una sesión o un pack como una experiencia consciente de bienestar y expansión. Las sesiones regalo se coordinan respetando el proceso y el momento de la persona que las recibe.",
    category: "regalo"
  },
  {
    id: "almanaque",
    question: "¿Qué incluye el Almanaque Ritual Resonancial 2026™️?",
    answer: "El Almanaque Ritual Resonancial 2026™️ es una guía viva y personalizada, creada específicamente para tu proceso. Incluye rituales, prácticas y activaciones diseñadas para acompañarte durante el año, sostener la frecuencia trabajada en sesión y profundizar tu integración consciente. No es un contenido genérico: es un acompañamiento alineado a tu campo y a tu momento vital.",
    category: "productos"
  },
  {
    id: "primera-vez",
    question: "Es mi primera vez en terapias energéticas, ¿es para mí?",
    answer: "Sí. La Terapia Resonancial®️ es clara, accesible y profundamente contenida, incluso si es tu primer acercamiento a este tipo de procesos. No necesitas experiencia previa ni creencias específicas, solo apertura a observar y reordenar tu mundo interno.",
    category: "general"
  },
  {
    id: "diferencia",
    question: "¿Qué diferencia a Terapia Resonancial®️ de otras terapias?",
    answer: "Terapia Resonancial®️ no busca corregirte, sino reconectarte con tu frecuencia original. Integra inteligencia emocional, desarrollo personal y conciencia energética en un método propio, elegante y efectivo. El enfoque no genera dependencia: promueve autonomía, claridad y coherencia sostenida.",
    category: "metodo"
  }
];

// FAQ Item Component
const FAQItemComponent = memo(({ item }: { item: FAQItem }) => (
  <AccordionItem
    value={item.id}
    className="border-b border-white/5 last:border-b-0"
  >
    <AccordionTrigger className="py-5 text-left text-white hover:text-primary hover:no-underline transition-colors group">
      <span className="text-base font-medium pr-4 group-hover:text-primary">
        {item.question}
      </span>
    </AccordionTrigger>
    <AccordionContent className="text-white/70 font-light leading-relaxed pb-5">
      {item.answer}
    </AccordionContent>
  </AccordionItem>
));
FAQItemComponent.displayName = "FAQItemComponent";

// Main FAQ Component
export function FAQ() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      id="faq"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="py-12 md:py-16 bg-zinc-950 relative overflow-hidden scroll-mt-20"
    >
      {/* Background Gradient */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Main Container - matching other sections */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
          <div className="p-8 md:p-12">
            {/* Section Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <HelpCircle className="w-6 h-6 text-primary" />
              </div>
              <span className="text-primary text-sm tracking-[0.3em] uppercase font-bold mb-4 block">
                Preguntas Frecuentes
              </span>
              <h2 className="text-4xl md:text-5xl font-heading mb-4 text-balance">
                Resolvemos tus <span className="text-primary italic">dudas</span>
              </h2>
              <p className="text-muted-foreground font-light max-w-xl mx-auto">
                Todo lo que necesitas saber antes de comenzar tu proceso de transformación.
              </p>
            </div>

            {/* FAQ Accordion */}
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item) => (
                  <FAQItemComponent key={item.id} item={item} />
                ))}
              </Accordion>
            </div>

            {/* Bottom CTA */}
            <div className="mt-10 pt-8 border-t border-white/5">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
                <p className="text-white/50 text-sm">
                  ¿Tienes otra pregunta?
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="border-primary/20 hover:bg-primary hover:text-black rounded-full text-xs uppercase tracking-widest"
                >
                  <a
                    href="https://wa.me/59169703379?text=Hola,%20tengo%20una%20pregunta%20sobre%20Terapia%20Resonancial"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Escríbenos por WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
