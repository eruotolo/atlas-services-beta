import { useCallback, useEffect, useRef } from 'react';
import { Animated, Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useNotification, type InAppNotificationData } from '@/features/messages/context/NotificationContext';

const BANNER_OFFSET = -120;
const AUTO_DISMISS_MS = 4000;

export function InAppNotificationBanner(): React.JSX.Element {
    const { current, dismiss } = useNotification();
    const insets = useSafeAreaInsets();

    const translateY = useRef(new Animated.Value(BANNER_OFFSET)).current;
    const lastDataRef = useRef<InAppNotificationData | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const slideOut = useCallback((): void => {
        Animated.timing(translateY, {
            toValue: BANNER_OFFSET,
            duration: 280,
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) dismiss();
        });
    }, [translateY, dismiss]);

    useEffect(() => {
        if (timerRef.current != null) clearTimeout(timerRef.current);

        if (current != null) {
            lastDataRef.current = current;
            Animated.spring(translateY, {
                toValue: 0,
                damping: 18,
                stiffness: 220,
                mass: 1,
                useNativeDriver: true,
            }).start();
            timerRef.current = setTimeout(slideOut, AUTO_DISMISS_MS);
        }

        return () => {
            if (timerRef.current != null) clearTimeout(timerRef.current);
        };
    }, [current?.id, slideOut, translateY]);

    const data = current ?? lastDataRef.current;

    const handlePress = (): void => {
        if (timerRef.current != null) clearTimeout(timerRef.current);
        slideOut();
        router.push('/(tabs)/messages');
    };

    const handleDismiss = (): void => {
        if (timerRef.current != null) clearTimeout(timerRef.current);
        slideOut();
    };

    return (
        <Animated.View
            className="absolute top-0 left-0 right-0 z-[9999] px-3"
            style={{ paddingTop: insets.top + 6, transform: [{ translateY }] }}
            pointerEvents={data != null ? 'box-none' : 'none'}
        >
            {data != null && (
                <Pressable
                    className="flex-row items-center bg-onSurface rounded-[18px] px-[14px] py-3 gap-3"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.25,
                        shadowRadius: 16,
                        elevation: 12,
                    }}
                    onPress={handlePress}
                >
                    {data.avatarUrl != null ? (
                        <Image source={{ uri: data.avatarUrl }} className="w-11 h-11 rounded-full shrink-0" />
                    ) : (
                        <View className="w-11 h-11 rounded-full shrink-0 bg-primaryContainer justify-center items-center">
                            <Text className="text-lg font-bold text-onPrimary">
                                {data.providerName.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}

                    <View className="flex-1 gap-[2px]">
                        <Text className="text-[13px] font-bold text-surfaceContainerLowest">{data.providerName}</Text>
                        <Text className="text-[13px] text-outlineVariant leading-[18px]" numberOfLines={1}>
                            {data.message}
                        </Text>
                    </View>

                    <Pressable
                        className="w-7 h-7 justify-center items-center"
                        style={({ pressed }) => pressed ? { opacity: 0.6 } : undefined}
                        onPress={handleDismiss}
                        hitSlop={12}
                        accessibilityRole="button"
                        accessibilityLabel="Dismiss notification"
                    >
                        <Text className="text-sm text-outline">✕</Text>
                    </Pressable>
                </Pressable>
            )}
        </Animated.View>
    );
}
