import { Image, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';

import { useT } from '@/features/i18n/context/LocaleContext';
import { Icon } from '@/shared/components/Icon';
import { Colors } from '@/shared/constants/colors';

interface ChatHeaderProps {
    readonly name: string;
    readonly avatarUrl: string | null;
    readonly isOnline: boolean;
    readonly isTyping: boolean;
}

export function ChatHeader({ name, avatarUrl, isOnline, isTyping }: ChatHeaderProps): React.JSX.Element {
    const t = useT();

    return (
        <View className="flex-row items-center px-3 py-3 gap-2 bg-surface border-b border-outlineVariant">
            <Pressable
                className="w-10 h-10 justify-center items-center"
                style={({ pressed }) => pressed ? { opacity: 0.6 } : undefined}
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Go back"
            >
                <Icon name="arrow-left" size={22} color={Colors.onSurface} />
            </Pressable>

            <View className="flex-1 flex-row items-center gap-[10px]">
                <View className="relative">
                    {avatarUrl != null ? (
                        <Image source={{ uri: avatarUrl }} className="w-10 h-10 rounded-full bg-surfaceContainerHigh" />
                    ) : (
                        <View className="w-10 h-10 rounded-full bg-surfaceContainerHigh justify-center items-center bg-primaryContainer">
                            <Text className="text-base font-bold text-onPrimary">
                                {name[0]?.toUpperCase() ?? '?'}
                            </Text>
                        </View>
                    )}
                    {isOnline && (
                        <View className="absolute bottom-0 right-0 w-[11px] h-[11px] rounded-full bg-success border-2 border-surface" />
                    )}
                </View>

                <View className="gap-[1px]">
                    <Text className="text-base font-bold text-onSurface" numberOfLines={1}>{name}</Text>
                    <Text className="text-xs text-onSurfaceVariant">
                        {isTyping ? t('chat.typing') : isOnline ? t('chat.online') : t('chat.offline')}
                    </Text>
                </View>
            </View>
        </View>
    );
}
