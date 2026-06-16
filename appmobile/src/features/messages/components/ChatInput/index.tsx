import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { useT } from '@/features/i18n/context/LocaleContext';
import { Icon } from '@/shared/components/Icon';
import { Colors } from '@/shared/constants/colors';

interface ChatInputProps {
    readonly onSend: (content: string) => void;
    readonly onTyping?: () => void;
    readonly disabled?: boolean;
}

export function ChatInput({ onSend, onTyping, disabled = false }: ChatInputProps): React.JSX.Element {
    const t = useT();
    const [text, setText] = useState('');

    const handleSend = (): void => {
        const content = text.trim();
        if (!content || disabled) return;
        onSend(content);
        setText('');
    };

    const handleChange = (value: string): void => {
        setText(value);
        if (value.length > 0) onTyping?.();
    };

    const canSend = text.trim().length > 0 && !disabled;

    return (
        <View className="flex-row items-end px-4 py-[10px] gap-[10px] bg-surface border-t border-outlineVariant">
            <TextInput
                className="flex-1 min-h-[40px] max-h-[120px] bg-surfaceContainerLow rounded-[20px] px-4 py-[10px] text-[15px] text-onSurface border border-outlineVariant"
                value={text}
                onChangeText={handleChange}
                placeholder={t('messages.type_message')}
                placeholderTextColor={Colors.onSurfaceVariant}
                multiline
                maxLength={1000}
                returnKeyType="default"
                blurOnSubmit={false}
            />
            <Pressable
                className={`w-10 h-10 rounded-full justify-center items-center ${canSend ? 'bg-primary' : 'bg-surfaceContainerHigh'}`}
                onPress={handleSend}
                disabled={!canSend}
                accessibilityRole="button"
                accessibilityLabel={t('chat.send')}
            >
                <Icon name="send" size={20} color={canSend ? Colors.onPrimary : Colors.onSurfaceVariant} />
            </Pressable>
        </View>
    );
}
