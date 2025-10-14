import { SiteSettings } from '@/types';
import { Button } from '@/components/ui/button';

interface HeroProps {
  settings: SiteSettings;
}

export function Hero({ settings }: HeroProps) {
  // Não renderiza se não tiver dados essenciais
  if (!settings.heroTitle && !settings.heroImage) {
    return null;
  }

  const overlayStyle = {
    backgroundColor: settings.heroOverlayColor || '#000000',
    opacity: settings.heroOverlayOpacity || 0.5,
  };

  const objectPosition = settings.heroImagePosition || 'center';

  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
      {/* Background Image - só renderiza se tiver */}
      {settings.heroImage && (
        <img 
          src={settings.heroImage} 
          alt="Hero background" 
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition }}
        />
      )}
      
      {/* Overlay */}
      <div 
        className="absolute inset-0 w-full h-full" 
        style={overlayStyle}
      />
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
        {settings.showHeroLogo && settings.heroLogoImage && (
          <img 
            src={settings.heroLogoImage} 
            alt="Logo" 
            className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-hover mb-6 animate-fade-in"
          />
        )}
        
        {settings.heroTitle && (
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-white max-w-4xl mb-4 leading-tight animate-fade-in">
            {settings.heroTitle}
          </h2>
        )}
        
        {settings.heroSubtitle && (
          <p className="text-lg md:text-xl text-white/90 max-w-2xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {settings.heroSubtitle}
          </p>
        )}
        
        <Button 
          onClick={() => {
            const firstSection = document.querySelector('main section[id^="section-"]');
            firstSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          size="lg"
          className="mt-6 animate-fade-in"
          style={{ animationDelay: '0.2s' }}
        >
          Ver cardápio
        </Button>
      </div>
    </section>
  );
}
