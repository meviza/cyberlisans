export interface PublicSeller {
  id: string;
  slug: string;
  companyName: string;
  bio: string | null;
  logoUrl: string | null;
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
  rating: number;
  ratingCount: number;
  totalSales: number;
  joinedAt: string;
  websiteUrl: string | null;
}

export interface FetchResult {
  seller: PublicSeller | null;
  error: boolean;
}
