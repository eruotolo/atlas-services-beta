'use client';
import { Btn, Select } from '@/shared/components/hireeo';

import { useId, useState } from 'react';

import { Eye, EyeOff } from '@/shared/components/icons';

import { actualizarUsuario, crearUsuario } from '@/features/users/actions';
import { notify } from '@/shared/lib/notify';

interface Usuario {
    id: string;
    nombre: string;
    email: string;
    telefono: string | null;
    roles?: Array<{
        roleId: string;
        country?: { code: string; name: string } | null;
    }>;
}

interface Role {
    id: string;
    nombre: string;
}

interface CountryOption {
    code: string;
    name: string;
}

interface UsuarioFormProps {
    usuario?: Usuario;
    roles: Role[];
    countries: CountryOption[];
    onSuccess: () => void;
    onCancel: () => void;
}

export default function UsuarioForm({
    usuario,
    roles,
    countries,
    onSuccess,
    onCancel,
}: UsuarioFormProps) {
    const id = useId();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string>(
        usuario?.roles?.[0]?.roleId ?? '',
    );

    const adminRole = roles.find((r) => r.nombre === 'Administrador');
    const isAdminSelected = adminRole !== undefined && selectedRole === adminRole.id;

    const [adminCountry, setAdminCountry] = useState<string>(
        () =>
            usuario?.roles?.find((r) => r.roleId === adminRole?.id && r.country)?.country?.code ??
            '',
    );

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

        if (!selectedRole) {
            setError('Debe seleccionar un rol');
            setLoading(false);
            return;
        }

        if (isAdminSelected && !adminCountry) {
            setError('El rol Administrador requiere seleccionar el país que administra');
            setLoading(false);
            return;
        }

        const rolesPayload = [
            selectedRole === adminRole?.id
                ? { roleId: selectedRole, countryCode: adminCountry }
                : { roleId: selectedRole },
        ];

        try {
            let result;
            if (usuario) {
                result = await actualizarUsuario({
                    id: usuario.id,
                    email,
                    nombre,
                    password: password || undefined, // undefined sends undefined to Zod optional
                    telefono: telefono || null,
                    roles: rolesPayload,
                });
            } else {
                result = await crearUsuario({
                    email,
                    nombre,
                    password,
                    telefono: telefono || null,
                    roles: rolesPayload,
                });
            }

            if (result.error) {
                setError(result.error);
                notify.error({
                    title: usuario ? 'Error al actualizar usuario' : 'Error al crear usuario',
                    description: result.error,
                });
            } else {
                notify.success({
                    title: usuario ? 'Usuario actualizado' : 'Usuario creado',
                });
                onSuccess();
            }
        } catch (_err) {
            setError('Error al procesar la solicitud');
            notify.error({ title: 'Error al procesar la solicitud' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5 transition-colors duration-300">
            {usuario && <input type="hidden" name="id" value={usuario.id} />}

            {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div>
                <label
                    htmlFor={`${id}-nombre`}
                    className="mb-1.5 block text-[12px] font-semibold tracking-[-0.005em] text-ink"
                >
                    Nombre
                </label>
                <input
                    type="text"
                    id={`${id}-nombre`}
                    name="nombre"
                    defaultValue={usuario?.nombre}
                    required
                    className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
                />
            </div>

            <div>
                <label
                    htmlFor={`${id}-email`}
                    className="mb-1.5 block text-[12px] font-semibold tracking-[-0.005em] text-ink"
                >
                    Email
                </label>
                <input
                    type="email"
                    id={`${id}-email`}
                    name="email"
                    defaultValue={usuario?.email}
                    required
                    className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
                />
            </div>

            <div>
                <label
                    htmlFor={`${id}-password`}
                    className="mb-1.5 block text-[12px] font-semibold tracking-[-0.005em] text-ink"
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
                        className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 pr-12 text-sm text-ink focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-muted hover:text-sub focus:outline-none"
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
            </div>

            <div>
                <label
                    htmlFor={`${id}-telefono`}
                    className="mb-1.5 block text-[12px] font-semibold tracking-[-0.005em] text-ink"
                >
                    Teléfono
                </label>
                <input
                    type="tel"
                    id={`${id}-telefono`}
                    name="telefono"
                    defaultValue={usuario?.telefono || ''}
                    className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
                />
            </div>

            <div>
                <label
                    htmlFor={`${id}-rol`}
                    className="mb-1.5 block text-[12px] font-semibold tracking-[-0.005em] text-ink"
                >
                    Rol
                </label>
                <Select
                    id={`${id}-rol`}
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    aria-label="Rol del usuario"
                >
                    <option value="">Seleccionar rol…</option>
                    {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                            {role.nombre}
                        </option>
                    ))}
                </Select>

                {isAdminSelected && (
                    <div className="mt-4 rounded-xl border border-line bg-tint/40 px-4 py-3">
                        <span className="mb-1.5 block text-[12px] font-semibold tracking-[-0.005em] text-ink">
                            País que administra
                        </span>
                        <p className="mb-2 text-[11px] text-sub">
                            El Administrador gestiona el panel /admin de un solo país.
                        </p>
                        <Select
                            icon="globe"
                            value={adminCountry}
                            onChange={(e) => setAdminCountry(e.target.value)}
                            aria-label="País que administra"
                        >
                            <option value="">Seleccionar país…</option>
                            {countries.map((country) => (
                                <option key={country.code} value={country.code}>
                                    {country.name}
                                </option>
                            ))}
                        </Select>
                    </div>
                )}
            </div>

            <div className="mt-8 flex justify-end gap-3">
                <Btn variant="secondary" type="button" disabled={loading} onClick={onCancel}>Cancelar</Btn>
                <Btn variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Guardando...' : usuario ? 'Actualizar' : 'Crear Usuario'}
                </Btn>
            </div>
        </form>
    );
}
