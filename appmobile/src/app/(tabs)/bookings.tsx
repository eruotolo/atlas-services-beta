import { useMemo, useState } from 'react';
import { Alert, FlatList, Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { Colors } from '@/shared/constants/colors';
import { BookingCard } from '@/features/bookings/components/BookingCard';
import { useT } from '@/features/i18n/context/LocaleContext';
import { getServiceRequests } from '@/features/bookings/actions/queries';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useAuthGate } from '@/features/auth/hooks/useAuthGate';
import type { Booking, BookingTab, ServiceRequest } from '@/features/bookings/types';

function mapRequestToBooking(req: ServiceRequest): Booking {
    let status: Booking['status'] = 'confirmed';
    if (req.status === 'IN_PROGRESS') status = 'in_progress';
    if (req.status === 'COMPLETED')   status = 'completed';
    if (req.status === 'CANCELLED')   status = 'cancelled';

    return {
        id: req.id,
        providerName: req.service.user.name,
        providerAvatarUrl: req.service.user.avatar,
        dateLabel: new Date(req.createdAt).toLocaleDateString(),
        status,
        serviceSlug: req.service.slug,
    };
}

export default function BookingsScreen(): React.JSX.Element {
    const insets = useSafeAreaInsets();
    const t = useT();
    const { isAuthenticated } = useAuth();
    const requireAuth = useAuthGate();
    const [activeTab, setActiveTab] = useState<BookingTab>('upcoming');

    const { data: requests = [] } = useQuery({
        queryKey: ['service-requests'],
        queryFn: getServiceRequests,
        enabled: isAuthenticated,
    });

    const { upcoming, past } = useMemo(() => ({
        upcoming: requests
            .filter((r) => r.status === 'PENDING' || r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS')
            .map(mapRequestToBooking),
        past: requests
            .filter((r) => r.status === 'COMPLETED' || r.status === 'CANCELLED')
            .map(mapRequestToBooking),
    }), [requests]);

    const bookings = activeTab === 'upcoming' ? upcoming : past;

    if (!isAuthenticated) {
        return (
            <View className="flex-1 bg-surfaceContainerLowest">
                <View
                    className="flex-row items-center px-5 pb-3 bg-surface border-b border-outlineVariant"
                    style={{ paddingTop: insets.top + 8 }}
                >
                    <Image
                        source={require('@/assets/images/logo.png')}
                        style={{ width: 110, height: 30 }}
                        resizeMode="contain"
                    />
                </View>
                <View className="flex-1 justify-center items-center gap-4 px-8">
                    <Text className="text-lg font-bold text-onSurface text-center">
                        {t('bookings.auth_required')}
                    </Text>
                    <Pressable
                        className="bg-primary rounded-full px-8 py-3 mt-2"
                        style={({ pressed }) => pressed ? { opacity: 0.85 } : undefined}
                        onPress={() => router.push('/(auth)/login')}
                        accessibilityRole="button"
                    >
                        <Text className="text-onPrimary text-[15px] font-bold">
                            {t('profile.sign_in')}
                        </Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-surfaceContainerLowest">
            {/* Sticky header */}
            <View
                className="absolute top-0 left-0 right-0 z-10 bg-surface border-b border-outlineVariant px-5 pb-4"
                style={{ paddingTop: insets.top + 8 }}
            >
                <Image
                    source={require('@/assets/images/logo.png')}
                    style={{ width: 110, height: 30 }}
                    resizeMode="contain"
                />
            </View>

            <FlatList
                data={bookings}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingTop: insets.top + 8 + 30 + 16,
                    paddingHorizontal: 20,
                    paddingBottom: 40,
                }}
                ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
                ListHeaderComponent={
                    <View>
                        <Text className="text-[28px] font-extrabold text-onSurface tracking-[-0.5px] mt-6 mb-5">
                            {t('bookings.title')}
                        </Text>
                        <View className="flex-row bg-surfaceContainer rounded-[10px] p-1 mb-6">
                            {(['upcoming', 'past'] as const).map((tab) => {
                                const isActive = activeTab === tab;
                                return (
                                    <Pressable
                                        key={tab}
                                        className={`flex-1 py-[9px] px-4 rounded-lg items-center ${isActive ? 'bg-surfaceContainerLowest' : ''}`}
                                        style={isActive ? {
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 1 },
                                            shadowOpacity: 0.08,
                                            shadowRadius: 3,
                                            elevation: 2,
                                        } : undefined}
                                        onPress={() => setActiveTab(tab)}
                                    >
                                        <Text className={`text-sm font-semibold ${isActive ? 'text-primary' : 'text-onSurfaceVariant'}`}>
                                            {t(`bookings.${tab}`)}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                }
                renderItem={({ item }) => (
                    <BookingCard
                        booking={item}
                        onReschedule={() => Alert.alert(
                            t('bookings.reschedule'),
                            t('bookings.reschedule_hint', { defaultValue: 'Contact the provider directly to change the date and time.' }),
                        )}
                        onViewDetails={() => {
                            if (item.serviceSlug != null) router.push(`/service/${item.serviceSlug}`);
                        }}
                        onViewReceipt={() => Alert.alert(
                            t('bookings.view_receipt'),
                            t('bookings.receipt_hint', { defaultValue: 'Your receipt was sent to your registered email address.' }),
                        )}
                        onRebook={() => {
                            if (item.serviceSlug != null) router.push(`/service/${item.serviceSlug}`);
                        }}
                    />
                )}
                ListEmptyComponent={
                    <View className="items-center py-12">
                        <Text className="text-[15px] text-onSurfaceVariant">{t('bookings.empty')}</Text>
                    </View>
                }
            />
        </View>
    );
}
