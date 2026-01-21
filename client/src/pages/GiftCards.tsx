import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GiftCardPreview } from "@/components/ui/gift-card-preview";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { trackGiftCardStep, trackGiftCardComplete, trackWhatsAppClick } from "@/lib/analytics";
import { useScrollTracking } from "@/hooks/useScrollTracking";

const services = [
  { id: "detox", name: "Detox Frecuencial", price: "369 Bs" },
  { id: "reconfiguracion", name: "Reconfiguración", price: "369 Bs" },
  { id: "mapa", name: "Mapa Resonancial", price: "369 Bs" },
  { id: "pack", name: "Pack Completo", price: "999 Bs" },
];

export default function GiftCards() {
  const [formData, setFormData] = useState({
    service: "",
    fromName: "",
    toName: "",
    message: "",
  });

  // Track scroll depth
  useScrollTracking();

  const selectedService = services.find(s => s.id === formData.service);

  // Parse price for analytics (extract number from "500 Bs")
  const getPrice = (priceStr: string): number => {
    const match = priceStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const handleServiceSelect = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    setFormData({ ...formData, service: serviceId });
    if (service) {
      trackGiftCardStep(1, 'select_service', getPrice(service.price));
    }
  };

  // Track when user starts personalizing (step 2)
  const [hasTrackedStep2, setHasTrackedStep2] = useState(false);
  const handlePersonalizeStart = () => {
    if (!hasTrackedStep2 && formData.service) {
      trackGiftCardStep(2, 'personalize_start');
      setHasTrackedStep2(true);
    }
  };

  const handlePurchase = () => {
    if (!selectedService) return;

    // Track completion
    trackGiftCardComplete(getPrice(selectedService.price));
    trackWhatsAppClick('gift_card_purchase', 'gift_card_page', getPrice(selectedService.price));

    // Generate WhatsApp Message
    const text = `Hola, quiero regalar una Gift Card de ${selectedService?.name} (${selectedService?.price}).

De: ${formData.fromName}
Para: ${formData.toName}
Mensaje: ${formData.message}`;

    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/59169703379?text=${encodedText}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-40 pb-20 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <span className="text-primary text-xs tracking-[0.3em] uppercase block mb-6">Regalos Conscientes</span>
            <h1 className="text-5xl md:text-6xl font-heading mb-6">Regala una sesión</h1>
            <p className="text-muted-foreground text-lg font-light leading-relaxed">
              Un gesto de alineación para iniciar un nuevo ciclo. Comparte la frecuencia de la transformación con quien más quieres.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gift Configurator */}
      <section className="py-20 bg-zinc-900/30 border-y border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            
            {/* Left: Form */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-heading text-white">1. Elige el Regalo</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        formData.service === service.id
                          ? "border-primary bg-primary/10"
                          : "border-white/10 hover:border-white/20 bg-black/20"
                      }`}
                    >
                      <div className="font-heading text-lg text-white mb-1">{service.name}</div>
                      <div className="text-muted-foreground text-sm">{service.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-heading text-white">2. Personaliza</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="from">Tu Nombre</Label>
                      <Input
                        id="from"
                        placeholder="Ej. Ana"
                        value={formData.fromName}
                        onFocus={handlePersonalizeStart}
                        onChange={(e) => setFormData({...formData, fromName: e.target.value})}
                        className="bg-black/20 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="to">Para Quién</Label>
                      <Input 
                        id="to"
                        placeholder="Ej. Sofía" 
                        value={formData.toName}
                        onChange={(e) => setFormData({...formData, toName: e.target.value})}
                        className="bg-black/20 border-white/10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje (Opcional)</Label>
                    <Textarea 
                      id="message"
                      placeholder="Escribe una dedicatoria..." 
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="bg-black/20 border-white/10 min-h-[100px]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  size="lg"
                  className="w-full bg-primary text-black hover:bg-white hover:text-black rounded-full h-14 text-lg font-medium tracking-wide shadow-[0_0_20px_rgba(var(--primary),0.2)]"
                  disabled={!formData.service || !formData.fromName || !formData.toName}
                  onClick={handlePurchase}
                >
                  <span className="mr-2">Continuar al Pago</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <p className="text-center text-xs text-white/30 mt-4">
                  Serás redirigido a WhatsApp para completar la compra segura.
                </p>
              </div>
            </div>

            {/* Right: Preview */}
            <div className="lg:sticky lg:top-32">
              <h2 className="text-2xl font-heading text-white mb-8 text-center lg:text-left">Vista Previa</h2>
              <GiftCardPreview 
                service={selectedService?.name || ""} 
                from={formData.fromName}
                to={formData.toName}
                message={formData.message}
              />
              
              <div className="mt-8 space-y-4 max-w-md mx-auto">
                 <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                   <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                   <div className="text-sm text-muted-foreground">
                     <strong className="text-white block mb-1">Entrega Digital Inmediata</strong>
                     Recibirás la tarjeta personalizada lista para enviar por WhatsApp o Email.
                   </div>
                 </div>
                 <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                   <CheckCircle2 className="w-5 h-5 text-white/40 mt-0.5 shrink-0" />
                   <div className="text-sm text-muted-foreground">
                     <strong className="text-white block mb-1">Validez de 12 meses</strong>
                     La persona podrá canjear su sesión cuando mejor le convenga.
                   </div>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
