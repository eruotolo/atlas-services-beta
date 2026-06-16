import { Image, Pressable, Text, View } from 'react-native';

import { useT } from '@/features/i18n/context/LocaleContext';
import type { ServiceProvider } from '@/features/services/types';
import { Icon } from '@/shared/components/Icon';
import { Colors } from '@/shared/constants/colors';

interface ServiceProviderCardProps {
    readonly provider: ServiceProvider;
    readonly onPress: (id: string) => void;
    readonly onBook: (id: string) => void;
    readonly onToggleFavorite: (id: string) => void;
    readonly isFavorite?: boolean;
}

export function ServiceProviderCard({
    provider,
    onPress,
    onBook,
    onToggleFavorite,
    isFavorite = false,
}: ServiceProviderCardProps): React.JSX.Element {
    const t = useT();
    return (
        <Pressable
            className="bg-surfaceContainerLowest rounded-xl overflow-hidden border border-[rgba(227,226,232,0.5)]"
            style={({ pressed }) => ({
                ...(pressed ? { opacity: 0.95 } : {}),
                shadowColor: Colors.primaryContainer,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 20,
                elevation: 3,
            })}
            onPress={() => onPress(provider.id)}
            accessibilityRole="button"
            accessibilityLabel={`View ${provider.name}`}
        >
            {/* Image */}
            <View className="h-48 relative overflow-hidden">
                <Image source={{ uri: provider.imageUrl }} className="w-full h-full bg-surfaceContainerHigh" resizeMode="cover" />

                {/* Favorite button */}
                <Pressable
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[rgba(255,255,255,0.8)] justify-center items-center"
                    style={({ pressed }) => ({
                        ...(pressed ? { opacity: 0.7 } : {}),
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1,
                    })}
                    onPress={() => onToggleFavorite(provider.id)}
                    accessibilityRole="button"
                    accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    hitSlop={8}
                >
                    <Icon
                        name={isFavorite ? 'heart-filled' : 'heart'}
                        size={18}
                        color={isFavorite ? Colors.error : Colors.onSurfaceVariant}
                    />
                </Pressable>

                {/* Rating badge */}
                <View
                    className="absolute bottom-3 left-3 flex-row items-center gap-1 bg-[rgba(255,255,255,0.9)] rounded-[20px] px-3 py-1"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1,
                    }}
                >
                    <Icon name="star-filled" size={14} color={Colors.secondary} />
                    <Text className="text-xs font-bold text-onSurface">{provider.rating.toFixed(1)}</Text>
                    <Text className="text-xs text-onSurfaceVariant">({provider.reviewCount})</Text>
                </View>
            </View>

            {/* Body */}
            <View className="p-4 gap-1">
                <View className="flex-row items-center justify-between gap-2">
                    <Text className="text-xl font-semibold text-primary flex-1" numberOfLines={1}>
                        {provider.name}
                    </Text>
                    {provider.isTopRated === true && (
                        <View className="bg-secondaryFixed rounded px-2 py-[2px]">
                            <Text className="text-[10px] font-bold text-onSecondaryFixed tracking-[0.5px] uppercase">
                                {t('services.top_rated', { defaultValue: 'Top Rated' })}
                            </Text>
                        </View>
                    )}
                </View>

                <Text className="text-sm text-onSurfaceVariant leading-5 mb-4" numberOfLines={1}>
                    {provider.role}
                </Text>

                <View className="flex-row justify-between items-center" style={{ marginTop: 'auto' }}>
                    <View>
                        <Text className="text-[10px] font-bold text-outline tracking-[0.5px] uppercase">
                            {t('services.starting_at')}
                        </Text>
                        <Text className="text-base font-bold text-onSurface">
                            ${provider.pricePerHour}
                            <Text className="text-sm font-normal text-onSurfaceVariant">/hr</Text>
                        </Text>
                    </View>
                    <Pressable
                        className="bg-primary rounded-lg px-4 py-2"
                        style={({ pressed }) => ({
                            ...(pressed ? { opacity: 0.8 } : {}),
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 2,
                            elevation: 1,
                        })}
                        onPress={() => onBook(provider.id)}
                        accessibilityRole="button"
                    >
                        <Text className="text-onPrimary text-xs font-bold tracking-[0.05px]">
                            {t('common.book_now')}
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Pressable>
    );
}
