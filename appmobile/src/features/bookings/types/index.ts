export type BookingStatus = 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type BookingTab = 'upcoming' | 'past';

export interface Booking {
    id: string;
    providerName: string;
    providerAvatarUrl: string | null;
    dateLabel: string;
    status: BookingStatus;
    serviceSlug?: string;
}

// Backend API shape
export type ServiceRequestStatus = 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface ServiceRequest {
    readonly id: string;
    readonly status: ServiceRequestStatus;
    readonly description: string | null;
    readonly createdAt: string;
    readonly service: {
        readonly id: string;
        readonly slug?: string;
        readonly title: string;
        readonly imagenPrincipal: string | null;
        readonly user: { readonly name: string; readonly avatar: string | null };
    };
}
