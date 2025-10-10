import { SiteSettings } from '@/types';

interface HeroProps {
  settings: SiteSettings;
}

export function Hero({ settings }: HeroProps) {
  const overlayStyle = {
    backgroundColor: settings.heroOverlayColor,
    opacity: settings.heroOverlayOpacity,
  };

  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
      {/* Background Image */}
      {settings.heroImage ? (
        <img 
          src={settings.heroImage} 
          alt="Hero background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20" />
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
        
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-white max-w-4xl mb-4 leading-tight animate-fade-in">
          {settings.heroTitle}
        </h2>
        
        {settings.heroSubtitle && (
          <p className="text-lg md:text-xl text-white/90 max-w-2xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {settings.heroSubtitle}
          </p>
        )}
      </div>
    </section>
  );
}
