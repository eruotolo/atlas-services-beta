import { useRef, useState } from 'react';
import { Animated, TextInput, type TextInputProps, View } from 'react-native';

import { Colors } from '@/shared/constants/colors';

interface FloatingLabelInputProps extends Omit<TextInputProps, 'placeholder'> {
    label: string;
    rightElement?: React.ReactNode;
    containerClassName?: string;
}

export function FloatingLabelInput({
    label,
    rightElement,
    containerClassName,
    onFocus,
    onBlur,
    onChangeText,
    value,
    ...props
}: FloatingLabelInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(Boolean(value));
    const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

    const animate = (to: number): void => {
        Animated.timing(anim, { toValue: to, duration: 180, useNativeDriver: false }).start();
    };

    const handleFocus = (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]): void => {
        setIsFocused(true);
        animate(1);
        onFocus?.(e);
    };

    const handleBlur = (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]): void => {
        setIsFocused(false);
        if (!hasValue) animate(0);
        onBlur?.(e);
    };

    const handleChangeText = (text: string): void => {
        const filled = text.length > 0;
        setHasValue(filled);
        if (!isFocused && !filled) animate(0);
        onChangeText?.(text);
    };

    const isFloating = isFocused || hasValue;
    const borderColor = isFocused ? Colors.primaryContainer : Colors.outline;
    const borderWidth = isFocused ? 1.5 : 1;

    const labelTop = anim.interpolate({ inputRange: [0, 1], outputRange: [17, -9] });
    const labelFontSize = anim.interpolate({ inputRange: [0, 1], outputRange: [16, 12] });
    const labelColor = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [Colors.outline, Colors.primaryContainer],
    });

    return (
        <View className={containerClassName}>
            <View
                className="h-14 flex-row items-center rounded-lg"
                style={{ borderColor, borderWidth }}
            >
                <Animated.Text
                    className="absolute left-3 px-1 z-[1]"
                    style={{
                        top: labelTop,
                        fontSize: labelFontSize,
                        color: labelColor as unknown as string,
                        backgroundColor: isFloating ? Colors.surface : 'transparent',
                    }}
                    numberOfLines={1}
                >
                    {label}
                </Animated.Text>

                <TextInput
                    className={`flex-1 h-full px-4 text-base text-onSurface${rightElement != null ? ' pr-[52px]' : ''}`}
                    value={value}
                    placeholder=""
                    placeholderTextColor="transparent"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChangeText={handleChangeText}
                    {...props}
                />

                {rightElement != null && (
                    <View className="absolute right-0 w-[52px] h-full justify-center items-center">
                        {rightElement}
                    </View>
                )}
            </View>
        </View>
    );
}
