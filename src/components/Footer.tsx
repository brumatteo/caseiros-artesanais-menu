import { Instagram, MapPin, Phone } from 'lucide-react';
import { SiteSettings } from '@/types';

interface FooterProps {
  settings: SiteSettings;
}

export function Footer({ settings }: FooterProps) {
  return (
    <footer className="bg-card border-t border-border py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-6">
          {/* Contact Information */}
          <div className="flex flex-col items-center gap-3 text-center">
            {settings.footerAddress && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{settings.footerAddress}</span>
              </div>
            )}
            
            {settings.footerPhone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{settings.footerPhone}</span>
              </div>
            )}
            
            {settings.instagramUrl && (
              <a 
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-smooth"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
                <span>Instagram</span>
              </a>
            )}
          </div>
          
          {/* Copyright - só renderiza se tiver texto */}
          {settings.footerText && (
            <div className="border-t border-border pt-4 w-full text-center">
              <p className="text-sm text-muted-foreground">
                {settings.footerText}
              </p>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
