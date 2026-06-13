'use client';

import { useEffect, useState } from 'react';

import { ArrowUp } from '@/shared/components/icons';

export default function ScrollToTop() {
    const [visible, setVisible] = useState(false);
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            const shouldShow = window.scrollY > 400;
            if (shouldShow && !visible) {
                setExiting(false);
                setVisible(true);
            } else if (!shouldShow && visible) {
                setExiting(true);
                setTimeout(() => {
                    setVisible(false);
                    setExiting(false);
                }, 250);
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [visible]);

    if (!visible) return null;

    return (
        <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`scroll-top-fab ${exiting ? 'exiting' : ''}`}
            aria-label="Volver arriba"
        >
            <ArrowUp size={20} />
        </button>
    );
}
