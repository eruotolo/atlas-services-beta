import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { Colors } from '@/shared/constants/colors';
import { Icon } from '@/shared/components/Icon';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useT } from '@/features/i18n/context/LocaleContext';
import { useCountry } from '@/features/country/context/CountryContext';
import { getMyServices } from '@/features/services/actions/queries';
import { formatCurrency } from '@/shared/lib/formatCurrency';
import type { MyService } from '@/features/services/types';

function ServiceItem({ item, currencySymbol, locale }: {
    readonly item: MyService;
    readonly currencySymbol: string;
    readonly locale: string;
}): React.JSX.Element {
    return (
        <Pressable
            className="bg-surfaceContainerLowest rounded-2xl border border-outlineVariant overflow-hidden"
            style={({ pressed }) => pressed ? { opacity: 0.85 } : undefined}
            onPress={() => router.push(`/service/${item.slug}`)}
            accessibilityRole="button"
        >
            {item.mainImage != null ? (
                <Image
                    source={{ uri: item.mainImage }}
                    className="w-full h-40 bg-surfaceContainerHigh"
                    resizeMode="cover"
                />
            ) : (
                <View className="w-full h-40 bg-surfaceContainerHigh items-center justify-center">
                    <Icon name="briefcase" size={40} color={Colors.outlineVariant} />
                </View>
            )}
            <View className="p-4 gap-2">
                <Text className="text-base font-bold text-onSurface" numberOfLines={2}>
                    {item.title}
                </Text>
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-1">
                        <Icon name="star-filled" size={14} color={Colors.star} />
                        <Text className="text-[13px] font-semibold text-onSurface">
                            {item.rating.toFixed(1)}
                        </Text>
                        <Text className="text-[12px] text-onSurfaceVariant">
                            ({item.reviewsCount})
                        </Text>
                    </View>
                    <Text className="text-[15px] font-bold text-primaryContainer">
                        {formatCurrency(item.price, currencySymbol, locale)}
                    </Text>
                </View>
                {item.categories.length > 0 && (
                    <Text className="text-xs text-onSurfaceVariant" numberOfLines={1}>
                        {item.categories.map((c) => c.name).join(' · ')}
                    </Text>
                )}
            </View>
        </Pressable>
    );
}

export default function MyServicesScreen(): React.JSX.Element {
    const insets = useSafeAreaInsets();
    const t = useT();
    const { user } = useAuth();
    const { country } = useCountry();

    const { data: services = [], isLoading, isError, refetch } = useQuery({
        queryKey: ['my-services', user?.id],
        queryFn: () => getMyServices(user!.id),
        enabled: user != null,
    });

    return (
        <View className="flex-1 bg-surfaceContainerLowest">
            {/* Header */}
            <View
                className="flex-row items-center gap-3 px-4 pb-3 border-b border-outlineVariant bg-surface"
                style={{ paddingTop: insets.top + 12 }}
            >
                <Pressable
                    className="w-10 h-10 justify-center items-center"
                    onPress={() => router.back()}
                    accessibilityRole="button"
                >
                    <Icon name="arrow-left" size={24} color={Colors.onSurface} />
                </Pressable>
                <Text className="flex-1 text-lg font-bold text-onSurface">
                    {t('profile.my_services_title', { defaultValue: 'My Services' })}
                </Text>
                <Pressable
                    className="w-10 h-10 bg-primary rounded-full justify-center items-center"
                    style={({ pressed }) => pressed ? { opacity: 0.8 } : undefined}
                    onPress={() => router.push('/publish' as any)}
                    accessibilityRole="button"
                    accessibilityLabel={t('publish.screen_title', { defaultValue: 'Publish Service' })}
                >
                    <Icon name="plus" size={20} color={Colors.onPrimary} />
                </Pressable>
            </View>

            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : isError ? (
                <View className="flex-1 justify-center items-center px-8 gap-4">
                    <Text className="text-base text-onSurfaceVariant text-center">
                        {t('errors.load_failed', { defaultValue: 'Could not load services.' })}
                    </Text>
                    <Pressable
                        className="bg-primary px-6 py-3 rounded-xl"
                        onPress={() => void refetch()}
                    >
                        <Text className="text-onPrimary font-semibold">
                            {t('actions.retry', { defaultValue: 'Retry' })}
                        </Text>
                    </Pressable>
                </View>
            ) : (
                <FlatList
                    data={services as MyService[]}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <Text className="text-[28px] font-extrabold text-onSurface tracking-[-0.5px] mb-2">
                            {t('profile.my_services_title', { defaultValue: 'My Services' })}
                        </Text>
                    }
                    renderItem={({ item }) => (
                        <ServiceItem
                            item={item}
                            currencySymbol={country.currencySymbol}
                            locale={country.locale}
                        />
                    )}
                    ListEmptyComponent={
                        <View className="items-center py-16 gap-4">
                            <Icon name="briefcase" size={56} color={Colors.outlineVariant} />
                            <Text className="text-lg font-bold text-onSurface text-center">
                                {t('profile.no_services_title', { defaultValue: 'No services yet' })}
                            </Text>
                            <Text className="text-sm text-onSurfaceVariant text-center px-8">
                                {t('profile.no_services_desc', { defaultValue: 'Start by publishing your first service to attract clients.' })}
                            </Text>
                            <Pressable
                                className="bg-primary px-8 py-3 rounded-xl mt-2"
                                style={({ pressed }) => pressed ? { opacity: 0.85 } : undefined}
                                onPress={() => router.push('/publish' as any)}
                            >
                                <Text className="text-onPrimary text-base font-bold">
                                    {t('publish.screen_title', { defaultValue: 'Publish Service' })}
                                </Text>
                            </Pressable>
                        </View>
                    }
                />
            )}
        </View>
    );
}
