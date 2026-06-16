import { Pressable, ScrollView, Text, View } from 'react-native';

import { ServiceCard } from '@/features/home/components/ServiceCard';
import { useT } from '@/features/i18n/context/LocaleContext';
import type { FeaturedService } from '@/features/home/types';

interface FeaturedCarouselProps {
    readonly services: readonly FeaturedService[];
    readonly onBook: (id: string) => void;
    readonly onSeeAll?: () => void;
}

export function FeaturedCarousel({ services, onBook, onSeeAll }: FeaturedCarouselProps): React.JSX.Element {
    const t = useT();
    return (
        <View className="gap-[14px]">
            <View className="flex-row justify-between items-center px-5">
                <Text className="text-xl font-semibold text-primary tracking-[-0.2px]">
                    {t('home.featured_services')}
                </Text>
                {onSeeAll != null && (
                    <Pressable onPress={onSeeAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text className="text-sm font-semibold text-secondary">{t('home.see_all')}</Text>
                    </Pressable>
                )}
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="px-5 gap-[14px] py-1"
            >
                {services.map((service) => (
                    <ServiceCard key={service.id} service={service} onBook={onBook} />
                ))}
            </ScrollView>
        </View>
    );
}
