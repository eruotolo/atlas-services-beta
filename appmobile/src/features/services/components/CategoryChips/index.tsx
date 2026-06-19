import { Pressable, ScrollView, Text } from 'react-native';

import { Icon, type IconName } from '@/shared/components/Icon';
import { Colors } from '@/shared/constants/colors';
import type { ServiceCategory } from '@/features/services/types';

interface CategoryChipsProps {
    readonly categories: readonly ServiceCategory[];
    readonly selectedId: string;
    readonly onSelect: (id: string) => void;
}

export function CategoryChips({ categories, selectedId, onSelect }: CategoryChipsProps): React.JSX.Element {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="px-5 gap-[10px] py-1"
        >
            {categories.map((cat) => {
                const isActive = cat.id === selectedId;
                return (
                    <Pressable
                        key={cat.id}
                        className={`flex-row items-center gap-2 px-5 py-[10px] rounded-full ${isActive ? 'bg-primaryContainer' : 'bg-surfaceContainerHigh'}`}
                        style={({ pressed }) => ({
                            ...(pressed ? { opacity: 0.8 } : {}),
                            ...(isActive ? {
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.05,
                                shadowRadius: 2,
                                elevation: 1,
                            } : {}),
                        })}
                        onPress={() => onSelect(cat.id)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isActive }}
                    >
                        <Icon
                            name={cat.icon as IconName}
                            size={14}
                            color={isActive ? Colors.onPrimaryContainer : Colors.onSurfaceVariant}
                        />
                        <Text
                            className={`text-xs font-bold tracking-[0.6px] ${isActive ? 'text-onPrimaryContainer' : 'text-onSurfaceVariant'}`}
                        >
                            {cat.label}
                        </Text>
                    </Pressable>
                );
            })}
        </ScrollView>
    );
}
