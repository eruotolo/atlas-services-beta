import { useState } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
    COUNTRY_CODES,
    COUNTRY_CONFIG,
    type CountryCode,
} from '@/features/country/lib/countryConfig';
import { useCountry } from '@/features/country/context/CountryContext';
import { useLocale, useT } from '@/features/i18n/context/LocaleContext';
import { Icon } from '@/shared/components/Icon';
import { Colors } from '@/shared/constants/colors';

interface CountrySelectorSheetProps {
    readonly visible: boolean;
    readonly onClose: () => void;
}

export function CountrySelectorSheet({
    visible,
    onClose,
}: CountrySelectorSheetProps): React.JSX.Element {
    const t = useT();
    const insets = useSafeAreaInsets();
    const { countryCode, setCountry } = useCountry();
    const { locale, setLocale } = useLocale();

    const [pendingCountry, setPendingCountry] = useState<CountryCode>(countryCode);
    const [pendingLocale, setPendingLocale] = useState<'es' | 'en'>(locale);

    const handleShow = (): void => {
        setPendingCountry(countryCode);
        setPendingLocale(locale);
    };

    const handleApply = (): void => {
        void (async (): Promise<void> => {
            await Promise.all([setCountry(pendingCountry), setLocale(pendingLocale)]);
            onClose();
        })();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
            statusBarTranslucent
            onShow={handleShow}
        >
            <View className="flex-1 justify-end">
                <Pressable className="absolute inset-0" onPress={onClose}>
                    <View className="flex-1 bg-[rgba(0,0,32,0.45)]" />
                </Pressable>

                <View
                    className="bg-surface rounded-t-[28px] px-5 pt-2"
                    style={{
                        paddingBottom: Math.max(insets.bottom, 20),
                        shadowColor: Colors.primary,
                        shadowOffset: { width: 0, height: -4 },
                        shadowOpacity: 0.07,
                        shadowRadius: 12,
                        elevation: 12,
                    }}
                >
                    {/* Handle */}
                    <View className="w-9 h-1 rounded-sm bg-outlineVariant mt-[10px] mb-2 self-center" />

                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-5 mt-1">
                        <Text className="text-xl font-bold text-onSurface tracking-[-0.3px]">
                            {t('country_selector.title')}
                        </Text>
                        <Pressable
                            className="w-8 h-8 justify-center items-center"
                            style={({ pressed }) => pressed ? { opacity: 0.6 } : undefined}
                            onPress={onClose}
                            accessibilityLabel="Close"
                            accessibilityRole="button"
                        >
                            <Icon name="x" size={18} color={Colors.onSurfaceVariant} />
                        </Pressable>
                    </View>

                    {/* Language section */}
                    <Text className="text-xs font-semibold tracking-[0.6px] text-onSurfaceVariant mb-[10px] mt-1">
                        {t('country_selector.language')}
                    </Text>
                    <View className="flex-row bg-surfaceContainerLow rounded-[14px] p-1 h-12 mb-5">
                        {(['es', 'en'] as const).map((loc) => {
                            const isActive = pendingLocale === loc;
                            const label = loc === 'es' ? t('country_selector.spanish') : t('country_selector.english');
                            return (
                                <Pressable
                                    key={loc}
                                    className={`flex-1 flex-row justify-center items-center rounded-[11px] gap-1.5 ${isActive ? 'bg-surfaceContainerLowest' : ''}`}
                                    style={isActive ? {
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 1 },
                                        shadowOpacity: 0.08,
                                        shadowRadius: 2,
                                        elevation: 1,
                                    } : undefined}
                                    onPress={() => setPendingLocale(loc)}
                                    accessibilityRole="radio"
                                    accessibilityState={{ checked: isActive }}
                                    accessibilityLabel={label}
                                >
                                    {isActive && <Icon name="check" size={14} color={Colors.primary} />}
                                    <Text className={`text-[15px] ${isActive ? 'font-bold text-onSurface' : 'font-medium text-onSurfaceVariant'}`}>
                                        {label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Country section */}
                    <Text className="text-xs font-semibold tracking-[0.6px] text-onSurfaceVariant mb-[10px] mt-1">
                        {t('country_selector.country')}
                    </Text>
                    <View className="bg-surfaceContainerLowest rounded-2xl border border-outlineVariant overflow-hidden mb-6">
                        {COUNTRY_CODES.map((code, index) => {
                            const cfg = COUNTRY_CONFIG[code];
                            const isSelected = pendingCountry === code;
                            const isLast = index === COUNTRY_CODES.length - 1;
                            return (
                                <TouchableOpacity
                                    key={code}
                                    className={`flex-row items-center h-[60px] px-4 gap-[14px]${!isLast ? ' border-b border-outlineVariant' : ''}${isSelected ? ' bg-primary/5' : ''}`}
                                    onPress={() => setPendingCountry(code)}
                                    accessibilityRole="radio"
                                    accessibilityState={{ checked: isSelected }}
                                    accessibilityLabel={`${cfg.name} ${cfg.currency}`}
                                >
                                    <Text className="text-[22px] leading-7">{cfg.flag}</Text>
                                    <Text className="flex-1 text-[15px] font-semibold text-onSurface">{cfg.name}</Text>
                                    <View className="bg-surfaceContainerLow rounded-lg px-2 py-[3px]">
                                        <Text className="text-[13px] font-semibold text-onSurfaceVariant">{cfg.currency}</Text>
                                    </View>
                                    <View className={`w-5 h-5 rounded-full border-2 justify-center items-center ${isSelected ? 'bg-primaryContainer border-primaryContainer' : 'border-outline'}`}>
                                        {isSelected && <Icon name="check" size={12} color={Colors.onPrimary} />}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Apply button */}
                    <Pressable
                        className="bg-primaryContainer rounded-[14px] h-14 justify-center items-center"
                        style={({ pressed }) => ({
                            ...(pressed ? { opacity: 0.88, transform: [{ scale: 0.98 }] } : {}),
                            shadowColor: Colors.primary,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 12,
                            elevation: 4,
                        })}
                        onPress={handleApply}
                        accessibilityRole="button"
                    >
                        <Text className="text-onPrimary text-[17px] font-bold">{t('country_selector.apply')}</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}
