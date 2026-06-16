export type LeadUrgency = 'urgent' | 'this_week' | 'whenever';

export interface LeadClient {
    id: string;
    name: string;
    avatar: string | null;
}

export interface LeadCategory {
    id: string;
    name: string;
    slug: string;
}

/** ServiceRequest disponible para que el pro cotice */
export interface AvailableLead {
    id: string;
    description: string;
    urgency: LeadUrgency;
    status: 'PENDING' | 'QUOTED';
    createdAt: string;
    category: LeadCategory;
    user: LeadClient;
    quotes: { id: string }[];
}

/** Cotización que el pro ya envió */
export interface SentQuote {
    id: string;
    price: number;
    message: string;
    accepted: boolean;
    createdAt: string;
    serviceRequest: {
        id: string;
        description: string;
        status: string;
        category: LeadCategory;
        user: LeadClient;
    };
}
