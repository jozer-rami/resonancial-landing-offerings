import { memo } from "react";
import { X } from "lucide-react";
import { DialogClose } from "@/components/ui/dialog";

/**
 * Mobile-friendly modal close button component
 *
 * Provides two close buttons:
 * 1. Top-right button (hidden on mobile, visible on desktop)
 * 2. Bottom bar with close button (visible on mobile, hidden on desktop)
 *
 * This ensures mobile users can easily close modals without scrolling
 * back to the top.
 */
export const ModalCloseButton = memo(({
  className = "",
  showBottomBar = true
}: {
  className?: string;
  showBottomBar?: boolean;
}) => {
  return (
    <>
      {/* Desktop: Top-right close button */}
      <DialogClose
        className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 hidden md:flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors ${className}`}
        aria-label="Cerrar modal"
      >
        <X className="w-5 h-5" />
      </DialogClose>

      {/* Mobile: Sticky top close button */}
      <div className="sticky top-0 z-30 md:hidden">
        <div className="absolute top-4 right-4">
          <DialogClose
            className="w-10 h-10 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors shadow-lg"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </DialogClose>
        </div>
      </div>

      {/* Mobile: Bottom close bar */}
      {showBottomBar && (
        <div className="sticky bottom-0 left-0 right-0 z-30 md:hidden bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent pt-6 pb-4 px-4 -mx-4 mt-6">
          <DialogClose
            className="w-full py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center gap-2 text-white hover:bg-white/20 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
            <span className="text-sm font-medium">Cerrar</span>
          </DialogClose>
        </div>
      )}
    </>
  );
});
ModalCloseButton.displayName = "ModalCloseButton";

/**
 * Simplified close button for modals without images
 * Shows sticky close at top on mobile
 */
export const SimpleModalCloseButton = memo(({ className = "" }: { className?: string }) => {
  return (
    <>
      {/* Desktop: Absolute positioned */}
      <DialogClose
        className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 hidden md:flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors ${className}`}
        aria-label="Cerrar modal"
      >
        <X className="w-5 h-5" />
      </DialogClose>

      {/* Mobile: Sticky at top */}
      <div className="sticky top-0 z-30 md:hidden pointer-events-none">
        <div className="absolute top-4 right-4 pointer-events-auto">
          <DialogClose
            className="w-10 h-10 rounded-full bg-zinc-900/90 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors shadow-lg"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </DialogClose>
        </div>
      </div>
    </>
  );
});
SimpleModalCloseButton.displayName = "SimpleModalCloseButton";
