import { Image, Pressable, Text, View } from 'react-native';

import { useT } from '@/features/i18n/context/LocaleContext';
import type { Booking } from '@/features/bookings/types';
import { Icon } from '@/shared/components/Icon';
import { Colors } from '@/shared/constants/colors';

interface Props {
    booking: Booking;
    onReschedule?: (id: string) => void;
    onViewDetails?: (id: string) => void;
    onViewReceipt?: (id: string) => void;
    onRebook?: (id: string) => void;
}

interface StatusConfig {
    label: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    dot?: boolean;
    icon?: 'clock' | 'circle-check-filled';
}

const STATUS_LABEL_KEYS: Record<Booking['status'], string> = {
    confirmed: 'bookings.status.confirmed',
    in_progress: 'bookings.status.in_progress',
    completed: 'bookings.status.completed',
    cancelled: 'bookings.status.cancelled',
};

const STATUS_CONFIGS: Record<Booking['status'], Omit<StatusConfig, 'label'>> = {
    confirmed: { bgColor: Colors.primaryContainer, textColor: Colors.onPrimaryContainer, borderColor: 'transparent', dot: true },
    in_progress: { bgColor: Colors.warningContainer, textColor: Colors.onWarning, borderColor: Colors.warningBorder, icon: 'clock' },
    completed: { bgColor: Colors.successContainer, textColor: Colors.onSuccessContainer, borderColor: Colors.onSuccessContainer, icon: 'circle-check-filled' },
    cancelled: { bgColor: Colors.errorContainer, textColor: Colors.error, borderColor: 'transparent' },
};

export function BookingCard({
    booking,
    onReschedule,
    onViewDetails,
    onViewReceipt,
    onRebook,
}: Props): React.JSX.Element {
    const t = useT();
    const { id, providerName, providerAvatarUrl, dateLabel, status } = booking;
    const cfg = STATUS_CONFIGS[status];

    return (
        <View
            className="bg-surfaceContainerLowest rounded-xl border border-surfaceContainerLow p-5 overflow-hidden"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.04,
                shadowRadius: 20,
                elevation: 2,
            }}
        >
            {status === 'in_progress' && (
                <View className="absolute top-0 left-0 bottom-0 w-1 bg-[#83a2fe]" />
            )}

            <View className="flex-row justify-between items-start gap-3">
                <View className="flex-row items-center gap-[14px] flex-1">
                    {providerAvatarUrl != null ? (
                        <Image source={{ uri: providerAvatarUrl }} className="w-14 h-14 rounded-full shrink-0" />
                    ) : (
                        <View className="w-14 h-14 rounded-full shrink-0 bg-surfaceContainer justify-center items-center">
                            <Text className="text-xl font-bold text-onSurface">
                                {providerName.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}
                    <View className="gap-1 flex-1">
                        <Text className="text-base font-semibold text-onSurface leading-[22px]">
                            {providerName}
                        </Text>
                        <View className="flex-row items-center gap-1">
                            <Icon name="calendar" size={14} color={Colors.onSurfaceVariant} />
                            <Text className="text-[13px] text-onSurfaceVariant leading-[18px]">
                                {dateLabel}
                            </Text>
                        </View>
                    </View>
                </View>

                <View
                    className="flex-row items-center gap-1.5 px-[10px] py-[5px] rounded-full border shrink-0"
                    style={{ backgroundColor: cfg.bgColor, borderColor: cfg.borderColor }}
                >
                    {cfg.dot === true && (
                        <View
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: cfg.textColor }}
                        />
                    )}
                    {cfg.icon != null && (
                        <Icon name={cfg.icon} size={13} color={cfg.textColor} />
                    )}
                    <Text
                        className="text-[11px] font-bold tracking-[0.5px] uppercase"
                        style={{ color: cfg.textColor }}
                    >
                        {t(STATUS_LABEL_KEYS[status])}
                    </Text>
                </View>
            </View>

            <View className="flex-row justify-end gap-[10px] mt-5 pt-4 border-t border-outlineVariant">
                {status === 'confirmed' && (
                    <Pressable
                        className="px-4 py-[9px] rounded-[10px] border border-outlineVariant"
                        style={({ pressed }) => pressed ? { opacity: 0.75 } : undefined}
                        onPress={() => onReschedule?.(id)}
                    >
                        <Text className="text-sm font-semibold text-onSurface">{t('bookings.reschedule')}</Text>
                    </Pressable>
                )}
                {status === 'completed' && (
                    <Pressable
                        className="px-4 py-[9px] rounded-[10px] border border-outlineVariant"
                        style={({ pressed }) => pressed ? { opacity: 0.75 } : undefined}
                        onPress={() => onViewReceipt?.(id)}
                    >
                        <Text className="text-sm font-semibold text-onSurface">{t('bookings.view_receipt')}</Text>
                    </Pressable>
                )}
                {(status === 'confirmed' || status === 'in_progress') && (
                    <Pressable
                        className="px-4 py-[9px] rounded-[10px] bg-primaryContainer"
                        style={({ pressed }) => pressed ? { opacity: 0.75 } : undefined}
                        onPress={() => onViewDetails?.(id)}
                    >
                        <Text className="text-sm font-semibold text-onPrimary">
                            {t('bookings.view_details')}
                        </Text>
                    </Pressable>
                )}
                {status === 'completed' && (
                    <Pressable
                        className="px-4 py-[9px] rounded-[10px] bg-primaryContainer"
                        style={({ pressed }) => pressed ? { opacity: 0.75 } : undefined}
                        onPress={() => onRebook?.(id)}
                    >
                        <Text className="text-sm font-semibold text-onPrimary">
                            {t('bookings.rebook')}
                        </Text>
                    </Pressable>
                )}
                {status === 'cancelled' && (
                    <Pressable
                        className="px-4 py-[9px] rounded-[10px] border border-outlineVariant"
                        style={({ pressed }) => pressed ? { opacity: 0.75 } : undefined}
                        onPress={() => onViewDetails?.(id)}
                    >
                        <Text className="text-sm font-semibold text-onSurface">{t('bookings.view_details')}</Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
}
