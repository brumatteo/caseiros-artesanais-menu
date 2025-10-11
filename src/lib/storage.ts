import { AppData, SiteSettings, Product, Extra, Tag, ProductSection } from '@/types';
import heroCakesImg from '@/assets/hero-cakes.jpg';
import boloChocolateImg from '@/assets/bolo-chocolate.jpg';
import boloMescladoImg from '@/assets/bolo-mesclado.jpg';
import boloBaunilhaImg from '@/assets/bolo-baunilha.jpg';
import boloCenouraImg from '@/assets/bolo-cenoura.jpg';
import boloRedVelvetImg from '@/assets/bolo-red-velvet.jpg';
import boloLimaoImg from '@/assets/bolo-limao.jpg';
import coberturaWhiteImg from '@/assets/cobertura-brigadeiro-branco.jpg';
import coberturaTradicionalImg from '@/assets/cobertura-brigadeiro-tradicional.jpg';
import coberturaCocoImg from '@/assets/cobertura-coco.jpg';

const STORAGE_KEY = 'bolos-caseirinhos-data';

const defaultSettings: SiteSettings = {
  brandName: 'Bolos Caseirinhos',
  showLogo: false,
  showName: true,
  showHeroLogo: false,
  heroImage: heroCakesImg,
  heroImagePosition: 'center',
  heroOverlayColor: '#000000',
  heroOverlayOpacity: 0.45,
  heroTitle: 'Bolos caseiros artesanais',
  heroSubtitle: 'Do nosso forno pra sua mesa.',
  whatsappNumber: '5511999999999',
  whatsappMessage: 'Olá! Gostaria de confirmar meu pedido:',
  aboutTitle: 'Sobre Nós',
  aboutText: 'Cada bolo é feito com carinho e dedicação, utilizando apenas ingredientes frescos e de qualidade. Nossa paixão é transformar momentos especiais em memórias deliciosas.',
  showAbout: true,
  extraInfoTitle: 'Informações Adicionais',
  extraInfoText: '• Retirada no local ou entrega (consulte taxa)\n• Prazo mínimo: 48h de antecedência\n• Aceitamos encomendas personalizadas',
  showExtraInfo: true,
  footerText: '© 2025 Bolos Caseirinhos. Feito com amor.',
  adminPassword: 'admin123',
};

const defaultTags: Tag[] = [
  { id: '1', name: 'Destaque', color: '#E88D95', emoji: '⭐' },
  { id: '2', name: 'Promoção', color: '#9DC4A8', emoji: '🎉' },
  { id: '3', name: 'Novidade', color: '#E8C89D', emoji: '✨' },
  { id: '4', name: 'Vegano', color: '#98C9A3', emoji: '🌱' },
  { id: '5', name: 'Sem Lactose', color: '#C9B8E4', emoji: '🥛' },
  { id: '6', name: 'Sem Glúten', color: '#F4C2C2', emoji: '🌾' },
];

