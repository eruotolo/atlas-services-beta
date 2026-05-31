import type { ReactElement } from 'react';

import type { Dictionary } from '@/lib/i18n/types';
import { Icon, Mono } from '@/shared/components/hireeo';

interface ServiceTrustCardProps {
    dict: Dictionary;
}

export function ServiceTrustCard({ dict }: ServiceTrustCardProps): ReactElement {
    const items = [
        dict.serviceDetail.trustIdentity,
        dict.serviceDetail.trustBackground,
        dict.serviceDetail.trustCertification,
        dict.serviceDetail.trustContact,
    ];

    return (
        <div
            className="mt-3 rounded-xl border p-4"
            style={{
                borderColor: 'var(--line)',
                background: 'var(--tint)',
            }}
        >
            <Mono
                className="text-[10.5px] font-semibold"
                style={{ color: 'var(--sub)', letterSpacing: '0.08em' }}
            >
                {dict.serviceDetail.trustLabel}
            </Mono>
            <div className="mt-3 flex flex-col gap-2">
                {items.map((item) => (
                    <div
                        key={item}
                        className="flex items-center gap-2 text-[12.5px]"
                        style={{ color: 'var(--ink)' }}
                    >
                        <Icon name="check" size={12} stroke="var(--success)" strokeWidth={2.4} />
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
}
