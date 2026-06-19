import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

import { useT } from '@/features/i18n/context/LocaleContext';

const DOT_COUNT = 3;
const CYCLE_MS = 280;
const STAGGER_MS = 160;

export function TypingIndicator(): React.JSX.Element {
    const t = useT();
    const anims = useRef(
        Array.from({ length: DOT_COUNT }, () => new Animated.Value(0.4))
    ).current;

    const animRefs = useRef<Animated.CompositeAnimation[]>([]);

    useEffect(() => {
        animRefs.current = anims.map((anim) =>
            Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, { toValue: 1, duration: CYCLE_MS, useNativeDriver: true }),
                    Animated.timing(anim, { toValue: 0.4, duration: CYCLE_MS, useNativeDriver: true }),
                ])
            )
        );

        anims.forEach((_, i) => {
            setTimeout(() => animRefs.current[i].start(), i * STAGGER_MS);
        });

        return () => {
            animRefs.current.forEach((a) => a.stop());
        };
    }, [anims]);

    return (
        <View className="flex-row items-center gap-2">
            <View className="flex-row items-center gap-[3px] bg-surfaceContainerHigh rounded-full px-2 py-[5px] h-6">
                {anims.map((anim, i) => (
                    <Animated.View
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-primary"
                        style={{ opacity: anim, transform: [{ scale: anim }] }}
                    />
                ))}
            </View>
            <Text className="text-[13px] text-secondary italic">{t('messages.typing')}</Text>
        </View>
    );
}
