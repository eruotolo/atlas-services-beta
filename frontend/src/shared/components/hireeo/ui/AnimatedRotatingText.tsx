'use client';

import type React from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// useLayoutEffect fires before paint on the client (avoids "full text → empty → writes" flicker)
// and falls back to useEffect on SSR without warnings.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export type TextSegment = {
    text: string;
    className?: string;
    style?: React.CSSProperties;
};

interface AnimatedRotatingTextProps {
    segments: TextSegment[];
    className?: string;
    delay?: number;
    speed?: number;
}

// --- Pure helpers (outside component to keep cognitive complexity < 15) ---

interface CursorPosition {
    x: number;
    y: number;
}

function getCharPosition(
    containerEl: HTMLSpanElement,
    charEl: HTMLSpanElement,
    useRight: boolean,
): CursorPosition {
    const containerRect = containerEl.getBoundingClientRect();
    const charRect = charEl.getBoundingClientRect();
    return {
        x: (useRight ? charRect.right : charRect.left) - containerRect.left,
        y: charRect.top - containerRect.top,
    };
}

function applyCursorTransform(cursorEl: HTMLSpanElement, pos: CursorPosition): void {
    cursorEl.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
}

function moveCursor(
    index: number,
    totalChars: number,
    containerEl: HTMLSpanElement | null,
    cursorEl: HTMLSpanElement | null,
    charsArr: (HTMLSpanElement | null)[],
): void {
    if (!containerEl || !cursorEl) return;

    if (index < totalChars) {
        const charEl = charsArr[index];
        if (charEl) {
            applyCursorTransform(cursorEl, getCharPosition(containerEl, charEl, false));
        }
    } else if (index === totalChars) {
        const prevCharEl = charsArr[index - 1];
        if (prevCharEl) {
            applyCursorTransform(cursorEl, getCharPosition(containerEl, prevCharEl, true));
        }
    }
}

// Build flat character list with stable position-based keys (not array index as key).
interface CharItem {
    char: string;
    className?: string;
    style?: React.CSSProperties;
    /** Stable key: segment-index + char-index within segment. */
    key: string;
}

function buildCharacters(segments: TextSegment[]): CharItem[] {
    return segments.flatMap((segment, si) =>
        segment.text.split('').map((char, ci) => ({
            char,
            className: segment.className,
            style: segment.style,
            key: `${si}-${ci}`,
        })),
    );
}

// --- Component ---

export function AnimatedRotatingText({
    segments,
    className = '',
    delay = 300,
    speed = 50,
}: AnimatedRotatingTextProps): React.ReactElement {
    const characters = buildCharacters(segments);
    const totalChars = characters.length;

    // Default: show full text so SSR, pre-hydration, and reduced-motion users see the title
    // immediately without a gap. Animation is opt-in only on the client side.
    const [animate, setAnimate] = useState(false);
    const [revealed, setRevealed] = useState(totalChars);
    const containerRef = useRef<HTMLSpanElement>(null);
    const cursorRef = useRef<HTMLSpanElement>(null);
    const charsRef = useRef<(HTMLSpanElement | null)[]>([]);

    // Decide whether to animate (client only). Respects prefers-reduced-motion.
    useIsomorphicLayoutEffect(() => {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) {
            setAnimate(false);
            setRevealed(totalChars);
            return;
        }
        setAnimate(true);
        setRevealed(0);
    }, [totalChars]);

    // Main typewriter effect: writes one character per interval tick,
    // triggered by IntersectionObserver once visible in the viewport.
    useEffect(() => {
        if (!animate) return;

        let current = 0;
        let timeout: ReturnType<typeof setTimeout>;
        let interval: ReturnType<typeof setInterval>;
        let observer: IntersectionObserver;

        const start = (): void => {
            moveCursor(0, totalChars, containerRef.current, cursorRef.current, charsRef.current);

            interval = setInterval(() => {
                if (current <= totalChars) {
                    setRevealed(current);
                    moveCursor(
                        current,
                        totalChars,
                        containerRef.current,
                        cursorRef.current,
                        charsRef.current,
                    );
                    current++;
                } else {
                    clearInterval(interval);
                }
            }, speed);
        };

        setRevealed(0);

        if (containerRef.current) {
            observer = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting) {
                        timeout = setTimeout(start, delay);
                        observer.disconnect();
                    }
                },
                { threshold: 0.1 },
            );
            observer.observe(containerRef.current);
        }

        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
            observer?.disconnect();
        };
    }, [animate, totalChars, delay, speed]);

    // Recalculate cursor position on window resize.
    useEffect(() => {
        if (!animate) return;

        const handleResize = (): void => {
            const index = Math.min(revealed, totalChars);
            moveCursor(index, totalChars, containerRef.current, cursorRef.current, charsRef.current);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [animate, revealed, totalChars]);

    const showCursor = animate && revealed < totalChars;

    return (
        <span ref={containerRef} className={`relative inline-block ${className}`}>
            {/* Cursor (pipe) — visible only while the animation is running */}
            {showCursor ? (
                <span
                    ref={cursorRef}
                    className="pointer-events-none absolute left-0 top-0 z-10 transition-transform duration-75 ease-out"
                    style={{
                        width: '3px',
                        height: '1.1em',
                        marginTop: '0.05em',
                        backgroundColor: 'var(--accent)',
                        animation: 'tw-blink 0.8s infinite',
                        transform: 'translate3d(0,0,0)',
                    }}
                />
            ) : null}

            {/* Text */}
            <span className="relative z-0">
                {characters.map((item, i) => {
                    if (item.char === '\n') {
                        return <br key={item.key} />;
                    }
                    return (
                        <span
                            key={item.key}
                            ref={(el) => {
                                charsRef.current[i] = el;
                            }}
                            className={item.className}
                            style={{
                                ...item.style,
                                opacity: animate ? (i < revealed ? 1 : 0) : 1,
                                whiteSpace: item.char === ' ' ? 'pre' : 'normal',
                            }}
                        >
                            {item.char}
                        </span>
                    );
                })}
            </span>

            {/* Self-contained blink keyframe — no changes needed in globals.css */}
            <style
                // biome-ignore lint/security/noDangerouslySetInnerHtml: isolated keyframe injection, no user input
                dangerouslySetInnerHTML={{
                    __html: "@keyframes tw-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }",
                }}
            />
        </span>
    );
}
