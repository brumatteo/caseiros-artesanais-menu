import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteSettings } from '@/types';

interface NavbarProps {
  settings: SiteSettings;
  cartItemCount: number;
  onCartClick: () => void;
}

export function Navbar({ settings, cartItemCount, onCartClick }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-40 w-full bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Branding */}
          <div className="flex items-center gap-3">
            {settings.showLogo && settings.logoImage && (
              <img 
                src={settings.logoImage} 
                alt="Logo" 
                className="w-10 h-10 rounded-full object-cover shadow-soft"
              />
            )}
            {settings.showName && (
              <h1 className="text-xl md:text-2xl font-display font-semibold text-foreground">
                {settings.brandName}
              </h1>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onCartClick}
              className="relative"
              aria-label="Carrinho de compras"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
