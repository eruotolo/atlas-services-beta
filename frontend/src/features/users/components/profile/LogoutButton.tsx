'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function LogoutButton() {
    function handleLogout() {
        signOut({ callbackUrl: '/login', redirect: true });
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
