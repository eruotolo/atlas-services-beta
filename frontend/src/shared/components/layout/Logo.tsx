'use client';

import Image from 'next/image';

interface LogoProps {
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
    const sizeClass = className ?? 'h-11 w-auto';

    return (
        <>
            <Image
                src="/logo.png"
                alt="Hireeo"
                width={1017}
                height={346}
                className={`block dark:hidden ${sizeClass}`}
                priority
            />
            <Image
                src="/logo-white.png"
                alt="Hireeo"
                width={1017}
                height={346}
                className={`hidden dark:block ${sizeClass}`}
                priority
            />
        </>
    );
};

export default Logo;