const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'Bolo de Chocolate',
    description: 'Bolo fofinho de chocolate com cobertura cremosa',
    image: boloChocolateImg,
    sizes: [
      { id: '1-p', name: 'Pequeno (15cm)', price: 35.00 },
      { id: '1-m', name: 'Médio (20cm)', price: 55.00 },
      { id: '1-g', name: 'Grande (25cm)', price: 75.00 },
    ],
    tags: ['1'],
    order: 1,
  },
  {
    id: '2',
    name: 'Bolo Mesclado',
    description: 'Combinação perfeita de chocolate e baunilha',
    image: boloMescladoImg,
    sizes: [
      { id: '2-p', name: 'Pequeno (15cm)', price: 38.00 },
      { id: '2-m', name: 'Médio (20cm)', price: 58.00 },
      { id: '2-g', name: 'Grande (25cm)', price: 78.00 },
    ],
    tags: ['2'],
    order: 2,
  },
  {
    id: '3',
    name: 'Bolo de Baunilha',
    description: 'Clássico e delicioso bolo de baunilha',
    image: boloBaunilhaImg,
    sizes: [
      { id: '3-p', name: 'Pequeno (15cm)', price: 32.00 },
      { id: '3-m', name: 'Médio (20cm)', price: 52.00 },
      { id: '3-g', name: 'Grande (25cm)', price: 72.00 },
    ],
    tags: [],
    order: 3,
  },
  {
    id: '4',
    name: 'Bolo de Cenoura',
    description: 'Bolo úmido de cenoura com cobertura de chocolate',
    image: boloCenouraImg,
    sizes: [
      { id: '4-p', name: 'Pequeno (15cm)', price: 33.00 },
      { id: '4-m', name: 'Médio (20cm)', price: 53.00 },
      { id: '4-g', name: 'Grande (25cm)', price: 73.00 },
    ],
    tags: ['3'],
    order: 4,
  },
  {
    id: '5',
    name: 'Bolo Red Velvet',
    description: 'Bolo aveludado com cobertura de cream cheese',
    image: boloRedVelvetImg,
    sizes: [
      { id: '5-p', name: 'Pequeno (15cm)', price: 45.00 },
      { id: '5-m', name: 'Médio (20cm)', price: 65.00 },
      { id: '5-g', name: 'Grande (25cm)', price: 85.00 },
    ],
    tags: ['1'],
    order: 5,
  },
  {
    id: '6',
    name: 'Bolo de Limão',
    description: 'Refrescante bolo de limão com cobertura branca',
    image: boloLimaoImg,
    sizes: [
      { id: '6-p', name: 'Pequeno (15cm)', price: 40.00 },
      { id: '6-m', name: 'Médio (20cm)', price: 60.00 },
      { id: '6-g', name: 'Grande (25cm)', price: 80.00 },
    ],
    tags: ['3'],
    order: 6,
  },
];

const defaultSections: ProductSection[] = [
  {
    id: 'section-1',
    name: 'Nossos Bolos',
    visible: true,
    order: 1,
    productIds: ['1', '2', '3', '4'],
  },
  {
    id: 'section-2',
    name: 'Bolos Especiais',
    visible: true,
    order: 2,
    productIds: ['5', '6'],
  },
];

const defaultExtras: Extra[] = [
  {
    id: 'e1',
    name: 'Cobertura de Brigadeiro Branco',
    description: 'Cobertura cremosa e deliciosa',
    image: coberturaWhiteImg,
    price: 12.00,
    order: 1,
  },
  {
    id: 'e2',
    name: 'Cobertura de Brigadeiro Tradicional',
    description: 'O clássico brigadeiro que todos amam',
    image: coberturaTradicionalImg,
    price: 10.00,
    order: 2,
  },
  {
    id: 'e3',
    name: 'Brigadeiro de Coco',
    description: 'Cobertura especial com coco ralado',
    image: coberturaCocoImg,
    price: 13.00,
    order: 3,
  },
];

export function getStoredData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      
      // Migration: Add sections if they don't exist (old data format)
      if (!data.sections || !Array.isArray(data.sections)) {
        const allProductIds = data.products?.map((p: Product) => p.id) || [];
        data.sections = [
          {
            id: 'section-1',
            name: 'Nossos Bolos',
            visible: true,
            order: 1,
            productIds: allProductIds,
          }
        ];
      }
      
      return data;
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
  
  return {
    settings: defaultSettings,
    products: defaultProducts,
    sections: defaultSections,
    extras: defaultExtras,
    tags: defaultTags,
  };
}

export function saveData(data: AppData): boolean {
  try {
    const jsonData = JSON.stringify(data);
    const sizeInMB = new Blob([jsonData]).size / (1024 * 1024);
    
    if (sizeInMB > 4) {
      console.warn(`Dados muito grandes: ${sizeInMB.toFixed(2)}MB. Considere usar imagens menores.`);
    }
    
    localStorage.setItem(STORAGE_KEY, jsonData);
    return true;
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      // Não lançar erro, apenas retornar false para não crashar a aplicação
      return false;
    }
    return false;
  }
}

export function exportData(): string {
  const data = getStoredData();
  return JSON.stringify(data, null, 2);
}

export function importData(jsonString: string): void {
  try {
    const data = JSON.parse(jsonString) as AppData;
    saveData(data);
  } catch (error) {
    throw new Error('Arquivo inválido. Verifique o formato JSON.');
  }
}

export function checkStorageUsage(): { used: number; limit: number; percentage: number } {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  const limit = 5 * 1024 * 1024; // 5MB aproximado
  return {
    used: total,
    limit,
    percentage: (total / limit) * 100,
  };
}
