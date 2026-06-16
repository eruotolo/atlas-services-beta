import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FloatingLabelInput } from '@/shared/components/FloatingLabelInput';
import { Icon } from '@/shared/components/Icon';
import { Colors } from '@/shared/constants/colors';
import { authService } from '@/features/auth/services/authService';
import { useT } from '@/features/i18n/context/LocaleContext';

export default function ForgotPasswordScreen(): React.JSX.Element {
    const insets = useSafeAreaInsets();
    const t = useT();

    const [email, setEmail] = useState('');
    const [isLoading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (): Promise<void> => {
        const trimmed = email.trim().toLowerCase();
        if (!trimmed.includes('@')) {
            setError(t('auth.forgot.error_invalid_email', { defaultValue: 'Enter a valid email address.' }));
            return;
        }
        setError(null);
        setLoading(true);
        try {
            await authService.forgotPassword(trimmed);
            setSent(true);
        } catch {
            setError(t('auth.forgot.error_server', { defaultValue: 'Could not send the reset link. Try again later.' }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-surface"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingHorizontal: 20,
                    paddingTop: insets.top + 16,
                    paddingBottom: insets.bottom + 32,
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Back */}
                <Pressable
                    className="w-10 h-10 justify-center items-center mb-6"
                    onPress={() => router.back()}
                    accessibilityRole="button"
                >
                    <Icon name="arrow-left" size={24} color={Colors.onSurface} />
                </Pressable>

                {sent ? (
                    <View className="flex-1 items-center justify-center gap-5 pt-10">
                        <View className="w-20 h-20 rounded-full bg-primaryContainer/20 justify-center items-center">
                            <Icon name="circle-check-filled" size={48} color={Colors.primary} />
                        </View>
                        <Text className="text-[26px] font-bold text-onSurface text-center tracking-[-0.3px]">
                            {t('auth.forgot.sent_title', { defaultValue: 'Check your email' })}
                        </Text>
                        <Text className="text-base text-onSurfaceVariant text-center leading-6 px-4">
                            {t('auth.forgot.sent_body', { defaultValue: `We sent a password reset link to ${email}` })}
                        </Text>
                        <Pressable
                            className="mt-4 bg-primaryContainer rounded-xl h-14 w-full justify-center items-center"
                            style={({ pressed }) => pressed ? { opacity: 0.88 } : undefined}
                            onPress={() => router.back()}
                        >
                            <Text className="text-onPrimary text-base font-semibold">
                                {t('auth.forgot.back_to_login', { defaultValue: 'Back to Login' })}
                            </Text>
                        </Pressable>
                    </View>
                ) : (
                    <View className="gap-6">
                        <View className="gap-2">
                            <Text className="text-[28px] font-bold text-onSurface tracking-[-0.56px]">
                                {t('auth.forgot.title', { defaultValue: 'Forgot password?' })}
                            </Text>
                            <Text className="text-base text-onSurfaceVariant leading-6">
                                {t('auth.forgot.subtitle', { defaultValue: "Enter your email and we'll send you a link to reset your password." })}
                            </Text>
                        </View>

                        <FloatingLabelInput
                            label={t('auth.login.email', { defaultValue: 'Email' })}
                            value={email}
                            onChangeText={(v) => { setEmail(v); setError(null); }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            textContentType="emailAddress"
                        />

                        {error != null && (
                            <View className="bg-errorContainer rounded-[10px] px-[14px] py-[10px]">
                                <Text className="text-sm text-onErrorContainer leading-5">{error}</Text>
                            </View>
                        )}

                        <Pressable
                            className="bg-primaryContainer rounded-xl h-14 justify-center items-center"
                            style={({ pressed }) => ({
                                ...(pressed ? { opacity: 0.88 } : {}),
                                ...(isLoading ? { opacity: 0.65 } : {}),
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.15,
                                shadowRadius: 12,
                                elevation: 4,
                            })}
                            onPress={() => { void handleSubmit(); }}
                            disabled={isLoading}
                        >
                            {isLoading
                                ? <ActivityIndicator color={Colors.onPrimary} />
                                : <Text className="text-onPrimary text-base font-semibold">
                                    {t('auth.forgot.cta', { defaultValue: 'Send Reset Link' })}
                                </Text>
                            }
                        </Pressable>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
