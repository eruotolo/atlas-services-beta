import Image from 'next/image';
import type { ReactElement } from 'react';

interface AvatarProps {
    name: string;
    size?: number;
    src?: string;
    ring?: boolean;
}

function initialsFromName(name: string): string {
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts
        .map((p) => p.charAt(0).toUpperCase())
        .join('')
        .padEnd(1, '?');
}

function gradientFromName(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i += 1) {
        hash = (hash << 5) - hash + name.charCodeAt(i);
        hash |= 0;
    }
    const hue = Math.abs(hash) % 360;
    const hue2 = (hue + 35) % 360;
    return `linear-gradient(135deg, hsl(${hue} 60% 55%), hsl(${hue2} 65% 45%))`;
}

export function Avatar({ name, size = 36, src, ring = false }: AvatarProps): ReactElement {
    const initials = initialsFromName(name);
    const fontSize = Math.max(10, Math.round(size * 0.38));
    return (
        <div
            role="img"
            aria-label={name}
            className="relative inline-flex items-center justify-center overflow-hidden rounded-full font-semibold text-white select-none"
            style={{
                width: size,
                height: size,
                fontSize,
                background: src ? 'transparent' : gradientFromName(name),
                boxShadow: ring ? '0 0 0 2px var(--bg), 0 0 0 3px var(--line)' : undefined,
                letterSpacing: '-0.01em',
            }}
        >
            {src ? (
                <Image
                    src={src}
                    alt={name}
                    width={size}
                    height={size}
                    className="h-full w-full object-cover"
                />
            ) : (
                initials
            )}
        </div>
    );
}
