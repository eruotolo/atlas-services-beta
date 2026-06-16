import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { Colors } from '@/shared/constants/colors';
import { Icon } from '@/shared/components/Icon';
import { useT } from '@/features/i18n/context/LocaleContext';
import { getConversations } from '@/features/messages/actions/queries';
import type { Conversation } from '@/features/messages/types';

function NotificationRow({ item }: { readonly item: Conversation }): React.JSX.Element {
    const timeLabel = (() => {
        const d = new Date(item.timestamp);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMin = Math.floor(diffMs / 60_000);
        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        const diffH = Math.floor(diffMin / 60);
        if (diffH < 24) return `${diffH}h ago`;
        return d.toLocaleDateString();
    })();

    return (
        <Pressable
            className={`flex-row items-start gap-3 px-5 py-4 ${item.unreadCount > 0 ? 'bg-primary/5' : ''}`}
            style={({ pressed }) => pressed ? { backgroundColor: Colors.surfaceContainerLow } : undefined}
            onPress={() => router.push(`/chat/${item.id}`)}
            accessibilityRole="button"
        >
            <View className="w-12 h-12 rounded-full bg-primaryContainer/20 justify-center items-center shrink-0">
                {item.unreadCount > 0 ? (
                    <View className="w-3 h-3 rounded-full bg-primary" />
                ) : (
                    <Icon name="message" size={22} color={Colors.primaryContainer} />
                )}
            </View>

            <View className="flex-1 gap-[2px]">
                <View className="flex-row items-center justify-between">
                    <Text className={`text-[15px] ${item.unreadCount > 0 ? 'font-bold text-onSurface' : 'font-medium text-onSurface'}`}>
                        {item.providerName}
                    </Text>
                    <Text className="text-xs text-onSurfaceVariant">{timeLabel}</Text>
                </View>
                <Text
                    className={`text-[13px] leading-[18px] ${item.unreadCount > 0 ? 'text-onSurface font-medium' : 'text-onSurfaceVariant'}`}
                    numberOfLines={2}
                >
                    {item.lastMessage}
                </Text>
            </View>
        </Pressable>
    );
}

export default function NotificationsScreen(): React.JSX.Element {
    const insets = useSafeAreaInsets();
    const t = useT();

    const { data: conversations = [], isLoading } = useQuery({
        queryKey: ['conversations'],
        queryFn: getConversations,
        staleTime: 30_000,
    });

    const sorted = [...conversations].sort((a, b) => {
        if (b.unreadCount !== a.unreadCount) return b.unreadCount - a.unreadCount;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return (
        <View className="flex-1 bg-surfaceContainerLowest">
            <View
                className="flex-row items-center gap-3 px-4 pb-3 border-b border-outlineVariant bg-surface"
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
                    {t('notifications.title', { defaultValue: 'Notifications' })}
                </Text>
            </View>

            <FlatList
                data={sorted as Conversation[]}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                ListHeaderComponent={
                    <Text className="text-[28px] font-extrabold text-onSurface tracking-[-0.5px] px-5 pt-5 pb-2">
                        {t('notifications.title', { defaultValue: 'Notifications' })}
                    </Text>
                }
                renderItem={({ item }) => <NotificationRow item={item} />}
                ItemSeparatorComponent={() => (
                    <View className="bg-outlineVariant" style={{ height: 0.5, marginHorizontal: 20 }} />
                )}
                ListEmptyComponent={
                    <View className="items-center py-16 gap-3">
                        <Icon name="bell" size={56} color={Colors.outlineVariant} />
                        <Text className="text-lg font-bold text-onSurface text-center">
                            {isLoading ? '...' : t('notifications.empty_title', { defaultValue: 'No notifications' })}
                        </Text>
                        {!isLoading && (
                            <Text className="text-sm text-onSurfaceVariant text-center px-8">
                                {t('notifications.empty_desc', { defaultValue: 'You\'ll see message activity and updates here.' })}
                            </Text>
                        )}
                    </View>
                }
            />
        </View>
    );
}
