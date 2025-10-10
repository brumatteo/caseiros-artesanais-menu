import { Instagram } from 'lucide-react';
import { SiteSettings } from '@/types';

interface FooterProps {
  settings: SiteSettings;
}

export function Footer({ settings }: FooterProps) {
  return (
    <footer className="bg-card border-t border-border py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {settings.footerText}
          </p>
          
          <div className="flex items-center gap-4">
            {settings.instagramUrl && (
              <a 
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-smooth"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
