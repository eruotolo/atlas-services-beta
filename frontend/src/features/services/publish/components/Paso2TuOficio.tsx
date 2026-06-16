'use client';
import Link from 'next/link';

import { Btn } from '@/shared/components/hireeo';

import { useEffect, useId, useState } from 'react';

import Image from 'next/image';

import {
    AlertCircle,
    Briefcase,
    DollarSign,
    FileText,
    Globe,
    Mail,
    MapPin,
    Plus,
    Sparkles,
    Trash2,
    User,
} from '@/shared/components/icons';
import { ImageDropzone } from '@/shared/components/ImageDropzone';

import { getCategorias } from '@/features/categories/actions';
import { LocalitySelect } from '@/features/geo/components/LocalitySelect';
import { generarDescripcionIA, publicarServicioPublico } from '@/features/services/publish/actions';
import { getUsuarioById } from '@/features/users/actions/queries';
import { useCountry } from '@/lib/providers/CountryProvider';

import PhoneInput from '@/shared/components/ui/PhoneInput';

import CategoriaMultiSelect from './CategoriaMultiSelect';
import GaleriaUpload from './GaleriaUpload';

interface Usuario {
    id: string;
    nombre: string;
    email: string;
    phone?: string | null;
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
    const { code: countryCode, regionLabel, localityLabel } = useCountry();

    const tituloId = useId();
    const descripcionId = useId();
    const precioId = useId();
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
    const [selectedLocality, setSelectedLocality] = useState<{
        localitySlug: string;
        localityName: string;
        regionCode: string;
    } | null>(null);

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

