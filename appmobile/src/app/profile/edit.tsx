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
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { Colors } from '@/shared/constants/colors';
import { Icon } from '@/shared/components/Icon';
import { useAuth } from '@/features/auth/context/AuthContext';
import { apiClient } from '@/shared/lib/apiClient';
import { useT } from '@/features/i18n/context/LocaleContext';
import { uploadImage } from '@/features/users/lib/uploadImage';

export default function EditProfileScreen(): React.JSX.Element {
    const insets = useSafeAreaInsets();
    const { user, updateUser } = useAuth();
    const t = useT();

    const [name, setName] = useState(user?.name ?? '');
    const [phone, setPhone] = useState(user?.phone ?? '');
    const [avatar, setAvatar] = useState<string | null>(user?.avatar ?? null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    const handlePickAvatar = async (): Promise<void> => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                t('profile.photo_permission_title', { defaultValue: 'Permission Required' }),
                t('profile.photo_permission_body', { defaultValue: 'Allow access to your photos to update your avatar.' }),
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (result.canceled || result.assets.length === 0) return;

        const asset = result.assets[0];
        setAvatar(asset.uri);
        setIsUploadingAvatar(true);
        try {
            const url = await uploadImage(asset.uri, 'avatars');
            setAvatar(url);
            await apiClient.patch('/users/me', { avatar: url });
            await updateUser({ avatar: url });
        } catch {
            setAvatar(user?.avatar ?? null);
            Alert.alert(
                t('error', { defaultValue: 'Error' }),
                t('profile.avatar_upload_error', { defaultValue: 'Could not upload photo. Try again.' }),
            );
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleSave = async (): Promise<void> => {
        if (!name.trim()) return;
        setIsSubmitting(true);
        try {
            await apiClient.patch('/users/me', { name, phone });
            await updateUser({ name, phone: phone || null });
            Alert.alert(
                t('profile.success'),
                t('profile.update_success', { defaultValue: 'Profile updated successfully' }),
            );
            router.back();
        } catch {
            Alert.alert(t('error'), t('profile.update_failed', { defaultValue: 'Failed to update profile' }));
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    {t('profile.edit_profile', { defaultValue: 'Edit Profile' })}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
                {/* Avatar */}
                <View className="items-center gap-3">
                    <Pressable
                        className="relative"
                        onPress={() => { void handlePickAvatar(); }}
                        disabled={isUploadingAvatar}
                        accessibilityRole="button"
                        accessibilityLabel={t('profile.change_avatar', { defaultValue: 'Change profile photo' })}
                    >
                        {avatar != null ? (
                            <Image
                                source={{ uri: avatar }}
                                className="w-24 h-24 rounded-full bg-surfaceContainerHigh"
                                style={{ opacity: isUploadingAvatar ? 0.5 : 1 }}
                            />
                        ) : (
                            <View
                                className="w-24 h-24 rounded-full bg-surfaceContainerHigh justify-center items-center"
                                style={{ opacity: isUploadingAvatar ? 0.5 : 1 }}
                            >
                                <Text className="text-[36px] font-bold text-onSurface">
                                    {(user?.name ?? '?').charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                        <View
                            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary justify-center items-center border-2 border-surface"
                        >
                            {isUploadingAvatar
                                ? <ActivityIndicator size="small" color={Colors.onPrimary} />
                                : <Icon name="camera" size={14} color={Colors.onPrimary} />
                            }
                        </View>
                    </Pressable>
                    <Text className="text-sm text-onSurfaceVariant">
                        {t('profile.tap_to_change_photo', { defaultValue: 'Tap to change photo' })}
                    </Text>
                </View>

                {/* Email (readonly) */}
                <View className="gap-2">
                    <Text className="text-sm font-semibold text-onSurface">
                        {t('profile.email', { defaultValue: 'Email' })}
                    </Text>
                    <TextInput
                        className="bg-surfaceContainerHigh border border-outlineVariant rounded-xl p-4 text-base text-onSurfaceVariant"
                        value={user?.email}
                        editable={false}
                    />
                </View>

                {/* Name */}
                <View className="gap-2">
                    <Text className="text-sm font-semibold text-onSurface">
                        {t('profile.name', { defaultValue: 'Name' })}
                    </Text>
                    <TextInput
                        className="bg-surfaceContainerLowest border border-outlineVariant rounded-xl p-4 text-base text-onSurface"
                        value={name}
                        onChangeText={setName}
                        placeholder={t('profile.name_placeholder', { defaultValue: 'Your full name' })}
                        placeholderTextColor={Colors.onSurfaceVariant}
                    />
                </View>

                {/* Phone */}
                <View className="gap-2">
                    <Text className="text-sm font-semibold text-onSurface">
                        {t('profile.phone', { defaultValue: 'Phone' })}
                    </Text>
                    <TextInput
                        className="bg-surfaceContainerLowest border border-outlineVariant rounded-xl p-4 text-base text-onSurface"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        placeholder={t('profile.phone_placeholder', { defaultValue: 'Your phone number' })}
                        placeholderTextColor={Colors.onSurfaceVariant}
                    />
                </View>

                <Pressable
                    className="bg-primary rounded-xl p-4 items-center mt-3"
                    style={({ pressed }) => ({
                        opacity: pressed || isSubmitting || !name.trim() ? 0.7 : 1,
                    })}
                    onPress={() => { void handleSave(); }}
                    disabled={isSubmitting || !name.trim()}
                >
                    <Text className="text-onPrimary text-base font-bold">
                        {isSubmitting
                            ? t('profile.saving', { defaultValue: 'Saving...' })
                            : t('profile.save', { defaultValue: 'Save Changes' })}
                    </Text>
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
