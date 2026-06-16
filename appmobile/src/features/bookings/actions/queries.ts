import { apiClient } from '@/shared/lib/apiClient';
import type { ServiceRequest } from '@/features/bookings/types';

export async function getServiceRequests(): Promise<readonly ServiceRequest[]> {
    return apiClient.get<readonly ServiceRequest[]>('/service-requests');
}
