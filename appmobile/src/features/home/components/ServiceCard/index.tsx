import { Image, Pressable, Text, View } from 'react-native';

import { useT } from '@/features/i18n/context/LocaleContext';
import type { FeaturedService } from '@/features/home/types';
import { Colors } from '@/shared/constants/colors';

interface ServiceCardProps {
    readonly service: FeaturedService;
    readonly onBook: (id: string) => void;
}

function StarRating({ value }: { value: number }): React.JSX.Element {
    const full = Math.floor(value);
    const stars = Array.from({ length: 5 }, (_, i) => (i < full ? '★' : '☆'));
    return (
        <View className="flex-row items-center gap-[3px]">
            <Text className="text-xs text-star tracking-[1px]">{stars.join('')}</Text>
            <Text className="text-xs font-semibold text-onSurface">{value.toFixed(1)}</Text>
        </View>
    );
}

export function ServiceCard({ service, onBook }: ServiceCardProps): React.JSX.Element {
    const t = useT();
    return (
        <View
            className="w-[240px] bg-surfaceContainerLowest rounded-xl overflow-hidden border border-outlineVariant"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.08,
                shadowRadius: 10,
                elevation: 3,
            }}
        >
            <Image
                source={{ uri: service.imageUrl }}
                className="w-full h-[144px] bg-surfaceContainerHigh"
                resizeMode="cover"
            />

            <View className="p-3 gap-1.5">
                <Text className="text-sm font-bold text-onSurface leading-[19px]" numberOfLines={2}>
                    {service.title}
                </Text>
                <Text className="text-xs text-onSurfaceVariant leading-4" numberOfLines={1}>
                    {service.providerName}
                </Text>

                <View className="flex-row items-center gap-1">
                    <StarRating value={service.rating} />
                    <Text className="text-[11px] text-onSurfaceVariant">({service.reviewCount})</Text>
                </View>

                <View className="flex-row justify-between items-center mt-1">
                    <Text className="text-[13px] font-bold text-primaryContainer">{service.price}</Text>
                    <Pressable
                        className="bg-primaryContainer rounded-lg px-4 py-2"
                        style={({ pressed }) => pressed ? { opacity: 0.8 } : undefined}
                        onPress={() => onBook(service.id)}
                        accessibilityRole="button"
                    >
                        <Text className="text-onPrimary text-xs font-bold">{t('common.book_now')}</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}
