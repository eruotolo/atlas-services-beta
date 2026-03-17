export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

import type { Metadata } from 'next';

import { getUserProfile } from '@/features/users/actions';
import AjustesPerfilForm from '@/features/users/components/profile/AjustesPerfilForm';

export const metadata: Metadata = {
    title: 'Ajustes de Perfil',
    robots: {
        index: false,
        follow: false,
    },
};

export default async function AjustesPerfilPage() {
    const backendUser = await getUserProfile();

    if (!backendUser) {
        redirect('/login');
    }

    const usuarioData = {
        id: backendUser.id,
        nombre: backendUser.name,
        email: backendUser.email,
        telefono: backendUser.phone ?? null,
        avatar: backendUser.avatar ?? null,
    };

    return (
        <section className="bg-background min-h-screen py-12 transition-colors duration-300 md:py-20">
            <div className="container mx-auto max-w-7xl px-4">
                <AjustesPerfilForm usuario={usuarioData} />
            </div>
        </section>
    );
}
