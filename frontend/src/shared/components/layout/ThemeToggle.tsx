'use client';

import { useEffect, useState } from 'react';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Evitar errores de hidratación asegurándonos de que el componente esté montado
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="h-9 w-9" />; // Placeholder para evitar saltos visuales
    }

    const isDark = resolvedTheme === 'dark';

    return (
        <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-all hover:border-brand hover:text-brand dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400 dark:hover:border-brand dark:hover:text-brand-light"
            aria-label="Cambiar tema"
        >
            {isDark ? (
                <Sun size={18} className="transition-all" />
            ) : (
                <Moon size={18} className="transition-all" />
            )}
        </button>
    );
}
