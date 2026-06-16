import { apiClient } from '@/shared/lib/apiClient';
import type { ApiCategory, GetServicesParams, MyService, ServiceDetailFull, ServiceListItem, ServicesListResponse } from '@/features/services/types';

// Raw shapes returned by the backend (may differ from app interfaces)
interface RawServiceItem {
    readonly id: string;
    readonly slug: string;
    readonly title: string;
    readonly description: string;
    readonly price: number;
    readonly commune: string;
    readonly level: 'BASIC' | 'PREMIUM' | 'FEATURED';
    readonly featured: boolean;
    readonly averageRating: number | null;
    readonly totalRatings: number;
    readonly mainImage: string | null;
    readonly categories: readonly ApiCategory[];
    readonly userId: string;
    readonly userName: string;
    readonly userAvatar: string | null;
    readonly isTopPro: boolean;
}

interface RawServicesResponse {
    readonly data: readonly RawServiceItem[];
    readonly meta: {
        readonly total: number;
        readonly page: number;
        readonly limit: number;
        readonly totalPages: number;
    };
}

function adaptItem(item: RawServiceItem): ServiceListItem {
    return {
        id: item.id,
        slug: item.slug,
        title: item.title,
        description: item.description,
        price: item.price,
        comuna: item.commune,
        countryCode: '',
        imagenPrincipal: item.mainImage,
        rating: item.averageRating ?? 0,
        reviewsCount: item.totalRatings,
        nivel: item.isTopPro ? 'FEATURED' : item.level,
        destacado: item.featured,
        user: { id: item.userId, name: item.userName, avatar: item.userAvatar },
        categories: item.categories,
    };
}

export async function getServices(params: GetServicesParams): Promise<ServicesListResponse> {
    const search = new URLSearchParams();
    if (params.countryCode) search.set('countryCode', params.countryCode);
    if (params.category && params.category !== 'all') search.set('category', params.category);
    if (params.query) search.set('query', params.query);
    if (params.page !== undefined) search.set('page', String(params.page));
    if (params.limit !== undefined) search.set('limit', String(params.limit));
    if (params.destacado) search.set('destacado', 'true');
    if (params.regionCode) search.set('regionCode', params.regionCode);
    if (params.localitySlug) search.set('localitySlug', params.localitySlug);

    const raw = await apiClient.get<RawServicesResponse>(`/services?${search.toString()}`);

    return {
        services: raw.data.map(adaptItem),
        total: raw.meta.total,
        page: raw.meta.page,
        limit: raw.meta.limit,
    };
}

export async function getServiceBySlug(slug: string): Promise<ServiceDetailFull> {
    return apiClient.get<ServiceDetailFull>(`/services/${slug}`);
}

export async function getCategories(countryCode: string): Promise<readonly ApiCategory[]> {
    return apiClient.get<readonly ApiCategory[]>(`/categories?countryCode=${countryCode}`);
}

interface RawMyService {
    readonly id: string;
    readonly slug: string;
    readonly title: string;
    readonly description: string;
    readonly price: number;
    readonly commune: string;
    readonly averageRating: number | null;
    readonly totalRatings: number;
    readonly mainImage: string | null;
    readonly categories: readonly ApiCategory[];
}

export async function getMyServices(userId: string): Promise<readonly MyService[]> {
    const raw = await apiClient.get<readonly RawMyService[]>(`/users/${userId}/services`);
    return raw.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        description: item.description,
        price: item.price,
        commune: item.commune,
        mainImage: item.mainImage,
        rating: item.averageRating ?? 0,
        reviewsCount: item.totalRatings,
        categories: item.categories,
    }));
}
