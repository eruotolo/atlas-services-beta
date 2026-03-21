'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function LogoutButton() {
    const pathname = usePathname();
    const country = pathname.split('/')[1] ?? 'cl';

    function handleLogout() {
        signOut({ callbackUrl: `/${country}/login`, redirect: true });
    }

    return (
        <button
            type="button"
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center justify-between rounded-xl p-3 text-red-500 transition-all hover:bg-red-50"
        >
            <div className="flex items-center gap-3">
                <LogOut size={18} />
                <span className="text-sm font-medium">Cerrar Sesión</span>
            </div>
        </button>
    );
}
