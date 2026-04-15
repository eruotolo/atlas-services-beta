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
                            className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-lg transition-all hover:border-brand hover:text-brand hover:shadow-xl dark:border-white/10 dark:bg-gray-900/80 dark:text-gray-100 dark:backdrop-blur-md dark:hover:border-brand dark:hover:text-brand-light"
                        >
                            <CategoryIcon
                                name={cat.iconName}
                                size={18}
                                className="text-brand dark:text-brand-light"
                            />
                            {cat.name}
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
