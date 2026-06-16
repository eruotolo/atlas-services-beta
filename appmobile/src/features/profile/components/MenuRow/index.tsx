import { Pressable, Text, View } from 'react-native';

import { Icon, type IconName } from '@/shared/components/Icon';
import { Colors } from '@/shared/constants/colors';

interface MenuRowProps {
    readonly label: string;
    readonly subtitle?: string;
    readonly iconName: IconName;
    readonly iconBg: string;
    readonly iconColor: string;
    readonly onPress: () => void;
    readonly isLast?: boolean;
}

export function MenuRow({
    label,
    subtitle,
    iconName,
    iconBg,
    iconColor,
    onPress,
    isLast = false,
}: MenuRowProps): React.JSX.Element {
    return (
        <Pressable
            className={`flex-row items-center px-4 py-5 gap-[14px] bg-surfaceContainerLowest${!isLast ? ' border-b border-outlineVariant' : ''}`}
            style={({ pressed }) => pressed ? { backgroundColor: Colors.surfaceContainerLow } : undefined}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
        >
            <View
                className="w-10 h-10 rounded-full justify-center items-center"
                style={{ backgroundColor: iconBg }}
            >
                <Icon name={iconName} size={20} color={iconColor} />
            </View>
            <View className="flex-1 gap-[2px]">
                <Text className="text-[15px] font-medium text-onSurface">{label}</Text>
                {subtitle != null && subtitle.length > 0 && (
                    <Text className="text-[13px] text-onSurfaceVariant leading-[18px]">{subtitle}</Text>
                )}
            </View>
            <Icon name="chevron-right" size={20} color={Colors.outlineVariant} />
        </Pressable>
    );
}
