import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

import { Colors } from '@/shared/constants/colors';
import { Icon } from '@/shared/components/Icon';
import { useAuth } from '@/features/auth/context/AuthContext';
import { apiClient } from '@/shared/lib/apiClient';
import { useT } from '@/features/i18n/context/LocaleContext';

interface KycSessionResponse {
    readonly url: string;
}

const STEPS = [
    { icon: 'user', key: 'step1' },
    { icon: 'file-text', key: 'step2' },
    { icon: 'circle-check-filled', key: 'step3' },
] as const;

export default function KycScreen(): React.JSX.Element {
    const insets = useSafeAreaInsets();
    const t = useT();
    const { user } = useAuth();
    const [isLoading, setLoading] = useState(false);

    const isVerified = (user as any)?.kycVerifiedAt != null;

    const handleStartVerification = async (): Promise<void> => {
        setLoading(true);
        try {
            const session = await apiClient.post<KycSessionResponse>('/kyc/session');
            if (!session.url) throw new Error('No verification URL received');

            const result = await WebBrowser.openAuthSessionAsync(session.url, 'appmobile://');
            if (result.type === 'success') {
                Alert.alert(
                    t('kyc.submitted_title', { defaultValue: 'Documents Submitted' }),
                    t('kyc.submitted_body', { defaultValue: 'Your identity is being verified. This may take a few minutes.' }),
                    [{ text: 'OK', onPress: () => router.back() }],
                );
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : undefined;
            Alert.alert(
                t('error', { defaultValue: 'Error' }),
                msg ?? t('kyc.error_body', { defaultValue: 'Could not start verification. Try again later.' }),
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-surface">
            <View
                className="flex-row items-center gap-3 px-4 pb-4 border-b border-outlineVariant"
                style={{ paddingTop: insets.top + 12 }}
            >
                <Pressable
                    className="w-10 h-10 justify-center items-center"
                    onPress={() => router.back()}
                    accessibilityRole="button"
                >
                    <Icon name="arrow-left" size={24} color={Colors.onSurface} />
                </Pressable>
                <Text className="flex-1 text-lg font-bold text-onSurface">
                    {t('kyc.title', { defaultValue: 'Identity Verification' })}
                </Text>
            </View>

            <ScrollView
                contentContainerStyle={{ padding: 24, gap: 24, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Status */}
                {isVerified ? (
                    <View className="items-center gap-3 py-8">
                        <Icon name="circle-check-filled" size={64} color={Colors.primary} />
                        <Text className="text-[22px] font-bold text-onSurface text-center">
                            {t('kyc.verified_title', { defaultValue: 'Identity Verified' })}
                        </Text>
                        <Text className="text-base text-onSurfaceVariant text-center leading-6">
                            {t('kyc.verified_body', { defaultValue: 'Your identity has been successfully verified. You can now access all provider features.' })}
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* Header */}
                        <View className="gap-3">
                            <View className="w-16 h-16 rounded-full bg-primaryContainer/20 justify-center items-center">
                                <Icon name="users" size={32} color={Colors.primary} />
                            </View>
                            <Text className="text-[26px] font-bold text-onSurface tracking-[-0.3px]">
                                {t('kyc.headline', { defaultValue: 'Verify your identity' })}
                            </Text>
                            <Text className="text-base text-onSurfaceVariant leading-6">
                                {t('kyc.subtitle', { defaultValue: 'Build trust with clients by verifying your identity. Required to receive payments.' })}
                            </Text>
                        </View>

                        {/* Steps */}
                        <View className="bg-surfaceContainerLowest rounded-2xl border border-outlineVariant p-5 gap-5">
                            <Text className="text-sm font-bold text-onSurface uppercase tracking-[0.5px]">
                                {t('kyc.how_it_works', { defaultValue: 'How it works' })}
                            </Text>
                            <View className="gap-4">
                                <StepRow
                                    number={1}
                                    icon="user"
                                    title={t('kyc.step1_title', { defaultValue: 'Enter your personal info' })}
                                    desc={t('kyc.step1_desc', { defaultValue: 'Full legal name and date of birth.' })}
                                />
                                <StepRow
                                    number={2}
                                    icon="file-text"
                                    title={t('kyc.step2_title', { defaultValue: 'Scan your ID' })}
                                    desc={t('kyc.step2_desc', { defaultValue: 'Passport, national ID or driver\'s license.' })}
                                />
                                <StepRow
                                    number={3}
                                    icon="circle-check-filled"
                                    title={t('kyc.step3_title', { defaultValue: 'Get verified' })}
                                    desc={t('kyc.step3_desc', { defaultValue: 'Usually takes a few minutes.' })}
                                />
                            </View>
                        </View>

                        {/* Trust badge */}
                        <View className="flex-row items-center gap-3 bg-surfaceContainerLow rounded-xl p-4">
                            <Icon name="circle-check-filled" size={20} color={Colors.primary} />
                            <Text className="flex-1 text-sm text-onSurfaceVariant leading-5">
                                {t('kyc.trust_note', { defaultValue: 'Powered by Stripe Identity. Your documents are processed securely and never stored on our servers.' })}
                            </Text>
                        </View>

                        {/* CTA */}
                        <Pressable
                            className="bg-primary rounded-2xl h-14 justify-center items-center"
                            style={({ pressed }) => ({
                                opacity: pressed || isLoading ? 0.65 : 1,
                                shadowColor: Colors.primary,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 12,
                                elevation: 6,
                            })}
                            onPress={() => { void handleStartVerification(); }}
                            disabled={isLoading}
                            accessibilityRole="button"
                        >
                            {isLoading ? (
                                <ActivityIndicator color={Colors.onPrimary} />
                            ) : (
                                <Text className="text-onPrimary text-[17px] font-bold">
                                    {t('kyc.cta', { defaultValue: 'Start Verification' })}
                                </Text>
                            )}
                        </Pressable>
                    </>
                )}
            </ScrollView>
        </View>
    );
}

function StepRow({
    number,
    icon,
    title,
    desc,
}: {
    readonly number: number;
    readonly icon: string;
    readonly title: string;
    readonly desc: string;
}): React.JSX.Element {
    return (
        <View className="flex-row items-start gap-4">
            <View className="w-9 h-9 rounded-full bg-primary/10 justify-center items-center shrink-0">
                <Text className="text-sm font-bold text-primary">{number}</Text>
            </View>
            <View className="flex-1 gap-0.5">
                <Text className="text-[15px] font-semibold text-onSurface">{title}</Text>
                <Text className="text-[13px] text-onSurfaceVariant leading-5">{desc}</Text>
            </View>
        </View>
    );
}
