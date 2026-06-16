export interface ServiceCategory {
    readonly id: string;
    readonly label: string;
    readonly icon: string;
}

export interface ServiceProvider {
    readonly id: string;
    readonly name: string;
    readonly role: string;
    readonly rating: number;
    readonly reviewCount: number;
    readonly pricePerHour: number;
    readonly imageUrl: string;
    readonly isTopRated?: boolean;
}

export interface ServiceDetailItem {
    readonly id: string;
    readonly icon: string;
    readonly label: string;
}

export interface ServiceReview {
    readonly id: string;
    readonly authorName: string;
    readonly authorAvatarUrl: string;
    readonly text: string;
}

export interface ServiceDetail extends ServiceProvider {
    readonly serviceType: string;
    readonly location: string;
    readonly about: string;
    readonly details: readonly ServiceDetailItem[];
    readonly reviews: readonly ServiceReview[];
}

// Backend API shapes
export interface ApiCategory {
    readonly id: string;
    readonly name: string;
    readonly slug: string;
    readonly icon: string | null;
}

export interface ServiceUser {
    readonly id: string;
    readonly name: string;
    readonly avatar: string | null;
}

export interface ServiceListItem {
    readonly id: string;
    readonly slug: string;
    readonly title: string;
    readonly description: string;
    readonly price: number;
    readonly comuna: string;
    readonly countryCode: string;
    readonly imagenPrincipal: string | null;
    readonly rating: number;
    readonly reviewsCount: number;
    readonly nivel: 'BASIC' | 'PREMIUM' | 'FEATURED';
    readonly destacado: boolean;
    readonly user: ServiceUser;
    readonly categories: readonly ApiCategory[];
}

export interface ServiceRating {
    readonly id: string;
    readonly score: number;
    readonly comment: string | null;
    readonly createdAt: string;
    readonly user: { readonly name: string };
    readonly reply: string | null;
}

export interface SocialLink {
    readonly id: string;
    readonly type: string;
    readonly url: string;
}

export interface ServiceDetailFull extends ServiceListItem {
    readonly userEmail: string | null;
    readonly userPhone: string | null;
    readonly imagenes: readonly string[];
    readonly socialMedia: readonly SocialLink[];
    readonly ratings: readonly ServiceRating[];
    readonly subscription: { readonly active: boolean; readonly endDate: string | null } | null;
}

export interface ServicesListResponse {
    readonly services: readonly ServiceListItem[];
    readonly total: number;
    readonly page: number;
    readonly limit: number;
}

export interface MyService {
    readonly id: string;
    readonly slug: string;
    readonly title: string;
    readonly description: string;
    readonly price: number;
    readonly commune: string;
    readonly mainImage: string | null;
    readonly rating: number;
    readonly reviewsCount: number;
    readonly categories: readonly ApiCategory[];
}

export interface GetServicesParams {
    readonly countryCode?: string;
    readonly category?: string;
    readonly query?: string;
    readonly page?: number;
    readonly limit?: number;
    readonly destacado?: boolean;
    readonly regionCode?: string;
    readonly localitySlug?: string;
}
