import { useState } from 'react';
import {
    Image,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

import { Colors } from '@/shared/constants/colors';
import { useT } from '@/features/i18n/context/LocaleContext';

type Role = 'client' | 'professional';

interface RoleOption {
    readonly id: Role;
    readonly titleKey: string;
    readonly descKey: string;
    readonly labelKey: string;
    readonly symbol: string;
    readonly fallbackChar: string;
}

const ROLES: readonly RoleOption[] = [
    {
        id: 'client',
        titleKey: 'onboarding.client.title',
        descKey: 'onboarding.client.description',
        labelKey: 'onboarding.client.label',
        symbol: 'person.fill',
        fallbackChar: '◉',
    },
    {
        id: 'professional',
        titleKey: 'onboarding.professional.title',
        descKey: 'onboarding.professional.description',
        labelKey: 'onboarding.professional.label',
        symbol: 'wrench.and.screwdriver.fill',
        fallbackChar: '⚙',
    },
];

export default function OnboardingScreen(): React.JSX.Element {
    const t = useT();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [selectedRole, setSelectedRole] = useState<Role>('client');

    const selected = ROLES.find((r) => r.id === selectedRole)!;

    const handleContinue = (): void => {
        router.push({ pathname: '/signup', params: { role: selectedRole } });
    };

    const handleLogin = (): void => {
        router.push('/login');
    };

    return (
        <View
            className="flex-1 bg-surface"
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingHorizontal: 24,
                    paddingTop: insets.top + 40,
                }}
                showsVerticalScrollIndicator={false}
            >
                <View className="items-center">
                    <Image
                        source={require('@/assets/images/logo.png')}
                        style={{ width: 170, height: 46, marginBottom: 18 }}
                        resizeMode="contain"
                    />
                    <Text className="text-[15px] leading-[22px] text-onSurfaceVariant text-center max-w-[270px]">
                        {t('onboarding.tagline')}
                    </Text>
                </View>

                <View className="flex-1 min-h-14" />

                <View className="pb-6">
                    <Text className="text-base font-bold text-onSurface mb-4">
                        {t('onboarding.select_profile')}
                    </Text>
                    <View className="gap-[14px]">
                        {ROLES.map((role) => (
                            <RoleCard
                                key={role.id}
                                role={role}
                                selected={selectedRole === role.id}
                                onSelect={() => setSelectedRole(role.id)}
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>

            <View
                className="px-6 pt-[14px] pb-5 bg-surface border-t border-outlineVariant"
            >
                <Pressable
                    className="bg-primaryContainer rounded-[14px] h-[58px] justify-center items-center"
                    style={({ pressed }) => ({
                        ...(pressed ? { opacity: 0.88, transform: [{ scale: 0.98 }] } : {}),
                        shadowColor: Colors.primary,
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.22,
                        shadowRadius: 14,
                        elevation: 5,
                    })}
                    onPress={handleContinue}
                    accessibilityRole="button"
                >
                    <Text className="text-onPrimary text-[17px] font-bold tracking-[0.2px]">
                        {t('onboarding.continue_as', { role: t(selected.labelKey) })}
                    </Text>
                </Pressable>

                <TouchableOpacity
                    className="flex-row justify-center items-center mt-4"
                    onPress={handleLogin}
                    hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
                    accessibilityRole="button"
                >
                    <Text className="text-sm font-semibold text-primary">{t('onboarding.login_link')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

function RoleCard({
    role,
    selected,
    onSelect,
}: {
    readonly role: RoleOption;
    readonly selected: boolean;
    readonly onSelect: () => void;
}): React.JSX.Element {
    const t = useT();
    const iconColor = selected ? Colors.onPrimary : Colors.onSurfaceVariant;

    return (
        <Pressable
            className={`flex-row items-center rounded-[14px] p-4 gap-4 ${selected ? 'bg-surfaceContainerLowest border-2 border-primaryContainer' : 'bg-surfaceContainerLowest border-[1.5px] border-outlineVariant'}`}
            style={({ pressed }) => !selected && pressed ? { backgroundColor: Colors.surfaceContainerLow } : undefined}
            onPress={onSelect}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={t(role.titleKey)}
        >
            <View
                className={`w-[46px] h-[46px] rounded-full justify-center items-center ${selected ? 'bg-primaryContainer' : 'bg-surfaceContainerHigh'}`}
            >
                {Platform.OS === 'ios' ? (
                    <SymbolView
                        name={role.symbol as Parameters<typeof SymbolView>[0]['name']}
                        size={20}
                        tintColor={iconColor}
                    />
                ) : (
                    <Text className="text-xl leading-6" style={{ color: iconColor }}>{role.fallbackChar}</Text>
                )}
            </View>

            <View className="flex-1">
                <Text className={`text-[15px] font-semibold leading-5 mb-1 ${selected ? 'text-primaryContainer' : 'text-onSurface'}`}>
                    {t(role.titleKey)}
                </Text>
                <Text className="text-[13px] leading-[18px] text-onSurfaceVariant">{t(role.descKey)}</Text>
            </View>
        </Pressable>
    );
}
