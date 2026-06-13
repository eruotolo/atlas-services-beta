'use client';
import { Btn, Field, Input, Select } from '@/shared/components/hireeo';

import { useEffect, useId, useState } from 'react';

import Image from 'next/image';

import { Loader2, Save, X } from '@/shared/components/icons';
import { ImageDropzone } from '@/shared/components/ImageDropzone';

import { LocalitySelect } from '@/features/geo/components/LocalitySelect';
import type { Country } from '@/features/geo/types/geoTypes';
import CategoriaMultiSelect from '@/features/services/publish/components/CategoriaMultiSelect';
import GaleriaUpload from '@/features/services/publish/components/GaleriaUpload';
import { useCountry } from '@/lib/providers/CountryProvider';

import PhoneInput from '@/shared/components/ui/PhoneInput';
import { notify } from '@/shared/lib/notify';

import { useImageUpload } from '../../../hooks/useImageUpload';
import { useSocialNetworks } from '../../../hooks/useSocialNetworks';
import type { Categoria, Result, Servicio } from '../../../types/shared';
import SocialNetworksInput from '../shared/SocialNetworksInput';

interface ServicioFormBaseProps {
    servicio?: Servicio;
    categorias: Categoria[];
    countries?: Country[];
    // biome-ignore lint/suspicious/noExplicitAny: Payload flexible
    onSubmit: (payload: any) => Promise<Result>;
    onSuccess: () => void;
    onCancel: () => void;
    userSelector?: React.ReactNode;
    variant?: 'admin' | 'user';
    submitLabel?: string;
    usuarioActual?: {
        nombre: string;
        email: string;
        telefono?: string | null;
    };
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Formulario complejo necesario
export default function ServicioFormBase({
    servicio,
    categorias,
    countries = [],
    onSubmit,
    onSuccess,
    onCancel,
    userSelector,
    variant = 'user',
    submitLabel,
    usuarioActual,
}: ServicioFormBaseProps) {
    const scopeCountry = useCountry();
    const { regionLabel, localityLabel } = scopeCountry;

    const id = useId();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([]);
    const [selectedLocality, setSelectedLocality] = useState<{
        localitySlug: string;
        localityName: string;
        regionCode: string;
    } | null>(null);

    // País de publicación: editable solo en variant admin con lista de países
    const [formCountryCode, setFormCountryCode] = useState(scopeCountry.code);
    const countryCode = formCountryCode;
    const selectedCountryData = countries.find((c) => c.code === formCountryCode);
    const currency = selectedCountryData?.currency ?? scopeCountry.currency;

    // Si cambia el país de trabajo (scope), realinear el país del formulario
    useEffect(() => {
        setFormCountryCode(scopeCountry.code);
        setSelectedLocality(null);
    }, [scopeCountry.code]);

    function handleCountryChange(nextCode: string): void {
        setFormCountryCode(nextCode);
        setSelectedLocality(null);
    }

    // IDs para contacto
    const nombreContactoId = useId();
    const emailContactoId = useId();
    const telefonoContactoId = useId();
    const usarDatosUsuarioId = useId();

    const isAdmin = variant === 'admin';

    // Estados para datos de contacto
    const [nombreContacto, setNombreContacto] = useState(servicio?.nombreContacto || '');
    const [emailContacto, setEmailContacto] = useState(servicio?.emailContacto || '');
    const [telefonoContacto, setTelefonoContacto] = useState(servicio?.telefonoContacto || '');
    const [usarDatosUsuario, setUsarDatosUsuario] = useState(false);

    // Sincronizar categorías cuando cambia el servicio o las categorías disponibles
    useEffect(() => {
        let initialIds: string[] = [];

        if (servicio?.categories && servicio.categories.length > 0) {
            // Si el servicio tiene el array de categories, usar esos IDs
            initialIds = servicio.categories.map((c) => c.id);
        } else if (servicio?.categoria) {
            // Fallback: si solo tiene categoria (string), buscar el ID en la lista
            const cat = categorias.find((c) => c.nombre === servicio.categoria);
            if (cat) {
                initialIds = [cat.id];
            }
        }

        setCategoriasSeleccionadas(initialIds);
    }, [servicio, categorias]);

    // Sincronizar datos de contacto cuando cambia el servicio
    useEffect(() => {
        if (servicio) {
            setNombreContacto(servicio.nombreContacto || '');
            setEmailContacto(servicio.emailContacto || '');
            setTelefonoContacto(servicio.telefonoContacto || '');

            // Verificar si los datos del servicio coinciden con los del usuario actual
            if (usuarioActual) {
                const coincideNombre = servicio.nombreContacto === usuarioActual.nombre;
                const coincideEmail = servicio.emailContacto === usuarioActual.email;
                const coincideTelefono = servicio.telefonoContacto === usuarioActual.telefono;
                setUsarDatosUsuario(coincideNombre && coincideEmail && coincideTelefono);
            }
        } else {
            // Si no hay servicio (modo crear), limpiar los campos
            setNombreContacto('');
            setEmailContacto('');
            setTelefonoContacto('');
            setUsarDatosUsuario(false);
        }
    }, [servicio, usuarioActual]);

    // Efecto para autocompletar datos de contacto cuando se activa el checkbox
    useEffect(() => {
        if (usarDatosUsuario && usuarioActual) {
            setNombreContacto(usuarioActual.nombre);
            setEmailContacto(usuarioActual.email);
            if (usuarioActual.telefono) {
                setTelefonoContacto(usuarioActual.telefono);
            }
        }
    }, [usarDatosUsuario, usuarioActual]);

    // Hook de imagen principal
    const imagenPrincipal = useImageUpload(servicio?.imagenPrincipal || '');

    // Estado Galería
    const [imagenesExistentes, setImagenesExistentes] = useState<string[]>(
        servicio?.imagenes || [],
    );
    const [imagenesNuevas, setImagenesNuevas] = useState<File[]>([]);

    // Hook de redes sociales
    const redesSociales = useSocialNetworks(servicio?.redesSociales || []);

    function removeImagenExistente(index: number) {
        setImagenesExistentes((prev) => prev.filter((_, i) => i !== index));
    }

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Manejo de envío complejo
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);

