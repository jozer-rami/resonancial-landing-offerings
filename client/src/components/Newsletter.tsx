import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    
    // Mock API call
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 1500);
  };

  return (
    <section className="py-10 md:py-12 bg-background relative border-t border-white/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="relative bg-zinc-900/40 backdrop-blur-sm border border-white/10 rounded-[2rem] p-8 md:p-12 overflow-hidden text-center">
            {/* Soft decorative gradient */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1/2 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
                <Mail className="w-6 h-6" />
              </div>

              {status === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4 py-8"
                >
                  <div className="flex items-center justify-center gap-2 text-primary text-xl font-heading">
                    <CheckCircle2 className="w-6 h-6" />
                    <h3>¡Gracias por unirte!</h3>
                  </div>
                  <p className="text-muted-foreground font-light max-w-md mx-auto">
                    Tu código de descuento del 10% está en camino a tu bandeja de entrada. ✨
                  </p>
                </motion.div>
              ) : (
                <>
                  <h2 className="text-3xl md:text-4xl font-heading text-white mb-4">Obtén 10% de descuento</h2>
                  <p className="text-muted-foreground font-light max-w-lg mx-auto mb-8 text-lg">
                    Únete a nuestra comunidad resonancial y recibe tu código de descuento directamente en tu correo.
                  </p>

                  <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-grow">
                        <Input
                          type="email"
                          placeholder="tu@email.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (status === "error") setStatus("idle");
                          }}
                          className={cn(
                            "bg-black/20 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl focus-visible:ring-primary/50",
                            status === "error" && "border-red-500/50 focus-visible:ring-red-500/50"
                          )}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={status === "loading"}
                        className="bg-primary text-black hover:bg-primary/90 h-12 px-8 rounded-xl font-medium tracking-wide min-w-[140px]"
                      >
                        {status === "loading" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Obtener Descuento"
                        )}
                      </Button>
                    </div>
                    {status === "error" && (
                      <p className="text-red-400 text-sm text-left pl-1">
                        Por favor ingresa un correo electrónico válido.
                      </p>
                    )}
                    <p className="text-xs text-white/20 pt-2">
                      Sin spam. Puedes darte de baja en cualquier momento.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
