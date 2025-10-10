export interface Product {
  id: string;
  name: string;
  description: string;
  image?: string;
  sizes: ProductSize[];
  tags: string[];
  order: number;
}

export interface ProductSize {
  id: string;
  name: string;
  price: number;
}

export interface Extra {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  order: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  emoji?: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  sizeId: string;
  sizeName: string;
  price: number;
  quantity: number;
  type: 'product' | 'extra';
}

export interface SiteSettings {
  brandName: string;
  showLogo: boolean;
  showName: boolean;
  logoImage?: string;
  heroLogoImage?: string;
  showHeroLogo: boolean;
  heroImage?: string;
  heroOverlayColor: string;
  heroOverlayOpacity: number;
  heroTitle: string;
  heroSubtitle: string;
  whatsappNumber: string;
  aboutTitle: string;
  aboutText: string;
  aboutImage?: string;
  showAbout: boolean;
  extraInfoText: string;
  showExtraInfo: boolean;
  footerText: string;
  instagramUrl?: string;
  adminPassword: string;
}

export interface AppData {
  settings: SiteSettings;
  products: Product[];
  extras: Extra[];
  tags: Tag[];
}
