import { useEffect } from 'react';
import { SiteSettings } from '@/types';

// Convert hex to HSL
const hexToHSL = (hex: string): string => {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return `${h} ${s}% ${l}%`;
};

export function useThemeColors(settings: SiteSettings) {
  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.colorPrimary) {
      root.style.setProperty('--primary', hexToHSL(settings.colorPrimary));
    }
    
    if (settings.colorSecondary) {
      root.style.setProperty('--secondary', hexToHSL(settings.colorSecondary));
    }
    
    if (settings.colorAccent) {
      root.style.setProperty('--accent', hexToHSL(settings.colorAccent));
    }
    
    if (settings.colorBackground) {
      root.style.setProperty('--background', hexToHSL(settings.colorBackground));
    }
    
    if (settings.colorForeground) {
      root.style.setProperty('--foreground', hexToHSL(settings.colorForeground));
      root.style.setProperty('--card-foreground', hexToHSL(settings.colorForeground));
      root.style.setProperty('--popover-foreground', hexToHSL(settings.colorForeground));
    }
  }, [settings.colorPrimary, settings.colorSecondary, settings.colorAccent, settings.colorBackground, settings.colorForeground]);
}
