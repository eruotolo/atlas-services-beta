'use client';

import { useState, useId, type FormEvent, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';

import { actualizarPassword } from '@/features/users/actions';
import { Btn } from '@/shared/components/hireeo';
import { formNotify } from '@/shared/lib/formNotify';

interface AdminPasswordFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export function AdminPasswordForm({ onSuccess, onCancel }: AdminPasswordFormProps): ReactElement {
    const router = useRouter();
    const baseId = useId();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const currentPassword = formData.get('currentPassword') as string;
        const newPassword = formData.get('newPassword') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (newPassword !== confirmPassword) {
            setError('La nueva contraseña y la confirmación no coinciden.');
            setLoading(false);
            return;
        }

        try {
            const passResult = await actualizarPassword({
                currentPassword,
                newPassword,
                confirmPassword,
            });

            if (passResult.error) {
                setError(passResult.error);
                return;
            }

            formNotify.updated('Contraseña');
            router.refresh();
            onSuccess();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error al cambiar la contraseña.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label htmlFor={`${baseId}-current`} className="mb-1.5 block text-[12px] font-semibold text-ink">Contraseña actual</label>
                    <input
                        id={`${baseId}-current`}
                        type="password"
                        name="currentPassword"
                        placeholder="••••••••"
                        required
                        className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                </div>
                <div>
                    <label htmlFor={`${baseId}-new`} className="mb-1.5 block text-[12px] font-semibold text-ink">Nueva contraseña</label>
                    <input
                        id={`${baseId}-new`}
                        type="password"
                        name="newPassword"
                        placeholder="Mín. 8 caracteres"
                        required
                        className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                </div>
                <div>
                    <label htmlFor={`${baseId}-confirm`} className="mb-1.5 block text-[12px] font-semibold text-ink">Confirmar nueva contraseña</label>
                    <input
                        id={`${baseId}-confirm`}
                        type="password"
                        name="confirmPassword"
                        placeholder="Mín. 8 caracteres"
                        required
                        className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
                <Btn type="button" variant="secondary" disabled={loading} onClick={onCancel}>
                    Cancelar
                </Btn>
                <Btn type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                </Btn>
            </div>
        </form>
    );
}
