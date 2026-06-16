import { Modal, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthGateContext, type GateAction } from '@/features/auth/context/AuthGateContext';
import { useT } from '@/features/i18n/context/LocaleContext';
import { Icon, type IconName } from '@/shared/components/Icon';
import { Colors } from '@/shared/constants/colors';

interface GateContent {
    readonly titleKey: string;
    readonly bodyKey: string;
    readonly iconName: IconName;
}

function getContent(action: GateAction): GateContent {
    switch (action) {
        case 'book':
            return { titleKey: 'gate.book.title', bodyKey: 'gate.book.body', iconName: 'lock' };
        case 'message':
            return { titleKey: 'gate.message.title', bodyKey: 'gate.message.body', iconName: 'message-filled' };
        case 'publish':
            return { titleKey: 'gate.publish.title', bodyKey: 'gate.publish.body', iconName: 'tools' };
    }
}

export function RegisterGateSheet(): React.JSX.Element {
    const t = useT();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { visible, action, close } = useAuthGateContext();
    const { titleKey, bodyKey, iconName } = getContent(action);

    const handleRegister = (): void => {
        close();
        router.push('/onboarding');
    };

    const handleLogin = (): void => {
        close();
        router.push('/login');
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={close}
            statusBarTranslucent
        >
            <View className="flex-1 justify-end">
                <Pressable className="absolute inset-0" onPress={close}>
                    <View className="flex-1 bg-[rgba(0,0,32,0.45)]" />
                </Pressable>

                <View
                    className="bg-surface rounded-t-[28px] px-6 pt-2 items-center"
                    style={{
                        paddingBottom: Math.max(insets.bottom, 24),
                        shadowColor: Colors.primary,
                        shadowOffset: { width: 0, height: -4 },
                        shadowOpacity: 0.07,
                        shadowRadius: 12,
                        elevation: 12,
                    }}
                >
                    {/* Handle */}
                    <View className="w-9 h-1 rounded-sm bg-outlineVariant mt-[10px] mb-2 self-center" />

                    {/* Close button */}
                    <Pressable
                        className="absolute top-4 right-5 w-8 h-8 justify-center items-center"
                        style={({ pressed }) => pressed ? { opacity: 0.6 } : undefined}
                        onPress={close}
                        accessibilityLabel="Close"
                        accessibilityRole="button"
                    >
                        <Icon name="x" size={20} color={Colors.onSurfaceVariant} />
                    </Pressable>

                    {/* Icon circle */}
                    <View className="w-16 h-16 rounded-full bg-primaryContainer justify-center items-center mt-2 mb-5">
                        <Icon name={iconName} size={28} color={Colors.onPrimary} />
                    </View>

                    {/* Title */}
                    <Text className="text-[22px] font-bold text-onSurface text-center tracking-[-0.3px] mb-2">
                        {t(titleKey)}
                    </Text>

                    {/* Body */}
                    <Text className="text-[15px] leading-[22px] text-onSurfaceVariant text-center max-w-[300px] mb-7">
                        {t(bodyKey)}
                    </Text>

                    {/* Primary button */}
                    <Pressable
                        className="bg-primaryContainer rounded-[14px] h-14 w-full justify-center items-center"
                        style={({ pressed }) => ({
                            ...(pressed ? { opacity: 0.88, transform: [{ scale: 0.98 }] } : {}),
                            shadowColor: Colors.primary,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 12,
                            elevation: 4,
                        })}
                        onPress={handleRegister}
                        accessibilityRole="button"
                    >
                        <Text className="text-onPrimary text-[17px] font-bold">
                            {t('gate.register_cta')}
                        </Text>
                    </Pressable>

                    {/* Login link */}
                    <Pressable
                        className="flex-row justify-center items-center mt-5"
                        style={({ pressed }) => pressed ? { opacity: 0.6 } : undefined}
                        onPress={handleLogin}
                        accessibilityRole="button"
                    >
                        <Text className="text-[15px] text-onSurfaceVariant">{t('gate.have_account')}</Text>
                        <Text className="text-[15px] font-bold text-primary">{t('gate.login_link')}</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}
