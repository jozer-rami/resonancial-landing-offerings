import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function Redeem() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 5) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    
    // Simulate validation
    setTimeout(() => {
      setStatus("success");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-32 px-4 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl"
        >
          {status === "success" ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto text-primary mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-heading text-white">¡Regalo Validado!</h1>
              <p className="text-muted-foreground font-light">
                Tu código <strong>{code}</strong> ha sido canjeado exitosamente por una sesión de <strong className="text-white">Detox Frecuencial</strong>.
              </p>
              <Button asChild className="w-full h-12 bg-primary text-black hover:bg-white rounded-full text-lg mt-4">
                 <Link href="/#servicios">Reservar mi Sesión Ahora</Link>
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-8">
               <div>
                 <h1 className="text-3xl md:text-4xl font-heading text-white mb-3">Canjear Regalo</h1>
                 <p className="text-muted-foreground font-light">
                   Ingresa el código que recibiste en tu tarjeta de regalo.
                 </p>
               </div>

               <form onSubmit={handleRedeem} className="space-y-4">
                 <div className="space-y-2 text-left">
                   <label htmlFor="gift-code" className="sr-only">Código de regalo</label>
                   <Input
                     id="gift-code"
                     placeholder="Ej. GIFT-2026-X8Y9…"
                     autoComplete="off"
                     spellCheck={false}
                     value={code}
                     onChange={(e) => {
                       setCode(e.target.value.toUpperCase());
                       setStatus("idle");
                     }}
                     className={`bg-black/30 border-white/10 h-14 text-center text-lg tracking-widest uppercase placeholder:normal-case placeholder:tracking-normal ${status === "error" ? "border-red-500/50" : ""}`}
                   />
                   {status === "error" && (
                     <div className="flex items-center gap-2 text-red-400 text-xs pl-1">
                       <AlertCircle className="w-3 h-3" />
                       <span>Código inválido. Intenta nuevamente.</span>
                     </div>
                   )}
                 </div>

                 <Button 
                   type="submit"
                   disabled={status === "loading"}
                   className="w-full h-12 bg-white text-black hover:bg-primary rounded-full text-lg font-medium transition-colors"
                 >
                   {status === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Validar Código"}
                 </Button>
               </form>
               
               <div className="text-xs text-white/30 pt-4 border-t border-white/5">
                 ¿Tienes problemas? <a href="https://wa.me/59169703379" className="text-primary hover:underline">Contáctanos</a>
               </div>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
