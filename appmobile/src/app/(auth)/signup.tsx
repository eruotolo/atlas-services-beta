import { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FloatingLabelInput } from '@/shared/components/FloatingLabelInput';
import { Colors } from '@/shared/constants/colors';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useT } from '@/features/i18n/context/LocaleContext';
import { ApiError } from '@/shared/lib/apiClient';

export default function SignupScreen(): React.JSX.Element {
    const t = useT();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { role } = useLocalSearchParams<{ role?: string }>();
    const { register } = useAuth();

    const [name, setName]            = useState('');
    const [email, setEmail]          = useState('');
    const [phone, setPhone]          = useState('');
    const [password, setPassword]    = useState('');
    const [showPassword, setShowPwd] = useState(false);
    const [isLoading, setLoading]    = useState(false);
    const [error, setError]          = useState<string | null>(null);

    const handleSignup = async (): Promise<void> => {
        if (!name.trim() || !email.trim() || !password) {
            setError(t('auth.signup.error_empty'));
            return;
        }
        setError(null);
        setLoading(true);
        try {
            await register({
                nombre: name.trim(),
                email: email.trim().toLowerCase(),
                password,
                telefono: phone.trim() || undefined,
            });
            router.replace('/home');
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError(t('auth.signup.error_server'));
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
                <View className="items-center mt-4 mb-8">
                    <Image
                        source={require('@/assets/images/logo.png')}
                        style={{ width: 180, height: 48, marginBottom: 20 }}
                        resizeMode="contain"
                    />
                    <Text className="text-[28px] leading-9 font-bold text-onBackground tracking-[-0.56px] text-center">
                        {t('auth.signup.title')}
                    </Text>
                    {role != null && (
                        <View className="mt-[10px] bg-surfaceContainerLow rounded-[20px] px-[14px] py-[5px] border border-outlineVariant">
                            <Text className="text-[13px] font-semibold text-onSurfaceVariant">
                                {role === 'professional' ? '⚙ Professional' : '◉ Client'}
                            </Text>
                        </View>
                    )}
                </View>

                <View className="gap-4 mb-2">
                    <FloatingLabelInput
                        label={t('auth.signup.name')}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        textContentType="name"
                    />
                    <FloatingLabelInput
                        label={t('auth.signup.email')}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="emailAddress"
                    />
                    <FloatingLabelInput
                        label={t('auth.signup.phone')}
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        textContentType="telephoneNumber"
                    />
                    <View className="gap-2">
                        <FloatingLabelInput
                            label={t('auth.signup.password')}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            textContentType="newPassword"
                            rightElement={
                                <TouchableOpacity
                                    onPress={() => setShowPwd((v) => !v)}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    <Text className="text-xs font-semibold text-onSurfaceVariant tracking-[0.4px]">
                                        {showPassword ? 'Hide' : 'Show'}
                                    </Text>
                                </TouchableOpacity>
                            }
                        />
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
                    onPress={() => { void handleSignup(); }}
                    disabled={isLoading}
                    accessibilityRole="button"
                >
                    {isLoading ? (
                        <ActivityIndicator color={Colors.onPrimary} />
                    ) : (
                        <Text className="text-onPrimary text-lg font-semibold leading-7">{t('auth.signup.cta')}</Text>
                    )}
                </Pressable>

                <View className="flex-row justify-center items-center mt-8">
                    <Text className="text-sm text-onSurfaceVariant">{t('auth.signup.have_account')}</Text>
                    <TouchableOpacity
                        onPress={() => router.push('/login')}
                        hitSlop={{ top: 8, bottom: 8 }}
                        accessibilityRole="link"
                    >
                        <Text className="text-sm font-bold text-primary">{t('auth.signup.login_link')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
