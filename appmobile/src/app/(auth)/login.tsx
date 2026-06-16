import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { FloatingLabelInput } from '@/shared/components/FloatingLabelInput';
import { Icon } from '@/shared/components/Icon';
import { Colors } from '@/shared/constants/colors';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ApiError } from '@/shared/lib/apiClient';
import { useT } from '@/features/i18n/context/LocaleContext';

export default function LoginScreen(): React.JSX.Element {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { login } = useAuth();
    const t = useT();

    const [email, setEmail]          = useState('');
    const [password, setPassword]    = useState('');
    const [showPassword, setShowPwd] = useState(false);
    const [isLoading, setLoading]    = useState(false);
    const [error, setError]          = useState<string | null>(null);

    const handleLogin = async (): Promise<void> => {
        if (!email.trim() || !password) {
            setError(t('auth.login.error_empty'));
            return;
        }
        setError(null);
        setLoading(true);
        try {
            await login({ email: email.trim().toLowerCase(), password });
            router.replace('/home');
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.status === 401 ? t('auth.login.error_invalid') : err.message);
            } else {
                setError(t('auth.login.error_server'));
            }
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
                <View className="items-center mt-4 mb-10">
                    <Image
                        source={require('@/assets/images/logo.png')}
                        style={{ width: 180, height: 48, marginBottom: 24 }}
                        resizeMode="contain"
                    />
                    <Text className="text-[28px] leading-9 font-bold text-onBackground tracking-[-0.56px] text-center">
                        {t('auth.login.title')}
                    </Text>
                </View>

                <View className="gap-4 mb-2">
                    <FloatingLabelInput
                        label={t('auth.login.email')}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="emailAddress"
                    />

                    <View className="gap-2">
                        <FloatingLabelInput
                            label={t('auth.login.password')}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            textContentType="password"
                            rightElement={
                                <TouchableOpacity
                                    onPress={() => setShowPwd((v) => !v)}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    accessibilityLabel={showPassword ? t('auth.login.hide_password') : t('auth.login.show_password')}
                                >
                                    <Text className="text-xs font-semibold text-onSurfaceVariant tracking-[0.4px]">
                                        {showPassword ? t('auth.login.hide_password') : t('auth.login.show_password')}
                                    </Text>
                                </TouchableOpacity>
                            }
                        />
                        <TouchableOpacity
                            className="self-end"
                            hitSlop={{ top: 8, bottom: 8 }}
                            onPress={() => router.push('/forgot-password' as any)}
                        >
                            <Text className="text-sm leading-5 text-primary font-medium">
                                {t('auth.login.forgot_password')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {error != null && (
                    <View className="bg-errorContainer rounded-[10px] px-[14px] py-[10px] mb-2">
                        <Text className="text-sm text-onErrorContainer leading-5">{error}</Text>
                    </View>
                )}

                <Pressable
                    className="bg-primaryContainer rounded-xl h-14 justify-center items-center mt-2"
                    style={({ pressed }) => ({
                        ...(pressed ? { opacity: 0.88, transform: [{ scale: 0.98 }] } : {}),
                        ...(isLoading ? { opacity: 0.65 } : {}),
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 12,
                        elevation: 4,
                    })}
                    onPress={() => { void handleLogin(); }}
                    disabled={isLoading}
                >
                    {isLoading
                        ? <ActivityIndicator color={Colors.onPrimary} />
                        : <Text className="text-onPrimary text-lg font-semibold leading-7">{t('auth.login.cta')}</Text>
                    }
                </Pressable>

                <View className="flex-row items-center my-7 gap-3">
                    <View className="flex-1 h-px bg-outlineVariant" />
                    <Text className="text-sm text-onSurfaceVariant">{t('auth.login.or_continue_with')}</Text>
                    <View className="flex-1 h-px bg-outlineVariant" />
                </View>

                <View className="gap-3">
                    <SocialButton
                        label={t('auth.login.google')}
                        iconElement={<GoogleColorIcon size={20} />}
                        onPress={() => Alert.alert(
                            t('auth.social.coming_soon_title', { defaultValue: 'Coming Soon' }),
                            t('auth.social.coming_soon_body', { defaultValue: 'Google login will be available soon.' }),
                        )}
                    />
                    <SocialButton
                        label={t('auth.login.apple')}
                        iconElement={<Icon name="brand-apple" size={20} color={Colors.onSurface} />}
                        onPress={() => Alert.alert(
                            t('auth.social.coming_soon_title', { defaultValue: 'Coming Soon' }),
                            t('auth.social.coming_soon_body_apple', { defaultValue: 'Apple login will be available soon.' }),
                        )}
                    />
                    <SocialButton
                        label={t('auth.login.microsoft')}
                        iconElement={<Icon name="brand-microsoft" size={20} color="#00A4EF" />}
                        onPress={() => Alert.alert(
                            t('auth.social.coming_soon_title', { defaultValue: 'Coming Soon' }),
                            t('auth.social.coming_soon_body_microsoft', { defaultValue: 'Microsoft login will be available soon.' }),
                        )}
                    />
                </View>

                <View className="flex-row justify-center items-center mt-8">
                    <Text className="text-sm text-onSurfaceVariant">{t('auth.login.no_account')}</Text>
                    <Link href="/signup" asChild>
                        <TouchableOpacity>
                            <Text className="text-sm font-bold text-primary">{t('auth.login.sign_up_link')}</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

function GoogleColorIcon({ size }: { readonly size: number }): React.JSX.Element {
    return (
        <Svg width={size} height={size} viewBox="0 0 256 262">
            <Path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" />
            <Path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" />
            <Path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z" />
            <Path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" />
        </Svg>
    );
}

function SocialButton({
    label,
    iconElement,
    onPress,
}: {
    readonly label: string;
    readonly iconElement: React.JSX.Element;
    readonly onPress?: () => void;
}): React.JSX.Element {
    return (
        <Pressable
            className="border border-outlineVariant rounded-xl h-[52px] flex-row justify-center items-center gap-3 bg-surfaceContainerLowest"
            style={({ pressed }) => pressed ? { backgroundColor: Colors.surfaceContainerLow } : undefined}
            onPress={onPress}
            accessibilityRole="button"
        >
            {iconElement}
            <Text className="text-base font-semibold text-onSurface leading-6">{label}</Text>
        </Pressable>
    );
}
