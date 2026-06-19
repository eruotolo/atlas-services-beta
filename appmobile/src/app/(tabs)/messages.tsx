import { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { Colors } from '@/shared/constants/colors';
import { Icon } from '@/shared/components/Icon';
import { ConversationRow } from '@/features/messages/components/ConversationRow';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useT } from '@/features/i18n/context/LocaleContext';
import { getConversations } from '@/features/messages/actions/queries';
import type { Conversation } from '@/features/messages/types';

export default function MessagesScreen(): React.JSX.Element {
    const insets = useSafeAreaInsets();
    const { isAuthenticated } = useAuth();
    const t = useT();
    const [search, setSearch] = useState('');
    const [headerHeight, setHeaderHeight] = useState(0);

    const { data: conversations = [], isLoading } = useQuery({
        queryKey: ['conversations'],
        queryFn: getConversations,
        enabled: isAuthenticated,
        staleTime: 30_000,
        refetchOnMount: true,
    });

    const filtered: readonly Conversation[] = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return conversations;
        return conversations.filter(
            (c) =>
                c.providerName.toLowerCase().includes(term) ||
                c.lastMessage.toLowerCase().includes(term),
        );
    }, [conversations, search]);

    if (!isAuthenticated) {
        return (
            <View className="flex-1 bg-surfaceContainerLowest">
                <View
                    className="flex-row items-center px-5 pb-3 bg-surface border-b border-outlineVariant"
                    style={{ paddingTop: insets.top + 8 }}
                >
                    <Image
                        source={require('@/assets/images/logo.png')}
                        style={{ width: 110, height: 30 }}
                        resizeMode="contain"
                    />
                </View>
                <View className="flex-1 justify-center items-center px-8 gap-4">
                    <Icon name="message" size={48} color={Colors.onSurfaceVariant} />
                    <Text className="text-lg font-bold text-onSurface text-center">
                        {t('messages.sign_in_to_view')}
                    </Text>
                    <Text className="text-sm text-onSurfaceVariant text-center leading-5">
                        {t('messages.start_conversation')}
                    </Text>
                    <Pressable
                        className="bg-primary rounded-full px-8 py-3 mt-2"
                        style={({ pressed }) => pressed ? { opacity: 0.85 } : undefined}
                        onPress={() => router.push('/(auth)/login')}
                        accessibilityRole="button"
                    >
                        <Text className="text-onPrimary text-[15px] font-bold">{t('profile.sign_in')}</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-surfaceContainerLowest">
            {/* Sticky header — height measured via onLayout to avoid magic numbers */}
            <View
                className="absolute top-0 left-0 right-0 z-10 bg-surface border-b border-outlineVariant px-5 pb-4 gap-3"
                style={{ paddingTop: insets.top + 8 }}
                onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
            >
                <Image
                    source={require('@/assets/images/logo.png')}
                    style={{ width: 110, height: 30 }}
                    resizeMode="contain"
                />
                <View className="flex-row items-center bg-surfaceContainerLow rounded-[14px] px-3 h-12 gap-2">
                    <Icon name="search" size={18} color={Colors.onSurfaceVariant} />
                    <TextInput
                        className="flex-1 text-[15px] text-onSurface h-full"
                        value={search}
                        onChangeText={setSearch}
                        placeholder={t('messages.search_placeholder')}
                        placeholderTextColor={Colors.onSurfaceVariant}
                        returnKeyType="search"
                        clearButtonMode="while-editing"
                    />
                    {search.length > 0 && (
                        <Pressable onPress={() => setSearch('')} hitSlop={8}>
                            <Icon name="x" size={16} color={Colors.onSurfaceVariant} />
                        </Pressable>
                    )}
                </View>
            </View>

            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: 32 }}
                ListHeaderComponent={
                    <Text className="text-[28px] font-extrabold text-onSurface tracking-[-0.5px] px-5 pt-5 pb-2">
                        {t('messages.title')}
                    </Text>
                }
                renderItem={({ item }) => (
                    <ConversationRow
                        conversation={item}
                        onPress={(id) => router.push(`/chat/${id}`)}
                    />
                )}
                ItemSeparatorComponent={() => (
                    <View
                        className="bg-surfaceContainerHigh"
                        style={{ height: 0.5, marginLeft: 90 }}
                    />
                )}
                ListEmptyComponent={
                    <View className="items-center py-12 px-8 gap-2">
                        <Text className="text-base font-semibold text-onSurface text-center">
                            {isLoading ? '...' : t('messages.no_conversations')}
                        </Text>
                        {!isLoading && (
                            <Text className="text-sm text-onSurfaceVariant text-center leading-5">
                                {t('messages.start_conversation')}
                            </Text>
                        )}
                    </View>
                }
            />
        </View>
    );
}
