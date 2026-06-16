import { ActivityIndicator, Image, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Colors } from '@/shared/constants/colors';
import { Icon } from '@/shared/components/Icon';
import { ServiceGallery } from '@/features/services/components/ServiceGallery';
import { useAuthGate } from '@/features/auth/hooks/useAuthGate';
import { useT } from '@/features/i18n/context/LocaleContext';
import { useCountry } from '@/features/country/context/CountryContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getServiceBySlug } from '@/features/services/actions/queries';
import { addFavorite, checkFavorite, removeFavorite } from '@/features/favorites/actions/mutations';
import { formatCurrency } from '@/shared/lib/formatCurrency';
import { apiClient } from '@/shared/lib/apiClient';

export default function ServiceDetailScreen(): React.JSX.Element {
    const t = useT();
    const insets = useSafeAreaInsets();
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const requireAuth = useAuthGate();
    const { country } = useCountry();
    const { isAuthenticated, user } = useAuth();
    const queryClient = useQueryClient();
    const [showAllReviews, setShowAllReviews] = useState(false);

    const { data: service, isLoading, isError } = useQuery({
        queryKey: ['service', slug],
        queryFn: () => getServiceBySlug(slug),
    });

    const isOwner = isAuthenticated && user?.id === service?.user?.id;

    const { data: isFavoriteData } = useQuery({
        queryKey: ['favorite', service?.id],
        queryFn: () => checkFavorite(service!.id),
        enabled: isAuthenticated && service?.id != null,
    });

    const isFavorite = isFavoriteData ?? false;

    const toggleFavoriteMutation = useMutation({
        mutationFn: () => isFavorite ? removeFavorite(service!.id) : addFavorite(service!.id),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['favorite', service?.id] });
            const previous = queryClient.getQueryData(['favorite', service?.id]);
            queryClient.setQueryData(['favorite', service?.id], !isFavorite);
            return { previous };
        },
        onError: (_err, _new, context) => {
            if (context?.previous !== undefined) {
                queryClient.setQueryData(['favorite', service?.id], context.previous);
            }
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: ['favorite', service?.id] });
        },
    });

    const handleHire = (): void => {
        requireAuth('book', async () => {
            try {
                const { conversationId } = await apiClient.post<{ conversationId: string }>(
                    '/chat/conversations',
                    { serviceId: service!.id },
                );
                router.push(`/chat/${conversationId}`);
            } catch (err) {
                console.warn('Failed to start conversation', err);
            }
        });
    };

    const handleToggleFavorite = (): void => {
        requireAuth('book', () => { toggleFavoriteMutation.mutate(); });
    };

    if (isLoading) {
        return (
            <View className="flex-1 bg-surfaceContainerLowest justify-center items-center p-5">
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (isError || service == null) {
        return (
            <View className="flex-1 bg-surfaceContainerLowest justify-center items-center p-5">
                <Text className="text-base text-error mb-4">
                    {t('service_detail.not_found', { defaultValue: 'Service not found' })}
                </Text>
                <Pressable
                    className="py-3 px-4 bg-surfaceContainerHigh rounded-lg"
                    onPress={() => router.back()}
                >
                    <Text className="font-semibold text-onSurface">
                        {t('service_detail.go_back', { defaultValue: 'Go Back' })}
                    </Text>
                </Pressable>
            </View>
        );
    }

    const images = service.imagenPrincipal
        ? [service.imagenPrincipal, ...service.imagenes]
        : service.imagenes;
    const priceFormatted = formatCurrency(service.price, country.currencySymbol, country.locale);

    return (
        <View className="flex-1 bg-surfaceContainerLowest">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Hero gallery */}
                <View className="h-[397px] relative">
                    <ServiceGallery images={images} />

                    {/* Overlay buttons */}
                    <View
                        className="absolute top-0 left-0 right-0 flex-row justify-between items-center px-4"
                        style={{ paddingTop: insets.top + 12 }}
                    >
                        <Pressable
                            className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.9)] justify-center items-center"
                            style={({ pressed }) => ({
                                ...(pressed ? { opacity: 0.7 } : {}),
                                shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.12, shadowRadius: 4, elevation: 3,
                            })}
                            onPress={() => router.back()}
                            accessibilityRole="button"
                        >
                            <Icon name="arrow-left" size={20} color={Colors.onSurface} />
                        </Pressable>

                        <View className="flex-row gap-[10px]">
                            <Pressable
                                className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.9)] justify-center items-center"
                                style={({ pressed }) => ({
                                    ...(pressed ? { opacity: 0.7 } : {}),
                                    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.12, shadowRadius: 4, elevation: 3,
                                })}
                                accessibilityRole="button"
                            >
                                <Icon name="share" size={20} color={Colors.onSurface} />
                            </Pressable>
                            {!isOwner && (
                                <Pressable
                                    className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.9)] justify-center items-center"
                                    style={({ pressed }) => ({
                                        ...(pressed ? { opacity: 0.7 } : {}),
                                        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                                        shadowOpacity: 0.12, shadowRadius: 4, elevation: 3,
                                    })}
                                    onPress={handleToggleFavorite}
                                    accessibilityRole="button"
                                >
                                    <Icon
                                        name={isFavorite ? 'heart-filled' : 'heart'}
                                        size={20}
                                        color={isFavorite ? Colors.error : Colors.onSurface}
                                    />
                                </Pressable>
                            )}
                        </View>
                    </View>
                </View>

                {/* Content sheet */}
                <View className="bg-surfaceContainerLowest rounded-t-[24px] -mt-6 px-5 pt-4 pb-2">
                    {/* Handle */}
                    <View className="w-12 h-[5px] bg-outlineVariant rounded-full self-center mb-5" />

                    <Text className="text-[22px] font-extrabold text-onSurface tracking-[-0.3px] leading-7 mb-4">
                        {service.title}
                    </Text>

                    {/* Provider row */}
                    <View className="flex-row items-center gap-3 mb-3">
                        {service.user.avatar != null ? (
                            <Image
                                source={{ uri: service.user.avatar }}
                                className="w-12 h-12 rounded-full bg-surfaceContainerHigh border-2 border-outlineVariant"
                            />
                        ) : (
                            <View className="w-12 h-12 rounded-full bg-surfaceContainerHigh border-2 border-outlineVariant justify-center items-center">
                                <Icon name="user-filled" size={24} color={Colors.onSurfaceVariant} />
                            </View>
                        )}
                        <View className="gap-[2px]">
                            <Text className="text-base font-bold text-onSurface">{service.user.name}</Text>
                            <View className="flex-row items-center gap-1">
                                <Icon name="star-filled" size={14} color={Colors.star} />
                                <Text className="text-[13px] font-bold text-onSurface">
                                    {service.rating.toFixed(1)}
                                </Text>
                                <Text className="text-[13px] text-onSurfaceVariant">
                                    ({service.reviewsCount} {t('service_detail.reviews', { defaultValue: 'Reviews' })})
                                </Text>
                            </View>
                        </View>
                    </View>

                    <Text className="text-[13px] text-onSurfaceVariant leading-[19px] mb-4">
                        {t('service_detail.service_label', { defaultValue: 'Category: ' })}
                        <Text className="text-onSurface font-medium">{service.categories?.[0]?.name ?? 'Service'}</Text>
                        {'  •  '}
                        {t('service_detail.location_label', { defaultValue: 'Location: ' })}
                        <Text className="text-onSurface font-medium">{service.comuna}</Text>
                    </Text>

                    <Text className="text-[26px] font-extrabold text-primaryContainer tracking-[-0.3px] mb-6">
                        {priceFormatted}
                    </Text>

                    {/* Description */}
                    <View className="mb-6">
                        <Text className="text-[17px] font-bold text-onSurface tracking-[-0.2px] mb-3">
                            {t('service_detail.about_professional', { defaultValue: 'About this service' })}
                        </Text>
                        <Text className="text-sm text-onSurfaceVariant leading-[22px]">
                            {service.description}
                        </Text>
                    </View>

                    {/* Social links */}
                    {service.socialMedia != null && service.socialMedia.length > 0 && (
                        <View className="mb-6">
                            <Text className="text-[17px] font-bold text-onSurface tracking-[-0.2px] mb-3">
                                {t('service_detail.social_links', { defaultValue: 'Social Media' })}
                            </Text>
                            <View className="flex-row flex-wrap gap-3">
                                {service.socialMedia.map((link) => (
                                    <Pressable
                                        key={link.id}
                                        className="flex-row items-center gap-2 bg-surfaceContainerLow rounded-xl px-3 py-2"
                                        style={({ pressed }) => pressed ? { opacity: 0.7 } : undefined}
                                        onPress={() => { void Linking.openURL(link.url); }}
                                        accessibilityRole="link"
                                        accessibilityLabel={link.type}
                                    >
                                        <Icon name="link" size={20} color={Colors.primaryContainer} />
                                        <Text className="text-[13px] font-medium text-onSurface">{link.type}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Reviews */}
                    <View className="mb-6">
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-[17px] font-bold text-onSurface tracking-[-0.2px]">
                                {t('service_detail.reviews', { defaultValue: 'Reviews' })}
                            </Text>
                            {service.reviewsCount > 3 && (
                                <Pressable
                                    accessibilityRole="button"
                                    onPress={() => setShowAllReviews((v) => !v)}
                                >
                                    <Text className="text-sm font-semibold text-primaryContainer">
                                        {showAllReviews
                                            ? t('service_detail.show_less', { defaultValue: 'Show less' })
                                            : t('service_detail.see_all_reviews', { defaultValue: `See all (${service.reviewsCount})` })}
                                    </Text>
                                </Pressable>
                            )}
                        </View>
                        {service.ratings != null && service.ratings.length > 0 ? (
                            <View className="gap-4">
                                {(showAllReviews ? service.ratings : service.ratings.slice(0, 3)).map((r) => (
                                    <View key={r.id} className="flex-row gap-3 items-start">
                                        <View className="flex-1 bg-surfaceContainerLow p-3 rounded-xl">
                                            <View className="flex-row justify-between mb-1">
                                                <Text className="text-sm font-semibold text-onSurface">{r.user.name}</Text>
                                                <View className="flex-row items-center">
                                                    <Icon name="star-filled" size={12} color={Colors.star} />
                                                    <Text className="text-xs font-semibold ml-1 text-onSurface">{r.score}</Text>
                                                </View>
                                            </View>
                                            <Text className="text-[13px] text-onSurfaceVariant leading-5">{r.comment}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text className="text-sm text-onSurfaceVariant leading-[22px]">
                                {t('service_detail.no_reviews', { defaultValue: 'No reviews yet' })}
                            </Text>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* CTA bar */}
            {!isOwner && (
                <View
                    className="absolute bottom-0 left-0 right-0 bg-[rgba(250,248,255,0.92)] border-t border-outlineVariant px-5 pt-4"
                    style={{ paddingBottom: Math.max(insets.bottom, 20) }}
                >
                    <Pressable
                        className="bg-primaryContainer rounded-xl h-14 flex-row justify-center items-center gap-[10px]"
                        style={({ pressed }) => ({
                            ...(pressed ? { opacity: 0.9 } : {}),
                            shadowColor: Colors.primary,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 12,
                            elevation: 6,
                        })}
                        onPress={handleHire}
                        accessibilityRole="button"
                    >
                        <Text className="text-[17px] font-bold text-onPrimary tracking-[0.2px]">
                            {t('service_detail.contact', { defaultValue: 'Contact / Hire' })}
                        </Text>
                        <Icon name="chat" size={20} color={Colors.onPrimary} />
                    </Pressable>
                </View>
            )}
        </View>
    );
}
