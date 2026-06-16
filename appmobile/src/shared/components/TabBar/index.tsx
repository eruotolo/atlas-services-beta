import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthGateContext, type GateAction } from '@/features/auth/context/AuthGateContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useT } from '@/features/i18n/context/LocaleContext';
import { Icon, type IconName } from '@/shared/components/Icon';
import { Colors } from '@/shared/constants/colors';

interface TabConfig {
    readonly name: string;
    readonly icon: IconName;
    readonly iconActive: IconName;
    readonly badge?: boolean;
    readonly gateAction?: GateAction;
}

const TABS: readonly TabConfig[] = [
    { name: 'home', icon: 'home', iconActive: 'home-filled' },
    { name: 'services', icon: 'tools', iconActive: 'tools', gateAction: 'publish' },
    { name: 'messages', icon: 'message', iconActive: 'message-filled', gateAction: 'message', badge: true },
    { name: 'bookings', icon: 'calendar', iconActive: 'calendar-filled', gateAction: 'book' },
    { name: 'profile', icon: 'user', iconActive: 'user-filled', gateAction: 'book' },
];

interface TabBarProps {
    readonly state: {
        index: number;
        routes: ReadonlyArray<{ key: string; name: string }>;
    };
    readonly navigation: {
        emit: (args: { type: string; target: string; canPreventDefault: true }) => { defaultPrevented: boolean };
        navigate: (name: string) => void;
    };
}

export function SharedTabBar({ state, navigation }: TabBarProps): React.JSX.Element {
    const insets = useSafeAreaInsets();
    const { isAuthenticated } = useAuth();
    const { open } = useAuthGateContext();
    const t = useT();

    return (
        <View
            className="flex-row rounded-t-xl border-t border-t-white/20 pt-[10px]"
            style={{
                backgroundColor: 'rgba(250, 248, 255, 0.95)',
                paddingBottom: Math.max(insets.bottom, 12),
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.12,
                shadowRadius: 20,
                elevation: 12,
            }}
        >
            {state.routes.map((route, index) => {
                const isFocused = state.index === index;
                const tab = TABS.find((t) => t.name === route.name);
                if (tab == null) return null;

                const onPress = (): void => {
                    if (!isAuthenticated && tab.gateAction != null) {
                        open(tab.gateAction);
                        return;
                    }
                    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                return (
                    <Pressable
                        key={route.key}
                        onPress={onPress}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isFocused }}
                        accessibilityLabel={t(`tabs.${tab.name}`)}
                        className={`flex-1 items-center gap-1 ${isFocused ? 'opacity-100' : 'opacity-70'}`}
                        style={isFocused ? { transform: [{ scale: 1.1 }] } : undefined}
                    >
                        {({ pressed, hovered }: any) => {
                            const isHovered = hovered === true;
                            const isPressed = pressed === true;
                            const currentColor =
                                isFocused || isHovered ? Colors.primary : Colors.onSurfaceVariant;

                            return (
                                <>
                                    <View
                                        className={`px-4 h-8 justify-center items-center rounded-full mb-1 ${isFocused ? 'bg-primary/10' : ''}`}
                                        style={isPressed ? { transform: [{ scale: 0.9 }] } : undefined}
                                    >
                                        <Icon
                                            name={isFocused ? tab.iconActive : tab.icon}
                                            size={24}
                                            color={currentColor}
                                        />
                                        {tab.badge === true && (
                                            <View className="absolute top-[5px] right-[7px] w-[7px] h-[7px] rounded-full bg-error border-[1.5px] border-surfaceContainerLowest" />
                                        )}
                                    </View>
                                    <Text
                                        className={`text-[10px] font-medium ${isFocused || isHovered ? 'text-primary font-bold' : 'text-onSurfaceVariant'}`}
                                    >
                                        {t(`tabs.${tab.name}`)}
                                    </Text>
                                </>
                            );
                        }}
                    </Pressable>
                );
            })}
        </View>
    );
}
