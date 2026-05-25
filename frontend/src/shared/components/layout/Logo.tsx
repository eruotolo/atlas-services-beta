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
                alt="Atlas Services"
                width={2371}
                height={938}
                className={`block dark:hidden ${sizeClass}`}
                priority
            />
            <Image
                src="/logo-white.png"
                alt="Atlas Services"
                width={2371}
                height={938}
                className={`hidden dark:block ${sizeClass}`}
                priority
            />
        </>
    );
};

export default Logo;
