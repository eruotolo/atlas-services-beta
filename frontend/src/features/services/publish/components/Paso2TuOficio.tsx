'use client';

import { useEffect, useId, useState } from 'react';

import Image from 'next/image';

import {
    AlertCircle,
    Briefcase,
    DollarSign,
    FileText,
    Globe,
    Image as ImageIcon,
    Mail,
    MapPin,
    Plus,
    Sparkles,
    Trash2,
    User,
} from 'lucide-react';

import { getCategorias } from '@/features/categories/actions';
import { generarDescripcionIA, publicarServicioPublico } from '@/features/services/publish/actions';
import { getUsuarioById } from '@/features/users/actions/queries';

import PhoneInput from '@/shared/components/ui/PhoneInput';

import CategoriaMultiSelect from './CategoriaMultiSelect';
import GaleriaUpload from './GaleriaUpload';

interface Usuario {
    id: string;
    nombre: string;
    email: string;
    telefono?: string | null;
}

interface Paso2TuOficioProps {
    usuario: Usuario;
    onSuccess: (servicioId: string, slug: string) => void;
}

interface RedSocial {
    id: string;
    tipo: string;
    url: string;
}

interface Categoria {
    id: string;
    nombre: string;
    slug: string;
    icono?: string | null;
}

const COMUNAS_CHILOE = [
    'Ancud',
    'Castro',
    'Chonchi',
    'Curaco de Vélez',
    'Dalcahue',
    'Puqueldón',
    'Queilén',
    'Quellón',
    'Quemchi',
    'Quinchao',
];

const TIPOS_RED_SOCIAL = [
    { value: 'WEBSITE', label: 'Sitio Web' },
    { value: 'FACEBOOK', label: 'Facebook' },
    { value: 'INSTAGRAM', label: 'Instagram' },
    { value: 'LINKEDIN', label: 'LinkedIn' },
    { value: 'TIKTOK', label: 'TikTok' },
    { value: 'TWITTER', label: 'Twitter (X)' },
    { value: 'YOUTUBE', label: 'YouTube' },
    { value: 'OTRO', label: 'Otro' },
];

