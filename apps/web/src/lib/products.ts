export interface Product {
  id: string;
  slug: string;
  title: string;
  category: 'Oyun' | 'Yazılım' | 'AI API';
  categorySlug: 'oyun' | 'yazilim' | 'ai-api';
  brand: string;
  image: string;
  images: string[];
  price: number;
  currency: 'TRY';
  stock: number;
  featured: boolean;
  sold: number;
  createdAt: string;
  description: string;
}

export const products: Product[] = [
  {
    id: '1',
    slug: 'steam-wallet-50-try',
    title: 'Steam Cüzdan 50 TL',
    category: 'Oyun',
    categorySlug: 'oyun',
    brand: 'Steam',
    image: 'linear-gradient(135deg,#00F0FF,#FF00C8)',
    images: [
      'linear-gradient(135deg,#00F0FF,#FF00C8)',
      'linear-gradient(135deg,#1B2838,#66C0F4)',
      'linear-gradient(135deg,#171A21,#FF00C8)',
    ],
    price: 50,
    currency: 'TRY',
    stock: 100,
    featured: true,
    sold: 1240,
    createdAt: '2026-06-15',
    description:
      'Steam cüzdan kodunuz ödeme onayı sonrası 5 saniye içinde teslim edilir. Kod Steam hesabınıza bakiye olarak yansır ve tüm Steam mağazasında kullanılabilir. Türkiye bölgesi için geçerlidir.',
  },
  {
    id: '2',
    slug: 'psn-100-usd',
    title: 'PSN 100 USD Bakiye',
    category: 'Oyun',
    categorySlug: 'oyun',
    brand: 'PlayStation',
    image: 'linear-gradient(135deg,#003791,#0066CC)',
    images: [
      'linear-gradient(135deg,#003791,#0066CC)',
      'linear-gradient(135deg,#00439C,#0070D1)',
      'linear-gradient(135deg,#00165A,#003791)',
    ],
    price: 3000,
    currency: 'TRY',
    stock: 80,
    featured: true,
    sold: 850,
    createdAt: '2026-06-10',
    description:
      'PlayStation Store için 100 USD bakiye. ABD bölgesi hesaplarında geçerlidir. Ödeme onayı sonrası saniyeler içinde teslim.',
  },
  {
    id: '3',
    slug: 'xbox-game-pass-1m',
    title: 'Xbox Game Pass 1 Ay',
    category: 'Oyun',
    categorySlug: 'oyun',
    brand: 'Xbox',
    image: 'linear-gradient(135deg,#107C10,#7CFC00)',
    images: [
      'linear-gradient(135deg,#107C10,#7CFC00)',
      'linear-gradient(135deg,#0E5C0E,#5BB318)',
      'linear-gradient(135deg,#107C10,#107C10)',
    ],
    price: 350,
    currency: 'TRY',
    stock: 60,
    featured: true,
    sold: 612,
    createdAt: '2026-06-08',
    description:
      'Xbox Game Pass Ultimate 1 aylık abonelik. Yüzlerce oyuna anında erişim, EA Play dahil. Ödeme sonrası otomatik aktivasyon.',
  },
  {
    id: '4',
    slug: 'riot-vp-2800',
    title: 'Valorant Points 2800',
    category: 'Oyun',
    categorySlug: 'oyun',
    brand: 'Riot',
    image: 'linear-gradient(135deg,#FF4655,#BD3944)',
    images: [
      'linear-gradient(135deg,#FF4655,#BD3944)',
      'linear-gradient(135deg,#1A1A2E,#FF4655)',
      'linear-gradient(135deg,#BD3944,#532430)',
    ],
    price: 600,
    currency: 'TRY',
    stock: 70,
    featured: false,
    sold: 420,
    createdAt: '2026-05-20',
    description:
      'Valorant Points 2800 VP. Riot Games hesabınıza bakiye yüklenir. Tüm bölgelerde geçerli.',
  },
  {
    id: '5',
    slug: 'netflix-premium-1m',
    title: 'Netflix Premium 1 Ay',
    category: 'Yazılım',
    categorySlug: 'yazilim',
    brand: 'Netflix',
    image: 'linear-gradient(135deg,#E50914,#831010)',
    images: [
      'linear-gradient(135deg,#E50914,#831010)',
      'linear-gradient(135deg,#B81D24,#831010)',
      'linear-gradient(135deg,#000000,#E50914)',
    ],
    price: 250,
    currency: 'TRY',
    stock: 90,
    featured: true,
    sold: 2100,
    createdAt: '2026-06-12',
    description: 'Netflix Premium 4K UHD 1 aylık abonelik. Tüm bölgelerde aktif edilir.',
  },
  {
    id: '6',
    slug: 'windows-11-pro',
    title: 'Windows 11 Pro Key',
    category: 'Yazılım',
    categorySlug: 'yazilim',
    brand: 'Microsoft',
    image: 'linear-gradient(135deg,#00A4EF,#0078D4)',
    images: [
      'linear-gradient(135deg,#00A4EF,#0078D4)',
      'linear-gradient(135deg,#0078D4,#005A9E)',
      'linear-gradient(135deg,#1B1B1B,#0078D4)',
    ],
    price: 1200,
    currency: 'TRY',
    stock: 50,
    featured: true,
    sold: 1850,
    createdAt: '2026-04-02',
    description:
      'Windows 11 Professional orijinal ürün anahtarı. Ömür boyu lisans. Tek bilgisayarda aktivasyon. Anında teslim.',
  },
  {
    id: '7',
    slug: 'microsoft-365-personal-1y',
    title: 'Microsoft 365 Personal 1 Yıl',
    category: 'Yazılım',
    categorySlug: 'yazilim',
    brand: 'Microsoft',
    image: 'linear-gradient(135deg,#D83B01,#FF8C00)',
    images: [
      'linear-gradient(135deg,#D83B01,#FF8C00)',
      'linear-gradient(135deg,#B13000,#FF8C00)',
      'linear-gradient(135deg,#1B1B1B,#D83B01)',
    ],
    price: 1500,
    currency: 'TRY',
    stock: 40,
    featured: false,
    sold: 540,
    createdAt: '2026-03-18',
    description:
      'Microsoft 365 Personal 1 yıllık abonelik. Word, Excel, PowerPoint, Outlook, 1TB OneCloud dahil.',
  },
  {
    id: '8',
    slug: 'canva-pro-1y',
    title: 'Canva Pro 1 Yıl',
    category: 'Yazılım',
    categorySlug: 'yazilim',
    brand: 'Canva',
    image: 'linear-gradient(135deg,#00C4CC,#7D2AE8)',
    images: [
      'linear-gradient(135deg,#00C4CC,#7D2AE8)',
      'linear-gradient(135deg,#7D2AE8,#00C4CC)',
      'linear-gradient(135deg,#231942,#00C4CC)',
    ],
    price: 800,
    currency: 'TRY',
    stock: 45,
    featured: false,
    sold: 320,
    createdAt: '2026-05-05',
    description:
      'Canva Pro 1 yıllık abonelik. Premium şablonlar, marka kiti, arka plan kaldırma ve daha fazlası.',
  },
  {
    id: '9',
    slug: 'openai-api-10',
    title: 'OpenAI API $10 Kredi',
    category: 'AI API',
    categorySlug: 'ai-api',
    brand: 'OpenAI',
    image: 'linear-gradient(135deg,#10A37F,#1A7F64)',
    images: [
      'linear-gradient(135deg,#10A37F,#1A7F64)',
      'linear-gradient(135deg,#1A7F64,#0E6E54)',
      'linear-gradient(135deg,#000000,#10A37F)',
    ],
    price: 320,
    currency: 'TRY',
    stock: 100,
    featured: true,
    sold: 940,
    createdAt: '2026-06-01',
    description:
      'OpenAI API platformunda $10 kullanım kredisi. GPT-4, GPT-4o, DALL-E ve tüm OpenAI modellerinde geçerli.',
  },
  {
    id: '10',
    slug: 'claude-api-10',
    title: 'Claude API $10 Kredi',
    category: 'AI API',
    categorySlug: 'ai-api',
    brand: 'Anthropic',
    image: 'linear-gradient(135deg,#D97757,#C56441)',
    images: [
      'linear-gradient(135deg,#D97757,#C56441)',
      'linear-gradient(135deg,#C56441,#A14F2E)',
      'linear-gradient(135deg,#1B1B1B,#D97757)',
    ],
    price: 320,
    currency: 'TRY',
    stock: 100,
    featured: true,
    sold: 760,
    createdAt: '2026-06-04',
    description:
      'Anthropic Claude API $10 kredi. Claude Opus, Sonnet, Haiku tüm modellerde kullanılabilir.',
  },
  {
    id: '11',
    slug: 'spotify-premium-3m',
    title: 'Spotify Premium 3 Ay',
    category: 'Yazılım',
    categorySlug: 'yazilim',
    brand: 'Spotify',
    image: 'linear-gradient(135deg,#1DB954,#191414)',
    images: [
      'linear-gradient(135deg,#1DB954,#191414)',
      'linear-gradient(135deg,#191414,#1DB954)',
      'linear-gradient(135deg,#121212,#1DB954)',
    ],
    price: 450,
    currency: 'TRY',
    stock: 75,
    featured: false,
    sold: 680,
    createdAt: '2026-04-25',
    description:
      'Spotify Premium 3 aylık bireysel abonelik. Reklamsız müzik, çevrimdışı dinleme, yüksek ses kalitesi.',
  },
  {
    id: '12',
    slug: 'discord-nitro-1m',
    title: 'Discord Nitro 1 Ay',
    category: 'Yazılım',
    categorySlug: 'yazilim',
    brand: 'Discord',
    image: 'linear-gradient(135deg,#5865F2,#404EED)',
    images: [
      'linear-gradient(135deg,#5865F2,#404EED)',
      'linear-gradient(135deg,#404EED,#5865F2)',
      'linear-gradient(135deg,#2C2F33,#5865F2)',
    ],
    price: 200,
    currency: 'TRY',
    stock: 85,
    featured: false,
    sold: 410,
    createdAt: '2026-05-12',
    description:
      'Discord Nitro 1 aylık abonelik. HD emoji, özel etiket, büyük dosya yükleme ve daha fazlası.',
  },
];

export const featuredProducts = products.filter((p) => p.featured);

export const categories = [
  {
    slug: 'oyun',
    name: 'Oyun',
    icon: 'gamepad',
    count: products.filter((p) => p.categorySlug === 'oyun').length,
  },
  {
    slug: 'yazilim',
    name: 'Yazılım',
    icon: 'package',
    count: products.filter((p) => p.categorySlug === 'yazilim').length,
  },
  {
    slug: 'ai-api',
    name: 'AI API',
    icon: 'sparkles',
    count: products.filter((p) => p.categorySlug === 'ai-api').length,
  },
];

export function findProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function findRelated(product: Product, limit = 4): Product[] {
  return products
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.categorySlug === product.categorySlug || p.brand === product.brand),
    )
    .slice(0, limit);
}

export function getSoldCounts(): Record<string, number> {
  const map: Record<string, number> = {};
  for (const p of products) map[p.id] = p.sold;
  return map;
}
