import { Image, Pressable, Text, View } from 'react-native';

import type { FavoriteService } from '@/features/profile/types';
import { Icon } from '@/shared/components/Icon';
import { Colors } from '@/shared/constants/colors';

interface FavoriteServiceCardProps {
    readonly service: FavoriteService;
    readonly onPress: (id: string) => void;
}

export function FavoriteServiceCard({ service, onPress }: FavoriteServiceCardProps): React.JSX.Element {
    return (
        <Pressable
            className="w-[148px] bg-surfaceContainerLowest rounded-2xl overflow-hidden border border-outlineVariant"
            style={({ pressed }) => ({
                ...(pressed ? { opacity: 0.85 } : {}),
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
            })}
            onPress={() => onPress(service.id)}
            accessibilityRole="button"
            accessibilityLabel={service.name}
        >
            <Image
                source={{ uri: service.imageUrl }}
                className="w-full h-[92px] bg-surfaceContainerHigh"
                resizeMode="cover"
            />
            <View className="p-[10px] gap-[5px]">
                <Text className="text-sm font-semibold text-onSurface" numberOfLines={1}>
                    {service.name}
                </Text>
                <View className="flex-row items-center gap-1">
                    <Icon name="star-filled" size={12} color={Colors.star} />
                    <Text className="text-[13px] text-onSurfaceVariant">{service.rating.toFixed(1)}</Text>
                </View>
            </View>
        </Pressable>
    );
}
