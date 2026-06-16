import { Text, View } from 'react-native';

import type { Message } from '@/features/messages/types';

interface ChatBubbleProps {
    readonly message: Message;
    readonly isOwn: boolean;
}

function formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ChatBubble({ message, isOwn }: ChatBubbleProps): React.JSX.Element {
    return (
        <View className={`flex-row my-[3px] px-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <View
                className={`max-w-[75%] rounded-[18px] px-[14px] pt-[10px] pb-1.5 gap-1 ${isOwn ? 'bg-primary' : 'bg-surfaceContainerHigh'}`}
                style={isOwn ? { borderBottomRightRadius: 4 } : { borderBottomLeftRadius: 4 }}
            >
                <Text className={`text-[15px] leading-[21px] ${isOwn ? 'text-onPrimary' : 'text-onSurface'}`}>
                    {message.content}
                </Text>
                <Text
                    className={`text-[11px] self-end ${isOwn ? 'text-[rgba(255,255,255,0.7)]' : 'text-onSurfaceVariant'}`}
                >
                    {formatTime(message.createdAt)}
                </Text>
            </View>
        </View>
    );
}
