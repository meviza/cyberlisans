export interface CategoryOption {
  value: string;
  label: string;
}

export const DEFAULT_CATEGORIES: CategoryOption[] = [
  { value: 'oyun', label: 'Oyun' },
  { value: 'yazilim', label: 'Yazılım' },
  { value: 'ai-api', label: 'AI API' },
];

export const DEFAULT_BRANDS: CategoryOption[] = [
  { value: 'Steam', label: 'Steam' },
  { value: 'PlayStation', label: 'PlayStation' },
  { value: 'Xbox', label: 'Xbox' },
  { value: 'Netflix', label: 'Netflix' },
  { value: 'Spotify', label: 'Spotify' },
  { value: 'Microsoft', label: 'Microsoft' },
  { value: 'OpenAI', label: 'OpenAI' },
  { value: 'Anthropic', label: 'Anthropic' },
];

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}
