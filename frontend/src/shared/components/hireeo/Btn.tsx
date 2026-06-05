import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';

import { Icon } from './Icon';
import type { HireIconName } from './icons';

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger' | 'dangerSolid';
type BtnSize = 'sm' | 'md' | 'lg';

interface BtnBaseProps {
    variant?: BtnVariant;
    size?: BtnSize;
    icon?: HireIconName;
    iconRight?: HireIconName;
    children?: ReactNode;
    className?: string;
}

type BtnProps = BtnBaseProps &
    (
        | ({ href: string; target?: string; rel?: string } & Omit<
              ButtonHTMLAttributes<HTMLAnchorElement>,
              keyof BtnBaseProps | 'href'
          >)
        | ({ href?: undefined } & Omit<
              ButtonHTMLAttributes<HTMLButtonElement>,
              keyof BtnBaseProps
          >)
    );

const sizeClasses: Record<BtnSize, string> = {
    sm: 'px-3 py-1.5 text-[12px] rounded-[7px] gap-1.5',
    md: 'px-4 py-2.5 text-[13px] rounded-lg gap-2',
    lg: 'px-[22px] py-3 text-sm rounded-[10px] gap-2',
};

const iconSize: Record<BtnSize, number> = {
    sm: 12,
    md: 14,
    lg: 16,
};

const variantClasses: Record<BtnVariant, string> = {
    primary: 'bg-ink text-bg border border-transparent hover:opacity-90',
    secondary: 'bg-bg text-ink border border-line hover:bg-tint',
    ghost: 'bg-transparent text-ink border border-transparent hover:bg-tint',
    accent: 'bg-accent text-white border border-transparent hover:bg-accent-bright',
    danger: 'bg-bg text-danger border border-line hover:bg-danger-soft',
    dangerSolid: 'bg-danger text-white border border-transparent hover:opacity-90',
};

export function Btn(props: BtnProps): ReactElement {
    const {
        variant = 'primary',
        size = 'md',
        icon,
        iconRight,
        children,
        className,
        ...domProps
    } = props;
    const base =
        'inline-flex items-center justify-center font-semibold tracking-[-0.005em] cursor-pointer whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
    const composed = [base, sizeClasses[size], variantClasses[variant], className]
        .filter(Boolean)
        .join(' ');

    const inner = (
        <>
            {icon ? <Icon name={icon} size={iconSize[size]} /> : null}
            {children}
            {iconRight ? <Icon name={iconRight} size={iconSize[size]} /> : null}
        </>
    );

    if ('href' in domProps && domProps.href) {
        const { href, target, rel, ...anchorRest } = domProps as {
            href: string;
            target?: string;
            rel?: string;
        } & ButtonHTMLAttributes<HTMLAnchorElement>;
        return (
            <Link href={href} target={target} rel={rel} className={composed} {...anchorRest}>
                {inner}
            </Link>
        );
    }

    const { type, ...rest } = domProps as ButtonHTMLAttributes<HTMLButtonElement>;
    return (
        <button type={type ?? 'button'} className={composed} {...rest}>
            {inner}
        </button>
    );
}
