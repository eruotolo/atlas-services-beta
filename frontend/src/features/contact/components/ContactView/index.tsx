'use client';

import type React from 'react';
import { useId, useState, type ReactElement } from 'react';

import { enviarFormularioContacto } from '@/features/contact/actions';
import { Btn, Icon, Mono, SectionLabel } from '@/shared/components/hireeo';
import { AnimatedRotatingText } from '@/shared/components/hireeo/ui/AnimatedRotatingText';

interface ContactViewTranslations {
    title: string;
    titleHighlight: string;
    subtitle: string;
    email: string;
    whatsapp: string;
    office: string;
    officeValue: string;
    form: {
        name: string;
        namePlaceholder: string;
        email: string;
        emailPlaceholder: string;
        phone: string;
        phonePlaceholder: string;
        subject: string;
        subjectOptions: string[];
        message: string;
        messagePlaceholder: string;
        submit: string;
        sending: string;
        success: string;
        defaultSubject: string;
    };
}

interface ContactViewProps {
    t?: ContactViewTranslations;
}

const DEFAULT_T: ContactViewTranslations = {
    title: 'Tres canales.',
    titleHighlight: 'Una respuesta humana.',
    subtitle:
        'Si necesitas soporte de un trabajo en curso, contactá primero al profesional por chat. Para temas de cuenta, pago o prensa, te leemos por acá.',
    email: 'Soporte general',
    whatsapp: 'WhatsApp Soporte',
    office: 'Reportes y seguridad',
    officeValue: 'Operación 100% remota · LATAM',
    form: {
        name: 'Nombre',
        namePlaceholder: 'Tu nombre',
        email: 'Correo',
        emailPlaceholder: 'tu@correo.com',
        phone: 'Teléfono',
        phonePlaceholder: '+56 9 1234 5678',
        subject: 'Tipo de consulta',
        subjectOptions: ['Soporte general', 'Empresas y partnerships', 'Reportes y seguridad', 'Otro'],
        message: 'Mensaje',
        messagePlaceholder:
            'Contanos lo que necesitás, y si aplica, mencioná el número de servicio (S-XXXX) o el país.',
        submit: 'Enviar mensaje',
        sending: 'Enviando…',
        success: '¡Mensaje enviado! Te respondemos pronto.',
        defaultSubject: 'Soporte general',
    },
};

interface ChannelCardProps {
    icon: 'mail' | 'briefcase' | 'shield' | 'phone';
    label: string;
    value: string;
    sub: string;
    href?: string;
}

function ChannelCard({ icon, label, value, sub, href }: ChannelCardProps): ReactElement {
    const inner = (
        <>
            <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-tint"
            >
                <Icon name={icon} size={15} />
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-[12px] font-medium text-sub">
                    {label}
                </div>
                <div
                    className="mt-0.5 text-[15.5px] font-semibold text-ink"
                >
                    {value}
                </div>
                <div className="mt-1 text-[12.5px] text-sub">
                    {sub}
                </div>
            </div>
        </>
    );

    const className =
        'flex items-start gap-3.5 rounded-[10px] border bg-bg p-4 transition-colors hover:bg-tint';
    const style = { borderColor: 'var(--line)' };

    if (href) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
                {inner}
            </a>
        );
    }
    return (
        <div className={className} style={style}>
            {inner}
        </div>
    );
}

