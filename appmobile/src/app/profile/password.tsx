import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Colors } from '@/shared/constants/colors';
import { Icon } from '@/shared/components/Icon';
import { apiClient } from '@/shared/lib/apiClient';
import { useT } from '@/features/i18n/context/LocaleContext';

export default function ChangePasswordScreen(): React.JSX.Element {
    const insets = useSafeAreaInsets();
    const t = useT();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async (): Promise<void> => {
        if (newPassword !== confirmPassword) {
            Alert.alert(t('error'), t('profile.passwords_not_match', { defaultValue: 'New passwords do not match' }));
            return;
        }
        setIsSubmitting(true);
        try {
            await apiClient.post('/auth/change-password', { currentPassword, newPassword });
            Alert.alert(
                t('profile.success'),
                t('profile.password_changed', { defaultValue: 'Password changed successfully' }),
            );
            router.back();
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : undefined;
            Alert.alert(t('error'), msg ?? t('profile.password_failed', { defaultValue: 'Failed to change password' }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = Boolean(currentPassword && newPassword && confirmPassword);

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-surface"
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View
                className="flex-row items-center justify-between px-4 pb-4 border-b border-outlineVariant"
                style={{ paddingTop: insets.top + 12 }}
            >
                <Pressable
                    className="w-10 h-10 justify-center items-center"
                    onPress={() => router.back()}
                >
                    <Icon name="arrow-left" size={24} color={Colors.onSurface} />
                </Pressable>
                <Text className="text-lg font-bold text-onSurface">
                    {t('profile.change_password', { defaultValue: 'Change Password' })}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
                <View className="gap-2">
                    <Text className="text-sm font-semibold text-onSurface">
                        {t('profile.current_password', { defaultValue: 'Current Password' })}
                    </Text>
                    <TextInput
                        className="bg-surfaceContainerLowest border border-outlineVariant rounded-xl p-4 text-base text-onSurface"
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry
                        placeholderTextColor={Colors.onSurfaceVariant}
                    />
                </View>

                <View className="gap-2">
                    <Text className="text-sm font-semibold text-onSurface">
                        {t('profile.new_password', { defaultValue: 'New Password' })}
                    </Text>
                    <TextInput
                        className="bg-surfaceContainerLowest border border-outlineVariant rounded-xl p-4 text-base text-onSurface"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                        placeholderTextColor={Colors.onSurfaceVariant}
                    />
                </View>

                <View className="gap-2">
                    <Text className="text-sm font-semibold text-onSurface">
                        {t('profile.confirm_password', { defaultValue: 'Confirm New Password' })}
                    </Text>
                    <TextInput
                        className="bg-surfaceContainerLowest border border-outlineVariant rounded-xl p-4 text-base text-onSurface"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        placeholderTextColor={Colors.onSurfaceVariant}
                    />
                </View>

                <Pressable
                    className="bg-primary rounded-xl p-4 items-center mt-3"
                    style={({ pressed }) => ({
                        opacity: pressed || isSubmitting || !isFormValid ? 0.7 : 1,
                    })}
                    onPress={() => { void handleSave(); }}
                    disabled={isSubmitting || !isFormValid}
                >
                    <Text className="text-onPrimary text-base font-bold">
                        {isSubmitting
                            ? t('profile.saving', { defaultValue: 'Saving...' })
                            : t('profile.update_password', { defaultValue: 'Update Password' })}
                    </Text>
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