            if (usuario.phone) {
                setTelefonoContacto(usuario.phone);
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

    function handleImagenPrincipalFile(file: File): void {
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

            // 5.5. Agregar ubicación geográfica
            if (selectedLocality) {
                formData.set('regionCode', selectedLocality.regionCode);
                formData.set('localitySlug', selectedLocality.localitySlug);
            }
            formData.set('countryCode', countryCode);

            // 5.6. Agregar usuarioId (importante para usuarios no autenticados)
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
                <h2 className="mb-1 text-2xl font-black text-ink md:text-3xl">
                    ¡Ya Casi Listo!
                </h2>
                <p className="text-sm text-sub md:text-base">
                    Ahora cuéntanos sobre tu oficio
                </p>
                <p className="mt-2 text-sm font-medium text-brand">
                    Hola, {usuario.nombre} 👋
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                {error && (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                        <AlertCircle size={20} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div>
                    <label
                        htmlFor={tituloId}
                        className="mb-1.5 block text-sm font-bold text-sub"
                    >
                        Título de tu Servicio
                    </label>
                    <div className="relative">
                        <Briefcase
                            size={18}
                            className="absolute top-1/2 left-4 -translate-y-1/2 text-muted"
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
                    <div className="mb-1.5 text-sm font-bold text-sub">
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
                            className="text-sm font-bold text-sub"
                        >
                            Descripción
                        </label>
                        <button
                            type="button"
                            onClick={handleCompletarConIA}
                            disabled={
                                loadingIA || !titulo.trim() || categoriasSeleccionadas.length === 0
                            }
                            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-brand/50 px-3 py-1.5 text-xs font-bold text-white transition-all hover:from-purple-600 hover:to-brand disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale"
                        >
                            <Sparkles size={14} className={loadingIA ? 'animate-spin' : ''} />
                            {loadingIA ? 'Generando...' : 'Completar con IA'}
                        </button>
                    </div>
                    <div className="relative">
                        <FileText
                            size={18}
                            className="absolute top-4 left-4 text-muted"
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
                    <p className="mt-1.5 text-xs text-muted">
                        💡 Tip: Escribe un título y selecciona categorías, luego usa el botón de IA
                        para generar una descripción profesional
                    </p>
                </div>

                <div>
                    <p className="mb-1.5 text-sm font-bold text-sub">
                        Imagen del Servicio *
                    </p>
                    <div className="space-y-3">
                        <ImageDropzone
                            maxSizeMB={3}
                            onFilesAccepted={(files) => {
                                if (files[0]) handleImagenPrincipalFile(files[0]);
                            }}
                            label="Arrastra la imagen del servicio o haz clic para seleccionar"
                            description="JPG, PNG, WEBP · Máx. 3 MB"
                        />
                        {imagenPrincipalPreview && (
                            <div className="mt-2">
                                <Image
                                    src={imagenPrincipalPreview}
                                    alt="Preview imagen principal"
                                    width={800}
                                    height={160}
                                    className="h-40 w-full rounded-xl border border-line object-cover"
                                />
                            </div>
                        )}
                        <p className="text-[10px] text-muted">
                            Máximo 1 imagen (JPG, PNG, WEBP), tamaño máximo 3MB.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label
                            htmlFor={precioId}
                            className="mb-1.5 block text-sm font-bold text-sub"
                        >
                            Precio Base (CLP)
                        </label>
                        <div className="relative">
                            <DollarSign
                                size={18}
                                className="absolute top-1/2 left-4 -translate-y-1/2 text-muted"
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
                        <p className="mt-1.5 text-xs text-muted">
                            0 es igual a "Solicita Cotización"
                        </p>
                    </div>

                    <div>
                        <div className="mb-1.5 flex items-center gap-2 text-sm font-bold text-sub">
                            <MapPin size={16} className="text-muted" />
                            Ubicación
                        </div>
                        <LocalitySelect
                            countryCode={countryCode}
                            regionLabel={regionLabel}
                            localityLabel={localityLabel}
                            onSelect={setSelectedLocality}
                        />
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
                        <div className="text-sm font-bold text-sub">
                            Datos de Contacto para el Cliente
                        </div>
                    </div>

                    <div className="mb-4 flex items-center gap-3 rounded-2xl border border-line bg-tint p-4">
                        <input
                            type="checkbox"
                            id={usarDatosUsuarioId}
                            checked={usarDatosUsuario}
                            onChange={(e) => setUsarDatosUsuario(e.target.checked)}
                            className="h-4 w-4 cursor-pointer rounded border-line text-brand focus:ring-brand"
                        />
                        <label
                            htmlFor={usarDatosUsuarioId}
                            className="cursor-pointer text-sm font-medium text-sub"
                        >
                            Usar mis datos de registro ({usuario.nombre})
                        </label>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor={nombreContactoId}
                                className="mb-1.5 block text-sm font-bold text-sub"
                            >
                                Nombre de Contacto
                            </label>
                            <div className="relative">
                                <User
                                    size={18}
                                    className="absolute top-1/2 left-4 -translate-y-1/2 text-muted"
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
                                    className="mb-1.5 block text-sm font-bold text-sub"
                                >
                                    Email de Contacto
                                </label>
                                <div className="relative">
                                    <Mail
                                        size={18}
                                        className="absolute top-1/2 left-4 -translate-y-1/2 text-muted"
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
                        <div className="text-sm font-bold text-sub">
                            Redes Sociales / Sitio Web (Opcional)
                        </div>
                        <button
                            type="button"
                            onClick={agregarRedSocial}
                            className="flex items-center gap-1 rounded-lg bg-brand/5 px-3 py-1.5 text-xs font-bold text-brand hover:bg-brand/10"
                        >
                            <Plus size={14} />
                            Agregar
                        </button>
                    </div>

                    {redesSociales.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-line p-6 text-center">
                            <Globe
                                size={32}
                                className="mx-auto mb-2 text-muted"
                            />
                            <p className="text-sm text-muted">
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
                                        className="rounded-xl border border-line p-2 text-muted hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-brand/5 bg-brand/5/30 p-5">
                    <h4 className="mb-1 text-sm font-bold text-brand-marino">
                        ¿Qué sigue?
                    </h4>
                    <ul className="space-y-1 text-xs text-brand-hover">
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
                        className="mt-1 h-4 w-4 cursor-pointer rounded border-line text-brand focus:ring-brand"
                    />
                    <label
                        htmlFor={declaracionId}
                        className="text-sm text-sub"
                    >
                        Declaro que la información proporcionada es verdadera y acepto las{' '}
                        <Link
                            href={`/${countryCode}/terms`}
                            target="_blank"
                            className="font-bold text-brand hover:underline"
                            rel="noopener"
                        >
                            condiciones de publicación
                        </Link>
                        .
                    </label>
                </div>

                <Btn variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Guardando...' : 'Siguiente Paso'}
                </Btn>
            </form>
        </div>
    );
}
