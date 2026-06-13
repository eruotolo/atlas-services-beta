'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Btn, Icon, Avatar, Mono } from '@/shared/components/hireeo';
import { apiClient } from '@/lib/api/apiClient';

export function MyServiceItem({
    service,
    countryCode,
}: {
    service: any;
    countryCode: string;
}) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete() {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este servicio? Esta acción no se puede deshacer.')) {
            return;
        }
        
        setIsDeleting(true);
        try {
            await apiClient.delete(`/services/${service.id}`);
            router.refresh();
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('No se pudo eliminar el servicio.');
            setIsDeleting(false);
        }
    }

    return (
        <div className="group relative flex flex-col rounded-xl border border-line bg-bg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Image placeholder or real image */}
            <div className="h-40 w-full bg-tint border-b border-line overflow-hidden relative">
                {service.image ? (
                    <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="flex h-full items-center justify-center text-muted">
                        <Icon name="image" size={32} />
                    </div>
                )}
            </div>
            
            <div className="flex flex-col p-4 flex-1">
                <div className="mb-2 flex items-center gap-2">
                    <Mono className="rounded bg-tint px-2 py-0.5 text-[10px] font-semibold text-sub">
                        {service.category}
                    </Mono>
                </div>
                <h3 className="line-clamp-2 text-[15px] font-semibold text-ink leading-snug mb-1">
                    {service.title}
                </h3>
                <p className="line-clamp-2 text-[13px] text-sub mb-4">
                    {service.description}
                </p>
                
                <div className="mt-auto flex items-center justify-between border-t border-line pt-3">
                    <span className="text-[12px] font-medium text-sub">
                        {service.isPremium ? '★ Pro' : 'Estándar'}
                    </span>
                    <div className="flex items-center gap-2">
                        <Btn
                            variant="secondary"
                            size="sm"
                            icon="edit"
                            href={`/${countryCode}/publish/${service.slug}`}
                            disabled={isDeleting}
                        >
                            Editar
                        </Btn>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 cursor-pointer"
                            aria-label="Eliminar servicio"
                            title="Eliminar"
                        >
                            <Icon name="trash" size={14} stroke="currentColor" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
