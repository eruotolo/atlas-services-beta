'use client';

import { useId, useState } from 'react';

import { Eye, EyeOff } from 'lucide-react';

import { actualizarUsuario, crearUsuario } from '@/features/users/actions';

interface Usuario {
    id: string;
    nombre: string;
    email: string;
    telefono: string | null;
    roles?: Array<{
        roleId: string;
    }>;
}

interface Role {
    id: string;
    nombre: string;
}

interface UsuarioFormProps {
    usuario?: Usuario;
    roles: Role[];
    onSuccess: () => void;
    onCancel: () => void;
}

export default function UsuarioForm({ usuario, roles, onSuccess, onCancel }: UsuarioFormProps) {
    const id = useId();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState<string[]>(
        usuario?.roles?.map((r) => r.roleId) || [],
    );

    function handleRoleToggle(roleId: string) {
        setSelectedRoles((prev) =>
            prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId],
        );
    }

    function validatePassword(password: string): string | null {
        if (password.length < 8) {
            return 'La contraseña debe tener al menos 8 caracteres';
        }
        if (!/[A-Z]/.test(password)) {
            return 'La contraseña debe contener al menos una letra mayúscula';
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return 'La contraseña debe contener al menos un carácter especial (!@#$%^&*(),.?":{}|<>)';
        }
        return null;
    }

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Validación de formulario compleja
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const password = formData.get('password') as string;
        const nombre = formData.get('nombre') as string;
        const email = formData.get('email') as string;
        const telefono = formData.get('telefono') as string;

        // Validar password solo si se proporciona uno
        if (password) {
            const passwordError = validatePassword(password);
            if (passwordError) {
                setError(passwordError);
                setLoading(false);
                return;
            }
        } else if (!usuario) {
            // Si es crear usuario, el password es obligatorio
            setError('La contraseña es requerida');
            setLoading(false);
            return;
        }

        if (selectedRoles.length === 0) {
            setError('Debe seleccionar al menos un rol');
            setLoading(false);
            return;
        }

        try {
            let result;
            if (usuario) {
                result = await actualizarUsuario({
                    id: usuario.id,
                    email,
                    nombre,
                    password: password || undefined, // undefined sends undefined to Zod optional
                    telefono: telefono || null,
                    roles: selectedRoles,
                });
            } else {
                result = await crearUsuario({
                    email,
                    nombre,
                    password,
                    telefono: telefono || null,
                    roles: selectedRoles,
                });
            }

            if (result.error) {
                setError(result.error);
            } else {
                onSuccess();
            }
        } catch (_err) {
            setError('Error al procesar la solicitud');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5 transition-colors duration-300">
            {usuario && <input type="hidden" name="id" value={usuario.id} />}

            {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                </div>
            )}

            <div>
                <label
                    htmlFor={`${id}-nombre`}
                    className="mb-1.5 block text-xs font-black tracking-wider text-gray-700 uppercase dark:text-gray-500"
                >
                    Nombre
                </label>
                <input
                    type="text"
                    id={`${id}-nombre`}
                    name="nombre"
                    defaultValue={usuario?.nombre}
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-white/5 dark:bg-gray-800 dark:text-white"
                />
            </div>

            <div>
                <label
                    htmlFor={`${id}-email`}
                    className="mb-1.5 block text-xs font-black tracking-wider text-gray-700 uppercase dark:text-gray-500"
                >
                    Email
                </label>
                <input
                    type="email"
                    id={`${id}-email`}
                    name="email"
                    defaultValue={usuario?.email}
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-white/5 dark:bg-gray-800 dark:text-white"
                />
            </div>

            <div>
                <label
                    htmlFor={`${id}-password`}
                    className="mb-1.5 block text-xs font-black tracking-wider text-gray-700 uppercase dark:text-gray-500"
                >
                    Contraseña {usuario && '(opcional)'}
                </label>
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id={`${id}-password`}
                        name="password"
                        required={!usuario}
                        placeholder={usuario ? 'Dejar vacío para no cambiar' : ''}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pr-12 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-white/5 dark:bg-gray-800 dark:text-white"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 focus:outline-none dark:hover:text-gray-200"
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
            </div>

            <div>
                <label
                    htmlFor={`${id}-telefono`}
                    className="mb-1.5 block text-xs font-black tracking-wider text-gray-700 uppercase dark:text-gray-500"
                >
                    Teléfono
                </label>
                <input
                    type="tel"
                    id={`${id}-telefono`}
                    name="telefono"
                    defaultValue={usuario?.telefono || ''}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-white/5 dark:bg-gray-800 dark:text-white"
                />
            </div>

            <div>
                <span className="mb-3 block text-xs font-black tracking-wider text-gray-700 uppercase dark:text-gray-500">
                    Roles
                </span>
                <div className="flex flex-wrap gap-4">
                    {roles.map((role) => (
                        <label key={role.id} className="flex cursor-pointer items-center gap-2">
                            <input
                                type="checkbox"
                                name="roles"
                                value={role.id}
                                checked={selectedRoles.includes(role.id)}
                                onChange={() => handleRoleToggle(role.id)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-gray-800"
                            />
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-400">
                                {role.nombre}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4 dark:border-white/5">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="cursor-pointer rounded-xl border border-gray-200 px-6 py-2.5 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="cursor-pointer rounded-xl bg-blue-500 px-6 py-2.5 text-xs font-bold text-white transition-colors hover:bg-blue-600 disabled:opacity-50 dark:shadow-none"
                >
                    {loading ? 'Guardando...' : usuario ? 'Actualizar' : 'Crear Usuario'}
                </button>
            </div>
        </form>
    );
}
