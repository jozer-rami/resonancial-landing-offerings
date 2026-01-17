import { useState } from "react";
import { Instagram, Mail, Phone } from "lucide-react";
import logoSymbol from "@assets/logo_1767647555211.png";
import { PrivacyModal, TermsModal } from "./LegalModals";

export function Footer() {
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  return (
    <footer className="bg-zinc-950 border-t border-white/5 pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-primary/20 p-2">
                <img src={logoSymbol} alt="Portal Resonancial" width={40} height={40} className="w-full h-full object-contain" />
              </div>
              <span className="font-heading text-2xl text-white">PORTAL RESONANCIAL</span>
            </div>
            <p className="text-muted-foreground font-light max-w-md leading-relaxed">
              Un espacio sagrado para la alineación energética y la transformación consciente.
              Sintoniza con tu verdadero potencial y habita tu nuevo ciclo.
            </p>
          </div>

          {/* Links Column */}
          <div className="space-y-6">
            <h4 className="text-white font-heading text-lg">Explorar</h4>
            <ul className="space-y-4">
              <li>
                <a href="#servicios" className="text-muted-foreground hover:text-primary transition-colors">Servicios</a>
              </li>
              <li>
                <a href="#guia" className="text-muted-foreground hover:text-primary transition-colors">Tu Guía</a>
              </li>
              <li>
                <a href="#pack" className="text-muted-foreground hover:text-primary transition-colors">Pack Completo</a>
              </li>
              <li>
                <a href="#almanaque" className="text-muted-foreground hover:text-primary transition-colors">Almanaque Ritual</a>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-6">
            <h4 className="text-white font-heading text-lg">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-4 h-4" aria-hidden="true" />
                <a href="mailto:info@terapiaresonancial.com">info@terapiaresonancial.com</a>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-4 h-4" aria-hidden="true" />
                <a href="https://www.instagram.com/terapiaresonancial/" target="_blank" rel="noopener noreferrer">@terapiaresonancial</a>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-4 h-4" aria-hidden="true" />
                <a href="https://wa.me/59169703379">+591 69703379</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/20">
          <p>© 2026 Portal Resonancial. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <button
              onClick={() => setPrivacyModalOpen(true)}
              className="hover:text-white transition-colors"
            >
              Privacidad
            </button>
            <button
              onClick={() => setTermsModalOpen(true)}
              className="hover:text-white transition-colors"
            >
              Términos
            </button>
          </div>
        </div>
      </div>

      {/* Legal Modals */}
      <PrivacyModal
        open={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />
      <TermsModal
        open={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
      />
    </footer>
  );
}
