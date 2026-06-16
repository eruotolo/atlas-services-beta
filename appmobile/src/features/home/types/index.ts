export interface Category {
  readonly id: string;
  readonly name: string;
  readonly symbol: string;
  readonly fallback: string;
  readonly iconName: string;
}

export interface FeaturedService {
  readonly id: string;
  readonly title: string;
  readonly price: string;
  readonly rating: number;
  readonly reviewCount: number;
  readonly imageUrl: string;
  readonly providerName: string;
}

export interface ActiveBooking {
  readonly id: string;
  readonly serviceType: string;
  readonly providerName: string;
  readonly etaMinutes?: number;
  readonly status: 'en_route' | 'arrived' | 'in_progress';
}
