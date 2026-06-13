'use client';

import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react';

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import {
    Controller,
    FormProvider,
    useForm,
    useFormContext,
    type FieldValues,
    type Path,
    type SubmitHandler,
    type UseFormProps,
    type UseFormReturn,
} from 'react-hook-form';
import type { z } from 'zod';

import { Field, Input, Select, Toggle } from '@/shared/components/hireeo';

/**
 * Hook que une React Hook Form con un schema Zod.
 * TInput/TOutput se infieren del schema (z.input / z.output).
 */
export function useZodForm<TInput extends FieldValues, TOutput extends FieldValues>(
    schema: z.ZodType<TOutput, TInput>,
    options?: Omit<UseFormProps<TInput, unknown, TOutput>, 'resolver'>,
): UseFormReturn<TInput, unknown, TOutput> {
    return useForm<TInput, unknown, TOutput>({
        resolver: standardSchemaResolver(schema),
        ...options,
    });
}

interface FormProps<TInput extends FieldValues, TOutput extends FieldValues> {
    form: UseFormReturn<TInput, unknown, TOutput>;
    onSubmit: SubmitHandler<TOutput>;
    children: ReactNode;
    className?: string;
}

/** Wrapper de <form> con FormProvider: los campos hijos acceden al contexto RHF. */
export function Form<TInput extends FieldValues, TOutput extends FieldValues>({
    form,
    onSubmit,
    children,
    className,
}: FormProps<TInput, TOutput>): ReactElement {
    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={className} noValidate>
                {children}
            </form>
        </FormProvider>
    );
}

interface FormFieldBaseProps {
    name: string;
    label: string;
    hint?: string;
    optional?: boolean;
}

type FormInputProps = FormFieldBaseProps &
    Omit<ComponentPropsWithoutRef<typeof Input>, 'name' | 'value' | 'onChange' | 'onBlur'>;

/** Input de texto controlado, con label y error del schema Zod. */
export function FormInput({
    name,
    label,
    hint,
    optional,
    ...inputProps
}: FormInputProps): ReactElement {
    const { control } = useFormContext();
    return (
        <Controller
            control={control}
            name={name as Path<FieldValues>}
            render={({ field, fieldState }) => (
                <Field label={label} hint={hint} optional={optional} error={fieldState.error?.message}>
                    <Input
                        {...inputProps}
                        name={field.name}
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                    />
                </Field>
            )}
        />
    );
}

interface FormSelectOption {
    value: string;
    label: string;
}

type FormSelectProps = FormFieldBaseProps &
    Omit<
        ComponentPropsWithoutRef<typeof Select>,
        'name' | 'value' | 'onChange' | 'onBlur' | 'children'
    > & {
        options: readonly FormSelectOption[];
    };

/** Select controlado con opciones tipadas. */
export function FormSelect({
    name,
    label,
    hint,
    optional,
    options,
    ...selectProps
}: FormSelectProps): ReactElement {
    const { control } = useFormContext();
    return (
        <Controller
            control={control}
            name={name as Path<FieldValues>}
            render={({ field, fieldState }) => (
                <Field label={label} hint={hint} optional={optional} error={fieldState.error?.message}>
                    <Select
                        {...selectProps}
                        name={field.name}
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                    >
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </Select>
                </Field>
            )}
        />
    );
}

interface FormToggleProps {
    name: string;
    label: string;
    description?: string;
}

/** Switch booleano controlado, presentado como card (label + descripción). */
export function FormToggle({ name, label, description }: FormToggleProps): ReactElement {
    const { control } = useFormContext();
    return (
        <Controller
            control={control}
            name={name as Path<FieldValues>}
            render={({ field }) => (
                <div className="flex items-center justify-between rounded-xl border border-line bg-tint/40 px-4 py-3">
                    <div>
                        <p className="text-[12px] font-semibold tracking-[-0.005em] text-ink">
                            {label}
                        </p>
                        {description ? (
                            <p className="mt-0.5 text-[11px] text-sub">{description}</p>
                        ) : null}
                    </div>
                    <Toggle
                        checked={field.value === true}
                        onChange={field.onChange}
                        ariaLabel={label}
                    />
                </div>
            )}
        />
    );
}

/** Mensaje de error general del formulario (errores de servidor). */
export function FormError({ message }: { message?: string }): ReactElement | null {
    if (!message) return null;
    return (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
            {message}
        </div>
    );
}
