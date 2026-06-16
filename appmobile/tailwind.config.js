/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [require('nativewind/preset')],
    content: ['./src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                // Material Design 3 tokens — keep in sync with src/shared/constants/colors.ts
                primary: '#002058',
                primaryContainer: '#1a3673',
                onPrimary: '#ffffff',
                onPrimaryContainer: '#89a1e5',
                onPrimaryFixedVariant: '#2a4482',

                secondary: '#385ab0',
                secondaryFixed: '#dbe1ff',
                onSecondaryFixed: '#00184a',
                onSecondaryFixedVariant: '#1a4197',

                surface: '#faf8ff',
                surfaceContainerLowest: '#ffffff',
                surfaceContainerLow: '#f4f3f9',
                surfaceContainer: '#eeedf3',
                surfaceContainerHigh: '#e9e7ed',
                surfaceContainerHighest: '#e3e2e8',
                surfaceDim: '#dad9df',

                onSurface: '#1a1b20',
                onSurfaceVariant: '#444650',
                onBackground: '#1a1b20',
                background: '#faf8ff',

                outline: '#757781',
                outlineVariant: '#c4c6d1',

                error: '#ba1a1a',
                errorContainer: '#ffdad6',
                onError: '#ffffff',
                onErrorContainer: '#93000a',

                // Semantic tokens — keep in sync with src/shared/constants/colors.ts
                success: '#22c55e',
                successContainer: '#dcfce7',
                onSuccess: '#16a34a',
                onSuccessContainer: '#16a34a',

                warning: '#f59e0b',
                warningContainer: '#fef3c7',
                onWarning: '#92400e',
                warningBorder: '#fcd34d',

                star: '#f59e0b',
            },
        },
    },
    plugins: [],
};
