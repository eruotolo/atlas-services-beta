import Link from 'next/link';

import { CategoryIcon } from '@/shared/components/icons/CategoryIcons';

interface HeroCategoryItem {
    name: string;
    iconName: string;
    category: string;
}

interface HeroCategoriesProps {
    categories: HeroCategoryItem[];
}

export default function HeroCategories({ categories }: HeroCategoriesProps) {
    return (
        <section className="bg-background w-full pb-[20px]">
            <div className="relative z-10 container mx-auto -mt-12 max-w-6xl px-4">
                <div className="flex flex-wrap justify-center gap-4">
                    {categories.map((cat) => (
                        <Link
                            key={cat.name}
                            href={`/buscar?c=${cat.category}`}
                            className="stagger-item flex items-center gap-2 rounded-2xl border border-line bg-bg px-6 py-3 text-sm font-semibold text-sub shadow-lg transition-all hover:border-brand hover:text-brand hover:shadow-xl"
                        >
                            <CategoryIcon
                                name={cat.iconName}
                                size={18}
                                className="text-brand"
                            />
                            {cat.name}
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
