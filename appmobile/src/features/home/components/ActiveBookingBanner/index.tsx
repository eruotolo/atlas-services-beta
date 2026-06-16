import { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import type { ActiveBooking } from '@/features/home/types';
import { Colors } from '@/shared/constants/colors';

interface ActiveBookingBannerProps {
    readonly booking: ActiveBooking;
    readonly onPress?: () => void;
}

const STATUS_LABEL: Record<ActiveBooking['status'], string> = {
    en_route: 'EN ROUTE',
    arrived: 'ARRIVED',
    in_progress: 'IN PROGRESS',
};

export function ActiveBookingBanner({ booking, onPress }: ActiveBookingBannerProps): React.JSX.Element {
    const pulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 0.25, duration: 650, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 1, duration: 650, useNativeDriver: true }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, [pulse]);

    const statusText = STATUS_LABEL[booking.status];
    const etaText = booking.status === 'en_route' ? ` • ${booking.etaMinutes} MINS` : '';

    return (
        <Pressable
            className="flex-row items-center bg-primaryContainer rounded-2xl py-[14px] px-4 gap-3"
            style={({ pressed }) => ({
                ...(pressed ? { opacity: 0.88 } : {}),
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 16,
                elevation: 8,
            })}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`Active booking: ${booking.serviceType}, ${statusText}`}
        >
            {/* Icon + pulse */}
            <View className="w-11 h-11 justify-center items-center">
                <Animated.View
                    className="absolute w-11 h-11 rounded-full bg-[rgba(255,255,255,0.2)]"
                    style={{ opacity: pulse }}
                />
                <View className="w-9 h-9 rounded-full bg-[rgba(255,255,255,0.15)] justify-center items-center">
                    {Platform.OS === 'ios' ? (
                        <SymbolView name="bolt.fill" size={18} tintColor={Colors.onPrimary} />
                    ) : (
                        <Text style={{ fontSize: 16, color: Colors.onPrimary }}>⚡</Text>
                    )}
                </View>
            </View>

            {/* Text */}
            <View className="flex-1 gap-[3px]">
                <Text className="text-[10px] font-extrabold text-[#7dd3fc] tracking-[0.8px]">
                    {statusText}{etaText}
                </Text>
                <Text className="text-sm font-semibold text-onPrimary" numberOfLines={1}>
                    {booking.serviceType} arriving soon
                </Text>
            </View>

            {/* Chevron */}
            {Platform.OS === 'ios' ? (
                <SymbolView name="chevron.right" size={16} tintColor="rgba(255,255,255,0.6)" />
            ) : (
                <Text className="text-[22px] text-[rgba(255,255,255,0.6)] font-light">›</Text>
            )}
        </Pressable>
    );
}
