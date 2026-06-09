import Link from 'next/link';
import type { ReactElement } from 'react';

import type { Dictionary } from '@/lib/i18n/types';
import { Icon, Mono, SectionLabel } from '@/shared/components/hireeo';
import { AnimatedRotatingText } from '@/shared/components/hireeo/ui/AnimatedRotatingText';
import type { HireIconName } from '@/shared/components/hireeo/icons';

interface Category {
    id: string;
    nombre: string;
    slug: string;
    icono: string | null;
}

interface CategoriesGridSectionProps {
    country: string;
    dict: Dictionary;
    categories: readonly Category[];
}

const ICON_FALLBACK: HireIconName = 'sparkle';

const CATEGORY_ICON_MAP: Record<string, HireIconName> = {
    Zap: 'zap',
    Droplets: 'droplet',
    Hammer: 'hammer',
    Brush: 'brush',
    PaintBrush: 'brush',
    Truck: 'truck',
    Package: 'pkg',
    Wind: 'wind',
    Key: 'key',
    Shield: 'shield',
    Sparkles: 'sparkle',
    CheckCircle: 'check',
    Check: 'check',
    Bolt: 'bolt',
    Wrench: 'hammer',
};

function resolveIcon(icono: string | null): HireIconName {
    if (!icono) return ICON_FALLBACK;
    return CATEGORY_ICON_MAP[icono] ?? ICON_FALLBACK;
}

export function CategoriesGridSection({
    country,
    dict,
    categories,
}: CategoriesGridSectionProps): ReactElement {
    const list = categories.slice(0, 12);
    return (
        <section
            className="border-t"
            style={{ borderColor: 'var(--line)', background: 'var(--bg)' }}
        >
            <div className="mx-auto max-w-site px-6 py-20 sm:px-10 lg:px-14">
                <div className="mb-8 flex items-end justify-between gap-4">
                    <div>
                        <SectionLabel>{dict.home.categories2.eyebrow}</SectionLabel>
                        <h2
                            className="m-0 mt-3"
                            style={{
                                fontSize: 'clamp(28px, 3.5vw, 38px)',
                                fontWeight: 500,
                                letterSpacing: '-0.03em',
                                lineHeight: 1,
                                color: 'var(--ink)',
                            }}
                        >
                            <AnimatedRotatingText
                                delay={200}
                                speed={40}
                                segments={[{ text: dict.home.categories2.title }]}
                            />
                        </h2>
                    </div>
                    <Link
                        href={`/${country}/search`}
                        className="inline-flex items-center gap-1.5 text-[13px]"
                        style={{ color: 'var(--sub)' }}
                    >
                        {dict.home.categories2.viewAll}
                        <Icon name="arrow" size={12} />
                    </Link>
                </div>

                <div
                    className="grid grid-cols-2 border-t border-l sm:grid-cols-3 md:grid-cols-4"
                    style={{ borderColor: 'var(--line)' }}
                >
                    {list.map((cat, i) => (
                        <Link
                            key={cat.id}
                            href={`/${country}/search?categoria=${cat.slug}`}
                            className="flex items-center justify-between border-r border-b p-5 transition-colors hover:bg-tint"
                            style={{ borderColor: 'var(--line)' }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md"
                                    style={{ background: 'var(--tint)' }}
                                >
                                    <Icon
                                        name={resolveIcon(cat.icono)}
                                        size={14}
                                    />
                                </div>
                                <div>
                                    <Mono
                                        className="text-[10px]"
                                        style={{
                                            color: 'var(--sub)',
                                            letterSpacing: '0.06em',
                                        }}
                                    >
                                        {String(i + 1).padStart(2, '0')}
                                    </Mono>
                                    <div
                                        className="mt-[2px] text-[14px] font-medium"
                                        style={{ color: 'var(--ink)' }}
                                    >
                                        {cat.nombre}
                                    </div>
                                </div>
                            </div>
                            <Icon name="arrowUR" size={14} />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
