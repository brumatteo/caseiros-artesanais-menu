import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingWhatsAppButtonProps {
  onClick: () => void;
  itemCount: number;
}

export function FloatingWhatsAppButton({ onClick, itemCount }: FloatingWhatsAppButtonProps) {
  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <Button
        onClick={onClick}
        size="lg"
        className="shadow-hover hover:shadow-lg transition-all duration-300 gap-2 pr-6 hover:scale-105"
      >
        <div className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-scale-in">
              {itemCount}
            </span>
          )}
        </div>
        <span className="font-semibold">Finalizar Pedido</span>
      </Button>
    </div>
  );
}
