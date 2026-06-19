import type { ComponentPropsWithoutRef, ReactElement } from 'react';

import { type HireIconName, HIRE_ICONS } from './icons';

interface IconProps extends Omit<ComponentPropsWithoutRef<'svg'>, 'name'> {
    name: HireIconName;
    size?: number;
    strokeWidth?: number;
}

export function Icon({
    name,
    size = 16,
    strokeWidth = 1.6,
    className,
    ...rest
}: IconProps): ReactElement {
    const SvgComp = HIRE_ICONS[name] || HIRE_ICONS.alert;
    return (
        <SvgComp
            width={size}
            height={size}
            strokeWidth={strokeWidth}
            className={className}
            {...rest}
        />
    );
}
