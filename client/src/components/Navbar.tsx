import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logoSymbol from "@assets/logo_1767647555211.png";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Inicio", href: "/" },
    { name: "Filosofía", href: "#filosofia" },
    { name: "Servicios", href: "#servicios" },
    { name: "Pack Completo", href: "#pack" },
  ];

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (id === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setIsMobileMenuOpen(false);
      return;
    }
    
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
        isScrolled ? "bg-black/80 backdrop-blur-md border-white/10 py-4" : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Brand */}
        <a 
          href="/" 
          onClick={(e) => handleScrollTo(e, "/")}
          className="flex items-center gap-3 group"
        >
          <div className="relative w-10 h-10 overflow-hidden rounded-full border border-primary/20 bg-black/50 p-1.5 transition-transform duration-300 group-hover:scale-105">
            <img src={logoSymbol} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-heading text-xl tracking-wider text-white group-hover:text-primary transition-colors">
            PORTAL RESONANCIAL
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleScrollTo(e, link.href)}
              className="text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              {link.name}
            </a>
          ))}
          <Button asChild className="rounded-full bg-primary text-black hover:bg-primary/90 font-medium px-6">
            <a href="https://wa.me/34640919319" target="_blank" rel="noopener noreferrer">
              Contacto
            </a>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 p-4 md:hidden flex flex-col gap-4 animate-in slide-in-from-top-5">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleScrollTo(e, link.href)}
              className="text-lg font-heading text-white/90 hover:text-primary py-2 border-b border-white/5"
            >
              {link.name}
            </a>
          ))}
           <Button asChild className="w-full rounded-full bg-primary text-black hover:bg-primary/90">
            <a href="https://wa.me/34640919319" target="_blank" rel="noopener noreferrer">
              Contacto
            </a>
          </Button>
        </div>
      )}
    </nav>
  );
}
