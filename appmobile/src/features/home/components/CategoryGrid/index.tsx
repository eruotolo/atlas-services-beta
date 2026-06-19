import { Pressable, ScrollView, Text, View } from 'react-native';

import { Icon, type IconName } from '@/shared/components/Icon';
import { Colors } from '@/shared/constants/colors';
import type { Category } from '@/features/home/types';

interface CategoryGridProps {
    readonly categories: readonly Category[];
    readonly onSelect: (id: string) => void;
    readonly selectedId?: string;
}

export function CategoryGrid({ categories, onSelect, selectedId }: CategoryGridProps): React.JSX.Element {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="px-5 gap-3 py-1"
        >
            {categories.map((cat) => {
                const isActive = cat.id === selectedId;
                return (
                    <Pressable
                        key={cat.id}
                        className="items-center gap-2 w-[88px]"
                        style={({ pressed }) =>
                            pressed ? { opacity: 0.75, transform: [{ scale: 0.95 }] } : undefined
                        }
                        onPress={() => onSelect(cat.id)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isActive }}
                        accessibilityLabel={cat.name}
                    >
                        <View
                            className={`w-16 h-16 rounded-2xl justify-center items-center ${isActive ? 'bg-primary' : 'bg-surfaceContainerLowest'}`}
                            style={{
                                shadowColor: Colors.primaryContainer,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.08,
                                shadowRadius: 20,
                                elevation: 3,
                            }}
                        >
                            <Icon
                                name={cat.iconName as IconName}
                                size={32}
                                color={isActive ? Colors.onPrimary : Colors.primary}
                            />
                        </View>
                        <Text
                            className={`text-sm text-center ${isActive ? 'font-bold text-primary' : 'font-normal text-onSurface'}`}
                            numberOfLines={1}
                        >
                            {cat.name}
                        </Text>
                    </Pressable>
                );
            })}
        </ScrollView>
    );
}
