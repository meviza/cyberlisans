export interface Product {
  id: string;
  slug: string;
  title: string;
  category: 'Oyun' | 'Yazılım' | 'AI API';
  brand: string;
  image: string;
  price: number;
  currency: 'TRY';
  stock: number;
  featured: boolean;
}

export const products: Product[] = [
  { id: '1', slug: 'steam-wallet-50-try', title: 'Steam Cüzdan 50 TL', category: 'Oyun', brand: 'Steam', image: 'linear-gradient(135deg,#00F0FF,#FF00C8)', price: 50, currency: 'TRY', stock: 100, featured: true },
  { id: '2', slug: 'psn-100-usd', title: 'PSN 100 USD Bakiye', category: 'Oyun', brand: 'PlayStation', image: 'linear-gradient(135deg,#003791,#0066CC)', price: 3000, currency: 'TRY', stock: 80, featured: true },
  { id: '3', slug: 'xbox-game-pass-1m', title: 'Xbox Game Pass 1 Ay', category: 'Oyun', brand: 'Xbox', image: 'linear-gradient(135deg,#107C10,#7CFC00)', price: 350, currency: 'TRY', stock: 60, featured: true },
  { id: '4', slug: 'riot-vp-2800', title: 'Valorant Points 2800', category: 'Oyun', brand: 'Riot', image: 'linear-gradient(135deg,#FF4655,#BD3944)', price: 600, currency: 'TRY', stock: 70, featured: false },
  { id: '5', slug: 'netflix-premium-1m', title: 'Netflix Premium 1 Ay', category: 'Yazılım', brand: 'Netflix', image: 'linear-gradient(135deg,#E50914,#831010)', price: 250, currency: 'TRY', stock: 90, featured: true },
  { id: '6', slug: 'windows-11-pro', title: 'Windows 11 Pro Key', category: 'Yazılım', brand: 'Microsoft', image: 'linear-gradient(135deg,#00A4EF,#0078D4)', price: 1200, currency: 'TRY', stock: 50, featured: true },
  { id: '7', slug: 'microsoft-365-personal-1y', title: 'Microsoft 365 Personal 1 Yıl', category: 'Yazılım', brand: 'Microsoft', image: 'linear-gradient(135deg,#D83B01,#FF8C00)', price: 1500, currency: 'TRY', stock: 40, featured: false },
  { id: '8', slug: 'canva-pro-1y', title: 'Canva Pro 1 Yıl', category: 'Yazılım', brand: 'Canva', image: 'linear-gradient(135deg,#00C4CC,#7D2AE8)', price: 800, currency: 'TRY', stock: 45, featured: false },
  { id: '9', slug: 'openai-api-10', title: 'OpenAI API $10 Kredi', category: 'AI API', brand: 'OpenAI', image: 'linear-gradient(135deg,#10A37F,#1A7F64)', price: 320, currency: 'TRY', stock: 100, featured: true },
  { id: '10', slug: 'claude-api-10', title: 'Claude API $10 Kredi', category: 'AI API', brand: 'Anthropic', image: 'linear-gradient(135deg,#D97757,#C56441)', price: 320, currency: 'TRY', stock: 100, featured: true },
  { id: '11', slug: 'spotify-premium-3m', title: 'Spotify Premium 3 Ay', category: 'Yazılım', brand: 'Spotify', image: 'linear-gradient(135deg,#1DB954,#191414)', price: 450, currency: 'TRY', stock: 75, featured: false },
  { id: '12', slug: 'discord-nitro-1m', title: 'Discord Nitro 1 Ay', category: 'Yazılım', brand: 'Discord', image: 'linear-gradient(135deg,#5865F2,#404EED)', price: 200, currency: 'TRY', stock: 85, featured: false },
];

export const featuredProducts = products.filter((p) => p.featured);

export const categories = [
  { slug: 'oyun', name: 'Oyun', icon: 'gamepad', count: 4 },
  { slug: 'yazilim', name: 'Yazılım', icon: 'package', count: 6 },
  { slug: 'ai-api', name: 'AI API', icon: 'sparkles', count: 2 },
];
