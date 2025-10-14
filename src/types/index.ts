export interface Product {
  id: string;
  name: string;
  description: string;
  image?: string;
  showImage?: boolean;
  sizes: ProductSize[];
  tags: string[];
  order: number;
}

export interface ProductSection {
  id: string;
  name: string;
  visible: boolean;
  order: number;
  productIds: string[];
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
  showImage?: boolean;
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
  heroImagePosition?: string;
  heroOverlayColor: string;
  heroOverlayOpacity: number;
  heroTitle: string;
  heroSubtitle: string;
  whatsappNumber: string;
  whatsappMessage: string;
  aboutTitle: string;
  aboutText: string;
  aboutImage?: string;
  showAbout: boolean;
  showAboutImage?: boolean;
  extraInfoTitle: string;
  extraInfoText: string;
  showExtraInfo: boolean;
  footerText: string;
  footerAddress?: string;
  footerPhone?: string;
  instagramUrl?: string;
  adminPassword: string;
  // Theme colors (apenas 2 editáveis)
  colorBackgroundRosa?: string;
  colorButtonPrimary?: string;
}

export interface AppData {
  settings: SiteSettings;
  products: Product[];
  sections: ProductSection[];
  extras: Extra[];
  tags: Tag[];
}
