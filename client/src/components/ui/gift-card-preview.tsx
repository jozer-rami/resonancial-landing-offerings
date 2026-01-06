import { motion } from "framer-motion";
import { Gift } from "lucide-react";

interface GiftCardPreviewProps {
  service: string;
  from: string;
  to: string;
  message: string;
}

export function GiftCardPreview({ service, from, to, message }: GiftCardPreviewProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-black border border-primary/30 rounded-2xl p-8 relative overflow-hidden aspect-[1.58/1] shadow-2xl flex flex-col justify-between max-w-md mx-auto"
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <h3 className="text-primary font-heading text-2xl tracking-wide uppercase">Gift Card</h3>
          <p className="text-white/40 text-xs tracking-[0.2em] uppercase mt-1">Portal Resonancial</p>
        </div>
        <Gift className="w-8 h-8 text-primary/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-6">
        <div className="space-y-1">
          <p className="text-white/40 text-[10px] uppercase tracking-wider">Servicio</p>
          <p className="text-white text-lg font-medium">{service || "Selecciona un servicio"}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
             <p className="text-white/40 text-[10px] uppercase tracking-wider">De</p>
             <p className="text-white text-sm">{from || "..."}</p>
          </div>
          <div className="space-y-1">
             <p className="text-white/40 text-[10px] uppercase tracking-wider">Para</p>
             <p className="text-white text-sm">{to || "..."}</p>
          </div>
        </div>
      </div>

       {/* Footer */}
       <div className="relative z-10 pt-4 border-t border-white/5 flex justify-between items-end">
          <div className="text-[10px] text-white/30 font-mono">
            Valid for 12 months
          </div>
          <div className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center">
             <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </div>
       </div>
    </motion.div>
  );
}
