import type { ReactElement } from 'react';

import type { Dictionary } from '@/lib/i18n/types';
import { Avatar, Icon, Pill, Stars } from '@/shared/components/hireeo';
import { AnimatedRotatingText } from '@/shared/components/hireeo/ui/AnimatedRotatingText';

import type { ServiceDetail } from './types';

interface ServiceHeroProps {
    dict: Dictionary;
    service: ServiceDetail;
    professionalName: string;
}

function buildSubtitle(service: ServiceDetail, dict: Dictionary): string {
    const parts: string[] = [];
    if (service.category) parts.push(service.category);
    if (service.comuna) parts.push(service.comuna);
    const startYear = service.fechaInicio ? new Date(service.fechaInicio).getFullYear() : null;
    if (startYear) parts.push(`${dict.serviceDetail.heroSince} ${startYear}`);
    return parts.join(' · ');
}

export function ServiceHero({
    dict,
    service,
    professionalName,
}: ServiceHeroProps): ReactElement {
    const subtitle = buildSubtitle(service, dict);

    return (
        <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-start">
            <Avatar name={professionalName} size={88} ring />

            <div className="flex-1 min-w-0">
                <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
                    <h1
                        className="m-0 truncate font-medium text-ink"
                        style={{
                            fontSize: 32,
                            letterSpacing: '-0.025em',
                            lineHeight: 1.1}} 
                    >
                        <AnimatedRotatingText
                            delay={300}
                            speed={40}
                            segments={[{ text: professionalName }]}
                        />
                    </h1>
                    {service.isPremium ? (
                        <Pill tone="accent" icon="sparkle">
                            {dict.search.tierPro}
                        </Pill>
                    ) : null}
                </div>

                {subtitle ? (
                    <div
                        className="mb-3 text-[14.5px] text-sub"
                    >
                        {subtitle}
                    </div>
                ) : null}

                <div
                    className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-sub"
                >
                    <Stars
                        rating={service.rating}
                        size={12}
                        showNum
                        count={service.reviewsCount}
                    />
                    <span className="inline-flex items-center gap-1.5">
                        <Icon name="clock" size={12} />
                        {dict.serviceDetail.heroResponseTime}
                    </span>
                    {service.reviewsCount > 0 ? (
                        <span className="inline-flex items-center gap-1.5">
                            <Icon name="check" size={12} stroke="var(--success)" />
                            <span className="font-medium text-ink">
                                {service.reviewsCount}
                            </span>{' '}
                            {dict.serviceDetail.heroCompletion}
                        </span>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
