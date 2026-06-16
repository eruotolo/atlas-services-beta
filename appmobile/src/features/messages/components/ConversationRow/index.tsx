import { Image, Pressable, Text, View } from 'react-native';

import { TypingIndicator } from '@/features/messages/components/TypingIndicator';
import type { Conversation } from '@/features/messages/types';
import { Icon } from '@/shared/components/Icon';
import { Colors } from '@/shared/constants/colors';

interface ConversationRowProps {
    readonly conversation: Conversation;
    readonly onPress: (id: string) => void;
}

function MessageStatusIcon({ status }: { status: NonNullable<Conversation['messageStatus']> }): React.JSX.Element {
    if (status === 'seen') {
        return <Icon name="check-double" size={16} color={Colors.secondary} />;
    }
    if (status === 'delivered') {
        return <Icon name="check-double" size={16} color={Colors.outlineVariant} />;
    }
    return <Icon name="check" size={16} color={Colors.outlineVariant} />;
}

export function ConversationRow({ conversation, onPress }: ConversationRowProps): React.JSX.Element {
    const hasUnread = conversation.unreadCount > 0;
    const isTyping = conversation.isTyping === true;
    const isOnline = conversation.isOnline === true;
    const hasStatus = conversation.messageStatus != null && !hasUnread && !isTyping;

    return (
        <Pressable
            className="flex-row items-center px-5 py-4 gap-[14px] bg-surfaceContainerLowest"
            style={({ pressed }) => pressed ? { backgroundColor: Colors.surfaceContainerLow } : undefined}
            onPress={() => onPress(conversation.id)}
            accessibilityRole="button"
            accessibilityLabel={`Conversation with ${conversation.providerName}`}
        >
            {/* Avatar with optional online dot */}
            <View className="relative shrink-0">
                {conversation.providerAvatarUrl != null ? (
                    <Image
                        source={{ uri: conversation.providerAvatarUrl }}
                        className="w-14 h-14 rounded-full bg-surfaceContainerHigh"
                    />
                ) : (
                    <View className="w-14 h-14 rounded-full bg-surfaceContainerHighest justify-center items-center">
                        <Text className="text-xl font-bold text-onSurfaceVariant">
                            {conversation.providerName.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )}
                {isOnline && (
                    <View className="absolute bottom-[1px] right-[1px] w-[13px] h-[13px] rounded-full bg-success border-2 border-surfaceContainerLowest" />
                )}
            </View>

            {/* Content */}
            <View className="flex-1 gap-1 min-w-0">
                {/* Top row: name + timestamp */}
                <View className="flex-row justify-between items-baseline gap-2">
                    <Text className="text-[18px] font-bold text-onSurface flex-1" numberOfLines={1}>
                        {conversation.providerName}
                    </Text>
                    <Text
                        className={`text-xs shrink-0 ${hasUnread ? 'text-primary font-bold' : 'text-onSurfaceVariant'}`}
                    >
                        {conversation.timestamp}
                    </Text>
                </View>

                {/* Bottom row: preview/typing + badge */}
                <View className="flex-row justify-between items-center gap-2 min-w-0">
                    {isTyping ? (
                        <TypingIndicator />
                    ) : (
                        <View className="flex-1 flex-row items-center gap-[5px] min-w-0">
                            {hasStatus && conversation.messageStatus != null && (
                                <MessageStatusIcon status={conversation.messageStatus} />
                            )}
                            <Text
                                className={`text-[15px] flex-1 ${hasUnread ? 'text-onSurface font-semibold' : 'text-onSurfaceVariant'}`}
                                numberOfLines={1}
                            >
                                {conversation.lastMessage}
                            </Text>
                        </View>
                    )}

                    {hasUnread && (
                        <View className="bg-primaryContainer rounded-full min-w-5 h-5 justify-center items-center px-[5px] shrink-0">
                            <Text className="text-onPrimaryContainer text-[10px] font-bold">
                                {conversation.unreadCount}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </Pressable>
    );
}