        try {
            // 1. Manejar Imagen Principal
            let imagenPrincipalUrl = imagenPrincipal.preview;

            if (imagenPrincipal.file) {
                imagenPrincipalUrl = await imagenPrincipal.uploadImage(imagenPrincipal.file);
            }

            if (!servicio && !imagenPrincipalUrl) {
                throw new Error('Debes subir una imagen principal');
            }

            // 2. Manejar Galería
            const urlsNuevas: string[] = [];
            if (imagenesNuevas.length > 0) {
                for (const img of imagenesNuevas) {
                    const url = await imagenPrincipal.uploadImage(img);
                    urlsNuevas.push(url);
                }
            }

            const galeriaFinal = [...imagenesExistentes, ...urlsNuevas];

            // 3. Construir payload
            const payload = {
                titulo: formData.get('titulo') as string,
                categoriasIds: categoriasSeleccionadas,
                countryCode,
                regionCode: selectedLocality?.regionCode ?? (servicio as { regionCode?: string })?.regionCode ?? '',
                localitySlug: selectedLocality?.localitySlug ?? (servicio as { localitySlug?: string })?.localitySlug ?? '',
                precio: Number(formData.get('precio')),
                descripcion: formData.get('descripcion') as string,
                imagenPrincipal: imagenPrincipalUrl,
                imagenes: galeriaFinal,
                redesSociales: redesSociales.redesSociales,
                nombreContacto: nombreContacto,
                emailContacto: emailContacto,
                telefonoContacto: telefonoContacto,
            };

            // 4. Si es admin y está creando, agregar usuarioId
            if (isAdmin && !servicio) {
                Object.assign(payload, { usuarioId: formData.get('usuarioId') as string });
            }

            // 5. Si es edición, agregar ID
            if (servicio) {
                Object.assign(payload, { id: servicio.id });
            }

            // 6. Enviar
            const result = await onSubmit(payload);

            if (result.error) {
                setError(result.error);
                notify.error({
                    title: servicio ? 'Error al actualizar servicio' : 'Error al crear servicio',
                    description: result.error,
                });
            } else {
                notify.success({
                    title: servicio ? 'Servicio actualizado' : 'Servicio creado',
                });
                onSuccess();
            }
            // biome-ignore lint/suspicious/noExplicitAny: Error handling genérico
        } catch (err: any) {
            const message = err.message || 'Error al procesar la solicitud';
            setError(message);
            notify.error({ title: 'Error', description: message });
        } finally {
            setLoading(false);
        }
    }

    const labelClass = 'form-label';

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5 transition-colors duration-300 md:space-y-6"
        >
            {servicio && <input type="hidden" name="id" value={servicio.id} />}

            {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </div>
            )}

            {imagenPrincipal.error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                    {imagenPrincipal.error}
                </div>
            )}

            {/* País de publicación (solo admin con lista de países) */}
            {isAdmin && countries.length > 0 && (
                <Field
                    label="País de publicación"
                    hint="El servicio se mostrará en el sitio de este país"
                >
                    <Select
                        icon="globe"
                        name="countryCode"
                        value={formCountryCode}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        aria-label="País de publicación"
                    >
                        {countries.map((country) => (
                            <option key={country.code} value={country.code}>
                                {country.name}
                            </option>
                        ))}
                    </Select>
                </Field>
            )}

            {/* Selector de Usuario (solo admin en modo crear) */}
            {userSelector}

            {/* Título */}
            <div className={isAdmin ? 'md:col-span-2' : ''}>
                <Field label="Título del Servicio">
                    <Input
                        type="text"
                        id={`${id}-titulo`}
                        name="titulo"
                        defaultValue={servicio?.titulo}
                        required
                        placeholder={
                            isAdmin ? 'Ej: Gasfíter certificado' : 'Ej: Electricista certificado'
                        }
                    />
                </Field>
            </div>

            {/* Categoría y Comuna */}
            <div
                className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-2' : 'md:grid-cols-2'} gap-4`}
            >
                <div>
                    <span className={labelClass}>
                        {isAdmin ? 'Categorías (máx. 3)' : 'Categorías'}
                    </span>
                    <CategoriaMultiSelect
                        categorias={categorias}
                        values={categoriasSeleccionadas}
                        onChange={setCategoriasSeleccionadas}
                        required
                        maxSelections={3}
                    />
                </div>

                <div>
                    <LocalitySelect
                        key={formCountryCode}
                        countryCode={countryCode}
                        regionLabel={selectedCountryData?.regionLabel ?? regionLabel}
                        localityLabel={selectedCountryData?.localityLabel ?? localityLabel}
                        onSelect={setSelectedLocality}
                    />
                </div>
            </div>

            {/* Precio */}
            <div>
                <Field label={`Precio Base (${currency})`} hint={!isAdmin ? 'Este es un precio referencial que los clientes verán' : undefined}>
                    <Input
                        type="number"
                        id={`${id}-precio`}
                        name="precio"
                        defaultValue={servicio?.precio}
                        required
                        min="0"
                        step="1000"
                        placeholder={isAdmin ? '' : 'Ej: 25000'}
                    />
                </Field>
            </div>

            {/* Descripción */}
            <div>
                <Field label="Descripción">
                    <textarea
                        id={`${id}-descripcion`}
                        name="descripcion"
                        defaultValue={servicio?.descripcion}
                        required
                        rows={4}
                        placeholder={
                            isAdmin
                                ? 'Detalles del servicio...'
                                : 'Describe tu servicio, experiencia y lo que ofreces...'
                        }
                        className="w-full rounded-lg border bg-bg px-3 py-2 text-[13px] outline-none transition-colors focus:border-ink resize-none placeholder:text-muted"
                        style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                    />
                </Field>
            </div>

            {/* Datos de Contacto */}
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <span className={labelClass}>Datos de Contacto</span>
                </div>

                {/* Checkbox "Usar mis datos" */}
                {usuarioActual && !isAdmin && (
                    <div className="mb-4 flex items-center gap-3 rounded-2xl border border-line bg-tint p-4">
                        <input
                            type="checkbox"
                            id={usarDatosUsuarioId}
                            checked={usarDatosUsuario}
                            onChange={(e) => setUsarDatosUsuario(e.target.checked)}
                            className="h-4 w-4 cursor-pointer rounded border-line text-brand focus:ring-brand bg-bg"
                        />
                        <label
                            htmlFor={usarDatosUsuarioId}
                            className="cursor-pointer text-sm font-medium text-sub"
                        >
                            Usar datos de registro ({usuarioActual.nombre})
                        </label>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <Field label="Nombre de Contacto">
                            <Input
                                icon="user"
                                type="text"
                                id={nombreContactoId}
                                name="nombreContacto"
                                value={nombreContacto}
                                onChange={(e) => setNombreContacto(e.target.value)}
                                placeholder="Nombre de la persona o empresa"
                                required
                            />
                        </Field>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <Field label="Email de Contacto">
                                <Input
                                    icon="mail"
                                    type="email"
                                    id={emailContactoId}
                                    name="emailContacto"
                                    value={emailContacto}
                                    onChange={(e) => setEmailContacto(e.target.value)}
                                    placeholder="contacto@ejemplo.com"
                                    required
                                />
                            </Field>
                        </div>

                        <div>
                            <PhoneInput
                                id={telefonoContactoId}
                                name="telefonoContacto"
                                label="Teléfono de Contacto"
                                value={telefonoContacto}
                                onChange={setTelefonoContacto}
                                required
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Redes Sociales */}
            <SocialNetworksInput
                redesSociales={redesSociales.redesSociales}
                onAgregar={redesSociales.agregarRedSocial}
                onActualizar={redesSociales.actualizarRedSocial}
                onEliminar={redesSociales.eliminarRedSocial}
                variant={variant}
            />

            {/* Imagen Principal */}
            <div className={isAdmin ? 'pt-2' : ''}>
                <span className={labelClass}>Imagen Principal</span>
                <div className="space-y-3">
                    <ImageDropzone
                        maxSizeMB={3}
                        onFilesAccepted={(files) => {
                            if (files[0]) imagenPrincipal.handleFile(files[0]);
                        }}
                        error={imagenPrincipal.error}
                        label="Arrastra la imagen principal o haz clic para seleccionar"
                        description="JPG, PNG, WEBP · Máx. 3 MB"
                    />
                    {imagenPrincipal.preview && (
                        <div
                            className={`relative mt-2 w-full h-${isAdmin ? '40' : '48'} overflow-hidden rounded-xl border border-line ${isAdmin ? 'shadow-inner' : ''}`}
                        >
                            <Image
                                src={imagenPrincipal.preview}
                                alt="Preview"
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Galería */}
            <div className={isAdmin ? 'pt-2' : ''}>
                <span className={labelClass}>Galería de Imágenes</span>

                {imagenesExistentes.length > 0 && (
                    <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                        {imagenesExistentes.map((url, idx) => (
                            <div
                                key={url}
                                className={`group relative ${isAdmin ? 'aspect-square' : ''}`}
                            >
                                <Image
                                    src={url}
                                    alt={`Gal ${idx}`}
                                    fill
                                    className={`${isAdmin ? 'rounded-lg' : 'rounded-xl'} border border-line object-cover`}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImagenExistente(idx)}
                                    className={`absolute cursor-pointer ${isAdmin ? '-top-1.5 -right-1.5' : 'top-1 right-1'} rounded-full bg-red-500 p-1 text-white ${isAdmin ? 'shadow-lg' : 'opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600'}`}
                                >
                                    <X size={isAdmin ? 12 : 14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <GaleriaUpload
                    maxImages={4 - imagenesExistentes.length}
                    maxSizeMB={3}
                    label={
                        imagenesExistentes.length > 0
                            ? isAdmin
                                ? 'Sumar más fotos'
                                : 'Agregar más fotos'
                            : isAdmin
                              ? 'Fotos de Galería'
                              : 'Agregar fotos a la galería'
                    }
                    description={isAdmin ? undefined : 'Formatos permitidos: JPG, PNG, WEBP'}
                    onImagesChange={setImagenesNuevas}
                />
            </div>

            {/* Botones */}
            <div className="mt-8 flex justify-end gap-4">
                <Btn variant="secondary" type="button" disabled={loading} onClick={onCancel}>Cancelar</Btn>
                <Btn variant="primary" type="submit" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={16} />
                            <span>Guardando...</span>
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            <span>
                                {submitLabel ||
                                    (servicio ? 'Actualizar Servicio' : 'Crear Servicio')}
                            </span>
                        </>
                    )}
                </Btn>
            </div>
        </form>
    );
}
