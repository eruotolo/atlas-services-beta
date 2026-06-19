export type ServiceRequestStatus = 'PENDING' | 'QUOTED' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';

export interface BackendServiceRequest {
    id: string;
    userId: string;
    categoryId: string;
    description: string;
    urgency: string;
    status: ServiceRequestStatus;
    createdAt: string;
}

export interface BackendQuote {
    id: string;
    userId: string;
    serviceRequestId: string;
    price: number;
    message: string;
    accepted: boolean;
    createdAt: string;
    provider: {
        id: string;
        name: string;
        avatar: string | null;
    };
}

export interface ServiceRequestWithQuotes extends BackendServiceRequest {
    quotes: BackendQuote[];
}

export interface EscrowCheckoutResponse {
    quoteId: string;
    amount: number;
    platformFee: number;
    providerAmount: number;
    paymentUrl: string;
}
