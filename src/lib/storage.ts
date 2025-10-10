import { AppData, SiteSettings, Product, Extra, Tag } from '@/types';
import heroImage from '@/assets/hero-cakes.jpg';

const STORAGE_KEY = 'bolos-caseirinhos-data';

const defaultSettings: SiteSettings = {
  brandName: 'Bolos Caseirinhos',
  showLogo: false,
  showName: true,
  showHeroLogo: false,
  heroImage: heroImage,
  heroOverlayColor: '#000000',
  heroOverlayOpacity: 0.45,
  heroTitle: 'Os bolos caseirinhos mais fofinhos e saborosos que você já provou.',
  heroSubtitle: 'Feitos com amor e ingredientes selecionados',
  whatsappNumber: '5511999999999',
  aboutTitle: 'Sobre Nós',
  aboutText: 'Cada bolo é feito com carinho e dedicação, utilizando apenas ingredientes frescos e de qualidade. Nossa paixão é transformar momentos especiais em memórias deliciosas.',
  showAbout: true,
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
    sizes: [
      { id: '4-p', name: 'Pequeno (15cm)', price: 33.00 },
      { id: '4-m', name: 'Médio (20cm)', price: 53.00 },
      { id: '4-g', name: 'Grande (25cm)', price: 73.00 },
    ],
    tags: ['3'],
    order: 4,
  },
];

const defaultExtras: Extra[] = [
  {
    id: 'e1',
    name: 'Cobertura de Brigadeiro Branco',
    description: 'Cobertura cremosa e deliciosa',
    price: 12.00,
    order: 1,
  },
  {
    id: 'e2',
    name: 'Cobertura de Brigadeiro Tradicional',
    description: 'O clássico brigadeiro que todos amam',
    price: 10.00,
    order: 2,
  },
  {
    id: 'e3',
    name: 'Brigadeira de Coco',
    description: 'Cobertura especial com coco ralado',
    price: 13.00,
    order: 3,
  },
];

export function getStoredData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
  
  return {
    settings: defaultSettings,
    products: defaultProducts,
    extras: defaultExtras,
    tags: defaultTags,
  };
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    throw new Error('Não foi possível salvar. Verifique o espaço de armazenamento.');
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