const ContactView: React.FC<ContactViewProps> = ({ t }) => {
    const tr = t ?? DEFAULT_T;

    const nombreId = useId();
    const emailId = useId();
    const celularId = useId();
    const asuntoId = useId();
    const mensajeId = useId();

    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        celular: '',
        asunto: tr.form.defaultSubject,
        mensaje: '',
    });

    const [estado, setEstado] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [mensajeError, setMensajeError] = useState('');

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ): void => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setEstado('loading');
        setMensajeError('');

        const resultado = await enviarFormularioContacto(formData);

        if (resultado.error) {
            setEstado('error');
            setMensajeError(resultado.error);
        } else {
            setEstado('success');
            setFormData({
                nombre: '',
                email: '',
                celular: '',
                asunto: tr.form.defaultSubject,
                mensaje: '',
            });
            setTimeout(() => setEstado('idle'), 5000);
        }
    };

    const inputClass =
        'w-full rounded-md border bg-bg px-3 py-2.5 text-[13px] outline-none transition-colors focus:border-ink';
    const labelClass = 'mb-1.5 block text-[12px] font-semibold';

    return (
        <section className="bg-bg text-ink">
            <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-12 px-6 py-16 sm:px-10 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:px-14 lg:py-24">
                <div>
                    <SectionLabel>— CONTACTO</SectionLabel>
                    <h1
                        className="m-0 mt-3.5 mb-5 font-medium tracking-tighter text-ink"
                        style={{
                            fontSize: 'clamp(34px, 5vw, 52px)',
                            lineHeight: 0.98}} 
                    >
                        <AnimatedRotatingText
                            delay={300}
                            speed={40}
                            segments={[{ text: `${tr.title}\n${tr.titleHighlight}` }]}
                        />
                    </h1>
                    <p
                        className="m-0 mb-10 text-[16px] leading-[1.55] text-sub"
                    >
                        {tr.subtitle}
                    </p>

                    <div className="flex flex-col gap-3.5">
                        <ChannelCard
                            icon="mail"
                            label={tr.email}
                            value="info@hireeo.app"
                            sub="Respondemos en menos de 4 horas hábiles"
                            href="mailto:info@hireeo.app"
                        />
                        <ChannelCard
                            icon="phone"
                            label={tr.whatsapp}
                            value="+56 9 2954 0906"
                            sub="L-V 9 a 19 hrs (CLT)"
                            href="https://wa.me/56929540906"
                        />
                        <ChannelCard
                            icon="shield"
                            label={tr.office}
                            value="safety@hireeo.app"
                            sub={tr.officeValue}
                            href="mailto:safety@hireeo.app"
                        />
                    </div>
                </div>

                <div
                    className="rounded-[14px] border bg-bg p-8 border-line"
                >
                    <h2
                        className="m-0 mb-1.5 font-semibold text-ink"
                        style={{
                            fontSize: 22,
                            letterSpacing: '-0.015em'}} 
                    >
                        Escribinos.
                    </h2>
                    <p
                        className="m-0 mb-7 text-[13px] text-sub"
                    >
                        Te respondemos al correo que dejes.
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label
                                htmlFor={nombreId}
                                className={`${labelClass} text-ink`}
                            >
                                {tr.form.name}
                            </label>
                            <input
                                type="text"
                                id={nombreId}
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                placeholder={tr.form.namePlaceholder}
                                required
                                className={`${inputClass} border-line text-ink`}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor={emailId}
                                className={`${labelClass} text-ink`}
                            >
                                {tr.form.email}
                            </label>
                            <input
                                type="email"
                                id={emailId}
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder={tr.form.emailPlaceholder}
                                required
                                className={`${inputClass} border-line text-ink`}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor={celularId}
                                className={`${labelClass} text-ink`}
                            >
                                {tr.form.phone}
                            </label>
                            <input
                                type="tel"
                                id={celularId}
                                name="celular"
                                value={formData.celular}
                                onChange={handleChange}
                                placeholder={tr.form.phonePlaceholder}
                                required
                                className={`${inputClass} border-line text-ink`}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor={asuntoId}
                                className={`${labelClass} text-ink`}
                            >
                                {tr.form.subject}
                            </label>
                            <select
                                id={asuntoId}
                                name="asunto"
                                value={formData.asunto}
                                onChange={handleChange}
                                required
                                className={`${inputClass} border-line text-ink`}
                            >
                                {tr.form.subjectOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor={mensajeId}
                                className={`${labelClass} text-ink`}
                            >
                                {tr.form.message}
                            </label>
                            <textarea
                                id={mensajeId}
                                name="mensaje"
                                value={formData.mensaje}
                                onChange={handleChange}
                                rows={5}
                                placeholder={tr.form.messagePlaceholder}
                                required
                                className={`${inputClass} resize-none border-line text-ink`}
                            />
                            <Mono
                                className="mt-1.5 inline-block text-[11px] text-muted"
                            >
                                Hasta 1.500 caracteres
                            </Mono>
                        </div>

                        {estado === 'error' ? (
                            <div
                                className="rounded-md px-3 py-2 text-[12.5px]"
                                style={{
                                    background: 'var(--danger-soft)',
                                    color: 'var(--danger)',
                                }}
                            >
                                {mensajeError}
                            </div>
                        ) : null}

                        {estado === 'success' ? (
                            <div
                                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-[12.5px] font-semibold"
                                style={{
                                    background: 'var(--success-soft)',
                                    color: 'var(--success)',
                                }}
                            >
                                <Icon name="check" size={12} stroke="var(--success)" strokeWidth={2.5} />
                                {tr.form.success}
                            </div>
                        ) : null}

                        <div className="mt-2 flex items-center justify-end">
                            <Btn
                                type="submit"
                                variant="primary"
                                iconRight="send"
                                disabled={estado === 'loading'}
                            >
                                {estado === 'loading' ? tr.form.sending : tr.form.submit}
                            </Btn>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ContactView;
