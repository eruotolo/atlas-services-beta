import Link from 'next/link';

import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
    return (
        <section className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gray-50 py-12">
            <div className="container mx-auto px-4 text-center">
                <div className="mx-auto max-w-md">
                    <div className="mb-6 flex justify-center">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-50">
                            <ShieldAlert size={48} className="text-red-600" />
                        </div>
                    </div>
                    <h1 className="mb-4 text-3xl font-black text-gray-900">Acceso Restringido</h1>
                    <p className="mb-8 text-gray-600">
                        No tienes permisos para acceder a esta sección.
                    </p>
                    <Link
                        href="/"
                        className="btn-primary inline-block rounded-2xl px-8 py-3"
                    >
                        Volver al Inicio
                    </Link>
                </div>
            </div>
        </section>
    );
}
