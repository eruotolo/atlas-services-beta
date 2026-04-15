import Image from 'next/image';
import Link from 'next/link';

import { CheckCircle, MapPin, Star } from 'lucide-react';

import type { Service } from '@/shared/types/common';

interface ServiceCardLabels {
    featured: string;
    from: string;
    requestQuote: string;
}

interface ServiceCardProps {
    service: Service;
    labels?: ServiceCardLabels;
    locale?: string;
}

const DEFAULT_LABELS: ServiceCardLabels = {
    featured: 'Destacado',
    from: 'Desde',
    requestQuote: 'Solicitar Cotización',
};

export default function ServiceCard({ service, labels = DEFAULT_LABELS, locale = 'es-CL' }: ServiceCardProps) {
    return (
        <Link
            href={`/servicio/${service.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:shadow-xl hover:shadow-brand-marino/5 dark:border-gray-800 dark:bg-gray-900/50 dark:hover:border-brand/50 dark:hover:shadow-brand-marino/20"
        >
            <div className="relative h-48 w-full overflow-hidden">
                <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    quality={80}
                />
                {service.isPremium && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 rounded bg-brand px-2 py-1 text-[10px] font-bold tracking-wider text-white uppercase shadow-lg">
                        <CheckCircle size={10} />
                        {labels.featured}
                    </div>
                )}
            </div>

            <div className="flex flex-grow flex-col p-5">
                <div className="mb-2 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                        {service.categories && service.categories.length > 0 ? (
                            service.categories.slice(0, 2).map((cat) => (
                                <span
                                    key={cat.id}
                                    className="text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-500"
                                >
                                    {cat.nombre}
                                    {service.categories &&
                                        cat !==
                                            service.categories[
                                                Math.min(1, service.categories.length - 1)
                                            ] &&
                                        ' •'}
                                </span>
                            ))
                        ) : (
                            <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-500">
                                {service.category}
                            </span>
                        )}
                        {service.categories && service.categories.length > 2 && (
                            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-600">
                                +{service.categories.length - 2}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 text-yellow-500">
                        <Star size={14} fill="currentColor" />
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            {service.reviewsCount > 0
                                ? Number.isInteger(service.rating)
                                    ? service.rating
                                    : service.rating.toFixed(1)
                                : '0'}
                        </span>
                        <span className="text-xs font-normal text-gray-500 dark:text-gray-500">
                            ({service.reviewsCount})
                        </span>
                    </div>
                </div>

                <h3 className="mb-2 line-clamp-1 text-lg font-bold text-gray-900 capitalize transition-colors group-hover:text-brand dark:text-gray-100 dark:group-hover:text-brand-light">
                    {service.title}
                </h3>

                <p className="mb-4 line-clamp-2 flex-grow text-sm text-gray-500 dark:text-gray-400">
                    {service.description.length > 65
                        ? `${service.description.substring(0, 65)}...`
                        : service.description}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4 dark:border-gray-800">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                        <MapPin size={14} />
                        <span>{service.comuna}</span>
                    </div>
                    <div className="text-right">
                        {service.price > 0 ? (
                            <>
                                <p className="text-[10px] font-medium text-gray-500 uppercase dark:text-gray-500">
                                    {labels.from}
                                </p>
                                <p className="text-lg font-bold text-brand dark:text-brand-light">
                                    ${service.price.toLocaleString(locale)}
                                </p>
                            </>
                        ) : (
                            <p className="text-sm font-bold text-brand dark:text-brand-light">
                                {labels.requestQuote}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