export default function Paso2TuOficio({ usuario, onSuccess }: Paso2TuOficioProps) {
    const tituloId = useId();
    const descripcionId = useId();
    const imagenPrincipalId = useId();
    const precioId = useId();
    const comunaId = useId();
    const declaracionId = useId();

    // IDs para contacto
    const nombreContactoId = useId();
    const emailContactoId = useId();
    const telefonoContactoId = useId();
    const usarDatosUsuarioId = useId();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // NUEVOS ESTADOS
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [loadingIA, setLoadingIA] = useState(false);

    const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loadingCategorias, setLoadingCategorias] = useState(true);
    const [imagenPrincipal, setImagenPrincipal] = useState<File | null>(null);
    const [imagenPrincipalPreview, setImagenPrincipalPreview] = useState<string>('');
    const [galeriaImagenes, setGaleriaImagenes] = useState<File[]>([]);
    const [redesSociales, setRedesSociales] = useState<RedSocial[]>([]);

    // Estados para datos de contacto
    const [nombreContacto, setNombreContacto] = useState('');
    const [emailContacto, setEmailContacto] = useState('');
    const [telefonoContacto, setTelefonoContacto] = useState('');
    const [usarDatosUsuario, setUsarDatosUsuario] = useState(false);

    // Efecto para autocompletar datos
    useEffect(() => {
        if (usarDatosUsuario) {
            setNombreContacto(usuario.nombre);
            setEmailContacto(usuario.email);

            if (usuario.telefono) {
                setTelefonoContacto(usuario.telefono);
            } else {
                // Si no hay teléfono en las props (posible sesión antigua), buscarlo
                getUsuarioById(usuario.id).then((u) => {
                    if (u?.phone) {
                        setTelefonoContacto(u.phone);
                    }
                });
            }
        } else {
            setNombreContacto('');
            setEmailContacto('');
            setTelefonoContacto('');
        }
    }, [usarDatosUsuario, usuario]);

    const agregarRedSocial = () => {
        setRedesSociales([...redesSociales, { id: crypto.randomUUID(), tipo: 'WEBSITE', url: '' }]);
    };

    const actualizarRedSocial = (id: string, field: 'tipo' | 'url', value: string) => {
        setRedesSociales(
            redesSociales.map((red) => (red.id === id ? { ...red, [field]: value } : red)),
        );
    };

    const eliminarRedSocial = (id: string) => {
        setRedesSociales(redesSociales.filter((red) => red.id !== id));
    };

    async function handleCompletarConIA() {
        // Validaciones locales
        if (!titulo.trim()) {
            setError('Debes escribir un título para generar la descripción');
            return;
        }

        if (categoriasSeleccionadas.length === 0) {
            setError('Debes seleccionar al menos una categoría para generar la descripción');
            return;
        }

        setLoadingIA(true);
        setError('');

        try {
            const result = await generarDescripcionIA(titulo, categoriasSeleccionadas);

            if (result.error) {
                setError(result.error);
            } else if (result.descripcion) {
                setDescripcion(result.descripcion);
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Error al generar descripción con IA. Por favor, intenta nuevamente.',
            );
        } finally {
            setLoadingIA(false);
        }
    }

    useEffect(() => {
        async function cargarCategorias() {
            try {
                const cats = await getCategorias();
                setCategorias(cats);
            } catch (error) {
                console.error('Error al cargar categorías:', error);
            } finally {
                setLoadingCategorias(false);
            }
        }
        cargarCategorias();
    }, []);

    function handleImagenPrincipalChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError('Tipo de archivo no válido. Solo JPG, PNG y WEBP');
            return;
        }

        const MAX_SIZE = 3 * 1024 * 1024; // 3MB
        if (file.size > MAX_SIZE) {
            setError('La imagen no puede superar 3MB');
            return;
        }

        setImagenPrincipal(file);
        setError('');

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagenPrincipalPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }

    async function uploadImage(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('files', file);
        formData.append('folder', 'services');

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            let errorMessage = 'Error al subir la imagen';
            try {
                const errorData = await response.json();
                if (errorData.error) {
                    errorMessage = errorData.details || errorData.error;
                }
            } catch (_e) {
                // Si no es JSON, mantenemos el mensaje genérico
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        return data.urls[0];
    }

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Manejo de formulario complejo
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);

        try {
            // 1. Subir imagen principal (obligatoria)
            if (!imagenPrincipal) {
                throw new Error('Debes subir una imagen principal');
            }
            const imagenPrincipalUrl = await uploadImage(imagenPrincipal);
            formData.set('imagenPrincipal', imagenPrincipalUrl);

            // 2. Subir galería (opcional)
            const galeriaUrls: string[] = [];
            if (galeriaImagenes.length > 0) {
                for (const img of galeriaImagenes) {
                    const url = await uploadImage(img);
                    galeriaUrls.push(url);
                }
            }
            formData.set('imagenes', JSON.stringify(galeriaUrls));

            // 3. Agregar categoriasIds
            formData.set('categoriasIds', JSON.stringify(categoriasSeleccionadas));

            // 4. Agregar Redes Sociales
            formData.set('redesSociales', JSON.stringify(redesSociales));

            // 5. Agregar Datos de Contacto
            formData.set('nombreContacto', nombreContacto);
            formData.set('emailContacto', emailContacto);
            formData.set('telefonoContacto', telefonoContacto);

            // 5.5. Agregar usuarioId (importante para usuarios no autenticados)
            formData.set('usuarioId', usuario.id);

            // 6. Publicar servicio
            const result = await publicarServicioPublico(formData);

            if (result.error) {
                setError(result.error);
            } else if (result.servicio) {
                onSuccess(result.servicio.id, result.servicio.slug);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al procesar la solicitud');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div className="mb-6 text-center md:mb-8">
                <h2 className="mb-1 text-2xl font-black text-gray-900 md:text-3xl dark:text-white">
                    ¡Ya Casi Listo!
                </h2>
                <p className="text-sm text-gray-600 md:text-base dark:text-gray-400">
                    Ahora cuéntanos sobre tu oficio
                </p>
                <p className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                    Hola, {usuario.nombre} 👋
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                {error && (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400">
                        <AlertCircle size={20} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div>
                    <label
                        htmlFor={tituloId}
                        className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300"
                    >
                        Título de tu Servicio
                    </label>
                    <div className="relative">
                        <Briefcase
                            size={18}
                            className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 dark:text-gray-600"
                        />
                        <input
                            type="text"
                            id={tituloId}
                            name="titulo"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            required
                            placeholder="Ej: Electricista certificado"
                            className="form-input pr-4 pl-12"
                        />
                    </div>
                </div>

                <div>
                    <div className="mb-1.5 text-sm font-bold text-gray-700 dark:text-gray-300">
                        Categorías (máximo 3)
                    </div>
                    <CategoriaMultiSelect
                        categorias={categorias}
                        values={categoriasSeleccionadas}
                        onChange={setCategoriasSeleccionadas}
                        disabled={loadingCategorias}
                        required
                        maxSelections={3}
                    />
                </div>

                <div>
                    <div className="mb-1.5 flex items-center justify-between">
                        <label
                            htmlFor={descripcionId}
                            className="text-sm font-bold text-gray-700 dark:text-gray-300"
                        >
                            Descripción
                        </label>
                        <button
                            type="button"
                            onClick={handleCompletarConIA}
                            disabled={
                                loadingIA || !titulo.trim() || categoriasSeleccionadas.length === 0
                            }
                            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-3 py-1.5 text-xs font-bold text-white transition-all hover:from-purple-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale"
                        >
                            <Sparkles size={14} className={loadingIA ? 'animate-spin' : ''} />
                            {loadingIA ? 'Generando...' : 'Completar con IA'}
                        </button>
                    </div>
                    <div className="relative">
                        <FileText
                            size={18}
                            className="absolute top-4 left-4 text-gray-400 dark:text-gray-600"
                        />
                        <textarea
                            id={descripcionId}
                            name="descripcion"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            required
                            rows={4}
                            placeholder="Describe tu experiencia, servicios... o usa el botón 'Completar con IA' arriba"
                            className="form-input pr-4 pl-12"
                        />
                    </div>
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                        💡 Tip: Escribe un título y selecciona categorías, luego usa el botón de IA
                        para generar una descripción profesional
                    </p>
                </div>

                <div>
                    <label
                        htmlFor={imagenPrincipalId}
                        className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300"
                    >
                        Imagen del Servicio *
                    </label>
                    <div className="space-y-3">
                        <div className="relative">
                            <ImageIcon
                                size={18}
                                className="pointer-events-none absolute top-1/2 left-4 z-10 -translate-y-1/2 text-gray-400 dark:text-gray-600"
                            />
                            <input
                                type="file"
                                id={imagenPrincipalId}
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={handleImagenPrincipalChange}
                                required
                                className="form-input pr-4 pl-12 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-3 file:text-xs file:font-bold file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                        {imagenPrincipalPreview && (
                            <div className="mt-2">
                                <Image
                                    src={imagenPrincipalPreview}
                                    alt="Preview imagen principal"
                                    width={800}
                                    height={160}
                                    className="h-40 w-full rounded-xl border border-gray-200 object-cover dark:border-white/10"
                                />
                            </div>
                        )}
                        <p className="text-[10px] text-gray-500 dark:text-gray-500">
                            Máximo 1 imagen (JPG, PNG, WEBP), tamaño máximo 3MB.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label
                            htmlFor={precioId}
                            className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300"
                        >
                            Precio Base (CLP)
                        </label>
                        <div className="relative">
                            <DollarSign
                                size={18}
                                className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 dark:text-gray-600"
                            />
                            <input
                                type="number"
                                id={precioId}
                                name="precio"
                                required
                                min="0"
                                step="1000"
                                inputMode="numeric"
                                placeholder="25000"
                                className="form-input pr-4 pl-12"
                            />
                        </div>
                        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                            0 es igual a "Solicita Cotización"
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor={comunaId}
                            className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300"
                        >
                            Comuna
                        </label>
                        <div className="relative">
                            <MapPin
                                size={18}
                                className="pointer-events-none absolute top-1/2 left-4 z-10 -translate-y-1/2 text-gray-400 dark:text-gray-600"
                            />
                            <select
                                id={comunaId}
                                name="comuna"
                                required
                                className="form-input appearance-none bg-white pr-4 pl-12 dark:bg-gray-800"
                            >
                                <option value="" className="dark:bg-gray-900">
                                    Selecciona comuna
                                </option>
                                {COMUNAS_CHILOE.map((comuna) => (
                                    <option
                                        key={comuna}
                                        value={comuna}
                                        className="dark:bg-gray-900"
                                    >
                                        {comuna}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Galería de Imágenes */}
                <GaleriaUpload
                    maxImages={4}
                    maxSizeMB={3}
                    label="Galería de Fotos (Opcional)"
                    description="Sube hasta 4 fotos adicionales de tu trabajo"
                    onImagesChange={setGaleriaImagenes}
                />

                {/* Datos de Contacto */}
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            Datos de Contacto para el Cliente
                        </div>
                    </div>

                    <div className="mb-4 flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                        <input
                            type="checkbox"
                            id={usarDatosUsuarioId}
                            checked={usarDatosUsuario}
                            onChange={(e) => setUsarDatosUsuario(e.target.checked)}
                            className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                        />
                        <label
                            htmlFor={usarDatosUsuarioId}
                            className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Usar mis datos de registro ({usuario.nombre})
                        </label>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor={nombreContactoId}
                                className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300"
                            >
                                Nombre de Contacto
                            </label>
                            <div className="relative">
                                <User
                                    size={18}
                                    className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 dark:text-gray-600"
                                />
                                <input
                                    type="text"
                                    id={nombreContactoId}
                                    value={nombreContacto}
                                    onChange={(e) => setNombreContacto(e.target.value)}
                                    placeholder="Nombre de la persona o empresa"
                                    required
                                    className="form-input pr-4 pl-12"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label
                                    htmlFor={emailContactoId}
                                    className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300"
                                >
                                    Email de Contacto
                                </label>
                                <div className="relative">
                                    <Mail
                                        size={18}
                                        className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 dark:text-gray-600"
                                    />
                                    <input
                                        type="email"
                                        id={emailContactoId}
                                        value={emailContacto}
                                        onChange={(e) => setEmailContacto(e.target.value)}
                                        placeholder="contacto@ejemplo.com"
                                        required
                                        className="form-input pr-4 pl-12"
                                    />
                                </div>
                            </div>

                            <div>
                                <PhoneInput
                                    id={telefonoContactoId}
                                    name="telefonoContacto"
                                    label="Teléfono / WhatsApp"
                                    value={telefonoContacto}
                                    onChange={setTelefonoContacto}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Redes Sociales */}
                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            Redes Sociales / Sitio Web (Opcional)
                        </div>
                        <button
                            type="button"
                            onClick={agregarRedSocial}
                            className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
                        >
                            <Plus size={14} />
                            Agregar
                        </button>
                    </div>

                    {redesSociales.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center dark:border-gray-700">
                            <Globe
                                size={32}
                                className="mx-auto mb-2 text-gray-300 dark:text-gray-600"
                            />
                            <p className="text-sm text-gray-500">
                                No has agregado redes sociales. ¡Agrega tu Instagram o sitio web
                                para que te conozcan mejor!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {redesSociales.map((red) => (
                                <div key={red.id} className="flex gap-2">
                                    <select
                                        value={red.tipo}
                                        onChange={(e) =>
                                            actualizarRedSocial(red.id, 'tipo', e.target.value)
                                        }
                                        className="form-input w-auto min-w-[120px] px-4"
                                    >
                                        {TIPOS_RED_SOCIAL.map((t) => (
                                            <option key={t.value} value={t.value}>
                                                {t.label}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="url"
                                        value={red.url}
                                        onChange={(e) =>
                                            actualizarRedSocial(red.id, 'url', e.target.value)
                                        }
                                        placeholder="https://..."
                                        className="form-input flex-1 px-4"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => eliminarRedSocial(red.id)}
                                        className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:border-white/5 dark:text-gray-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-blue-50 bg-blue-50/30 p-5 dark:border-blue-900/30 dark:bg-blue-900/20">
                    <h4 className="mb-1 text-sm font-bold text-blue-900 dark:text-blue-300">
                        ¿Qué sigue?
                    </h4>
                    <ul className="space-y-1 text-xs text-blue-700 dark:text-blue-400">
                        <li>• Podrás elegir entre publicación básica o premium</li>
                        <li>• Los clientes podrán contactarte por teléfono</li>
                    </ul>
                </div>

                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        id={declaracionId}
                        name="declaracion"
                        required
                        className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                    />
                    <label
                        htmlFor={declaracionId}
                        className="text-sm text-gray-600 dark:text-gray-400"
                    >
                        Declaro que la información proporcionada es verdadera y acepto las{' '}
                        <a
                            href="/terminos"
                            target="_blank"
                            className="font-bold text-blue-600 hover:underline dark:text-blue-400"
                            rel="noopener"
                        >
                            condiciones de publicación
                        </a>
                        .
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full cursor-pointer rounded-2xl bg-blue-600 px-6 py-4 font-black text-white shadow-lg shadow-blue-200 transition-colors hover:bg-blue-700 disabled:opacity-50 dark:shadow-none"
                >
                    {loading ? 'Guardando...' : 'Siguiente Paso'}
                </button>
            </form>
        </div>
    );
}
