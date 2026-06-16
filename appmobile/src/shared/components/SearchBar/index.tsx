import { Pressable, TextInput, View } from 'react-native';

import { Icon } from '@/shared/components/Icon';
import { Colors } from '@/shared/constants/colors';

interface SearchBarProps {
    readonly value: string;
    readonly onChangeText: (text: string) => void;
    readonly onFilter?: () => void;
    readonly placeholder?: string;
    readonly onSubmitEditing?: () => void;
}

export function SearchBar({
    value,
    onChangeText,
    onFilter,
    placeholder = 'Search for any home service...',
    onSubmitEditing,
}: SearchBarProps): React.JSX.Element {
    return (
        <View
            className="flex-row items-center bg-surfaceContainerLowest rounded-xl border border-[rgba(196,198,209,0.3)] px-4 h-12"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
            }}
        >
            <View className="mr-3 justify-center items-center">
                <Icon name="search" size={20} color={Colors.outline} />
            </View>

            <TextInput
                className="flex-1 text-base text-onSurface h-full p-0"
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={Colors.outline}
                returnKeyType="search"
                clearButtonMode="while-editing"
                onSubmitEditing={onSubmitEditing}
            />

            {onFilter != null && (
                <Pressable
                    className="flex-row items-center h-full ml-3"
                    style={({ pressed }) => pressed ? { opacity: 0.7 } : undefined}
                    onPress={onFilter}
                    accessibilityLabel="Filter results"
                >
                    <View className="w-px h-6 bg-[rgba(196,198,209,0.3)] mr-3" />
                    <Icon name="tune" size={20} color={Colors.primary} />
                </Pressable>
            )}
        </View>
    );
}
