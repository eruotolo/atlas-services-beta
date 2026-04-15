'use client';

import { useCallback, useEffect, useState } from 'react';

export function useRotatingText(words: string[], intervalMs = 3000) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isExiting, setIsExiting] = useState(false);

    const rotate = useCallback(() => {
        setIsExiting(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % words.length);
            setIsExiting(false);
        }, 350); // match heroWordOut duration
    }, [words.length]);

    useEffect(() => {
        const timer = setInterval(rotate, intervalMs);
        return () => clearInterval(timer);
    }, [rotate, intervalMs]);

    return {
        currentWord: words[currentIndex],
        className: isExiting ? 'hero-word-exit' : 'hero-word-enter',
    };
}
