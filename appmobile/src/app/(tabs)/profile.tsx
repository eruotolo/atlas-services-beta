import { Alert, Image, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { Colors } from '@/shared/constants/colors';
import { Icon } from '@/shared/components/Icon';
import { FavoriteServiceCard } from '@/features/profile/components/FavoriteServiceCard';
import { MenuRow } from '@/features/profile/components/MenuRow';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useAuthGate } from '@/features/auth/hooks/useAuthGate';
import { useT } from '@/features/i18n/context/LocaleContext';
import { getFavorites } from '@/features/favorites/actions/queries';
import { getUnreadCount } from '@/features/messages/actions/queries';

const TOP_BAR_HEIGHT = 52;

export default function ProfileScreen(): React.JSX.Element {
    const insets = useSafeAreaInsets();
    const t = useT();
    const { user, isAuthenticated, logout, activeRole, toggleRole } = useAuth();
    const requireAuth = useAuthGate();

    const { data: favorites = [] } = useQuery({
        queryKey: ['favorites'],
        queryFn: getFavorites,
        enabled: isAuthenticated,
        staleTime: 5 * 60_000,
    });

    const { data: unreadCount = 0 } = useQuery({
        queryKey: ['unread-count'],
        queryFn: getUnreadCount,
        enabled: isAuthenticated,
        staleTime: 60_000,
    });

    const displayName = isAuthenticated && user != null ? user.name.split(' ')[0] : t('profile.guest');
    const avatarUri = isAuthenticated && user?.avatar != null ? user.avatar : null;

    const handleLogout = (): void => {
        Alert.alert(t('profile.logout_confirm_title'), t('profile.logout_confirm_body'), [
            { text: t('profile.cancel'), style: 'cancel' },
            {
                text: t('profile.logout'),
                style: 'destructive',
                onPress: () => { void logout(); },
            },
        ]);
    };

    const handleProtected = (action: () => void): void => {
        if (!isAuthenticated) {
            requireAuth('book', action);
            return;
        }
        action();
    };

    return (
        <View className="flex-1 bg-surface">
            {/* Fixed top bar */}
            <View
                className="absolute top-0 left-0 right-0 z-10 flex-row justify-between items-center px-5 pb-3 bg-surface border-b border-outlineVariant"
                style={{ paddingTop: insets.top + 8 }}
            >
                <Image
                    source={require('@/assets/images/logo.png')}
                    style={{ width: 110, height: 30 }}
                    resizeMode="contain"
                />
                <Pressable
                    className="w-10 h-10 justify-center items-center"
                    style={({ pressed }) => pressed ? { opacity: 0.7 } : undefined}
                    onPress={() => router.push('/notifications' as any)}
                    accessibilityLabel="Notifications"
                    accessibilityRole="button"
                >
                    {Platform.OS === 'ios' ? (
                        <SymbolView name="bell.fill" size={22} tintColor={Colors.onSurface} />
                    ) : (
                        <Icon name="bell" size={22} color={Colors.onSurface} />
                    )}
                    {unreadCount > 0 && (
                        <View
                            className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error"
                            style={{ borderWidth: 1.5, borderColor: Colors.surface }}
                        />
                    )}
                </Pressable>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingTop: TOP_BAR_HEIGHT + insets.top + 8,
                    paddingBottom: 32,
                    gap: 24,
                }}
            >
                {/* Avatar + name + trust badge */}
                <View className="items-center gap-3 pt-4">
                    <View
                        className="w-28 h-28 rounded-full border-[3px] border-surfaceContainerLowest"
                        style={{
                            shadowColor: Colors.primary,
                            shadowOffset: { width: 0, height: 6 },
                            shadowOpacity: 0.15,
                            shadowRadius: 16,
                            elevation: 8,
                        }}
                    >
                        {avatarUri != null ? (
                            <Image source={{ uri: avatarUri }} className="w-full h-full rounded-full" resizeMode="cover" />
                        ) : (
                            <View className="w-full h-full rounded-full bg-surfaceContainerLow justify-center items-center">
                                <Icon name="user-filled" size={48} color={Colors.onSurfaceVariant} />
                            </View>
                        )}
                    </View>

                    <Text className="text-[26px] font-extrabold text-primary tracking-[-0.4px]">
                        {displayName}
                    </Text>

                    {isAuthenticated && (
                        <View
                            className="flex-row items-center gap-1.5 bg-surfaceContainerLowest px-[18px] py-[10px] rounded-full border border-outlineVariant"
                            style={{
                                shadowColor: Colors.primary,
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.07,
                                shadowRadius: 8,
                                elevation: 2,
                            }}
                        >
                            <Icon name="badge-check" size={18} color={Colors.secondary} />
                            <Text className="text-xs font-bold text-primary tracking-[0.8px] uppercase">
                                {activeRole === 'PROVIDER'
                                    ? t('profile.provider_mode', { defaultValue: 'Provider Mode' })
                                    : t('profile.verified')}
                            </Text>
                        </View>
                    )}

                    {!isAuthenticated && (
                        <Pressable
                            className="bg-primary rounded-full px-8 py-3 mt-1"
                            style={({ pressed }) => pressed ? { opacity: 0.85 } : undefined}
                            onPress={() => router.push('/(auth)/login')}
                            accessibilityRole="button"
                        >
                            <Text className="text-onPrimary text-[15px] font-bold">{t('profile.sign_in')}</Text>
                        </Pressable>
                    )}
                </View>

                {/* Favorite Services */}
                {favorites.length > 0 && <View className="gap-[14px]">
                    <View className="flex-row justify-between items-center px-5">
                        <Text className="text-[17px] font-bold text-onSurface tracking-[-0.2px]">
                            {t('profile.favorites')}
                        </Text>
                        <Pressable accessibilityRole="button">
                            <Text className="text-xs font-bold text-primary tracking-[0.5px] uppercase">
                                {t('profile.see_all')}
                            </Text>
                        </Pressable>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerClassName="px-5 gap-3"
                    >
                        {favorites.map((s) => (
                            <FavoriteServiceCard
                                key={s.id}
                                service={s}
                                onPress={(id) => router.push(`/service/${id}`)}
                            />
                        ))}
                    </ScrollView>
                </View>}

                {/* Menu */}
                <View
                    className="mx-5 bg-surfaceContainerLowest rounded-2xl overflow-hidden border border-outlineVariant"
                    style={{
                        shadowColor: Colors.primary,
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.05,
                        shadowRadius: 12,
                        elevation: 3,
                    }}
                >
                    <MenuRow
                        label={t('profile.edit_profile', { defaultValue: 'Edit Profile' })}
                        iconName="user"
                        iconBg={`${Colors.primary}22`}
                        iconColor={Colors.primary}
                        onPress={() => handleProtected(() => router.push('/profile/edit'))}
                    />
                    <MenuRow
                        label={t('profile.change_password', { defaultValue: 'Change Password' })}
                        iconName="lock"
                        iconBg={`${Colors.primary}22`}
                        iconColor={Colors.primary}
                        onPress={() => handleProtected(() => router.push('/profile/password'))}
                    />
                    <MenuRow
                        label={t('profile.addresses', { defaultValue: 'My Addresses' })}
                        iconName="home-pin"
                        iconBg={`${Colors.secondary}22`}
                        iconColor={Colors.secondary}
                        onPress={() => handleProtected(() => router.push('/profile/addresses'))}
                    />
                    <MenuRow
                        label={t('profile.my_bookings')}
                        iconName="work-history"
                        iconBg={`${Colors.primaryContainer}33`}
                        iconColor={Colors.primaryContainer}
                        onPress={() => handleProtected(() => router.push('/(tabs)/bookings'))}
                    />
                    {isAuthenticated && (
                        <MenuRow
                            label={t('profile.my_services', { defaultValue: 'My Services' })}
                            iconName="briefcase"
                            iconBg={`${Colors.secondary}22`}
                            iconColor={Colors.secondary}
                            onPress={() => router.push('/profile/my-services' as any)}
                        />
                    )}
                    {isAuthenticated && user?.roles?.includes('PROVIDER') && (
                        <MenuRow
                            label={t('profile.available_jobs', { defaultValue: 'Available Jobs' })}
                            iconName="file-text"
                            iconBg={`${Colors.secondary}22`}
                            iconColor={Colors.secondary}
                            onPress={() => router.push('/profile/leads' as any)}
                        />
                    )}
                    {isAuthenticated && user?.roles?.includes('PROVIDER') && (
                        <MenuRow
                            label={t('profile.verify_identity', { defaultValue: 'Verify Identity' })}
                            iconName="users"
                            iconBg={`${Colors.secondary}22`}
                            iconColor={Colors.secondary}
                            onPress={() => router.push('/profile/kyc' as any)}
                        />
                    )}
                    <MenuRow
                        label={t('profile.payments')}
                        subtitle={t('profile.payments_subtitle')}
                        iconName="credit-card"
                        iconBg={`${Colors.secondary}22`}
                        iconColor={Colors.secondary}
                        onPress={() => handleProtected(() => {})}
                    />
                    <MenuRow
                        label={t('profile.support')}
                        iconName="headset"
                        iconBg={Colors.surfaceContainerHigh}
                        iconColor={Colors.onSurfaceVariant}
                        onPress={() => {}}
                    />
                    <MenuRow
                        label={t('profile.settings')}
                        iconName="settings"
                        iconBg={Colors.surfaceContainerHigh}
                        iconColor={Colors.onSurfaceVariant}
                        onPress={() => handleProtected(() => {})}
                        isLast={!isAuthenticated || !user?.roles?.includes('PROVIDER')}
                    />
                    {isAuthenticated && user?.roles?.includes('PROVIDER') && (
                        <MenuRow
                            label={activeRole === 'CLIENT'
                                ? t('profile.switch_to_provider', { defaultValue: 'Switch to Provider' })
                                : t('profile.switch_to_client', { defaultValue: 'Switch to Client' })}
                            iconName="users"
                            iconBg={`${Colors.primaryContainer}33`}
                            iconColor={Colors.primaryContainer}
                            onPress={() => void toggleRole()}
                            isLast
                        />
                    )}
                </View>

                {/* Log Out */}
                {isAuthenticated && (
                    <Pressable
                        className="mx-5 rounded-2xl border-[1.5px] border-outlineVariant h-[52px] flex-row justify-center items-center gap-2 mb-2"
                        style={({ pressed }) => pressed ? { backgroundColor: Colors.errorContainer } : undefined}
                        onPress={handleLogout}
                        accessibilityRole="button"
                    >
                        <Icon name="log-out" size={18} color={Colors.error} />
                        <Text className="text-[15px] font-semibold text-error">{t('profile.logout')}</Text>
                    </Pressable>
                )}
            </ScrollView>
        </View>
    );
}
