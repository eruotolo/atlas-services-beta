import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Colors } from '@/shared/constants/colors';
import { Icon } from '@/shared/components/Icon';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useT } from '@/features/i18n/context/LocaleContext';
import { useCountry } from '@/features/country/context/CountryContext';
import { getCategories } from '@/features/services/actions/queries';
import { publishService } from '@/features/services/actions/mutations';
import type { ApiCategory } from '@/features/services/types';

const TOTAL_STEPS = 3;

interface FormData {
    title: string;
    description: string;
    price: string;
    commune: string;
    categoryIds: string[];
}

function StepIndicator({ current, total }: { readonly current: number; readonly total: number }): React.JSX.Element {
    return (
        <View className="flex-row items-center gap-2 px-5 py-3">
            {Array.from({ length: total }).map((_, i) => (
                <View
                    key={i}
                    className={`h-1 rounded-full flex-1 ${i < current ? 'bg-primary' : 'bg-outlineVariant'}`}
                />
            ))}
        </View>
    );
}

function Step1({
    data,
    categories,
    onChange,
}: {
    readonly data: FormData;
    readonly categories: readonly ApiCategory[];
    readonly onChange: (patch: Partial<FormData>) => void;
}): React.JSX.Element {
    const t = useT();

    const toggleCategory = (id: string): void => {
        const ids = data.categoryIds.includes(id)
            ? data.categoryIds.filter((c) => c !== id)
            : [...data.categoryIds, id];
        onChange({ categoryIds: ids });
    };

    return (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }} showsVerticalScrollIndicator={false}>
            <View className="gap-2">
                <Text className="text-sm font-semibold text-onSurface">
                    {t('publish.title_label', { defaultValue: 'Service Title *' })}
                </Text>
                <TextInput
                    className="bg-surfaceContainerLowest border border-outlineVariant rounded-xl p-4 text-base text-onSurface"
                    value={data.title}
                    onChangeText={(v) => onChange({ title: v })}
                    placeholder={t('publish.title_placeholder', { defaultValue: 'e.g. Expert Electrician' })}
                    placeholderTextColor={Colors.onSurfaceVariant}
                    returnKeyType="next"
                    maxLength={100}
                />
            </View>

            <View className="gap-3">
                <Text className="text-sm font-semibold text-onSurface">
                    {t('publish.categories_label', { defaultValue: 'Categories *' })}
                </Text>
                <Text className="text-xs text-onSurfaceVariant -mt-1">
                    {t('publish.categories_hint', { defaultValue: 'Select one or more' })}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                    {categories.map((cat) => {
                        const selected = data.categoryIds.includes(cat.id);
                        return (
                            <Pressable
                                key={cat.id}
                                onPress={() => toggleCategory(cat.id)}
                                className={`px-4 py-2 rounded-full border ${selected ? 'bg-primary border-primary' : 'bg-surfaceContainerLowest border-outlineVariant'}`}
                                style={({ pressed }) => pressed ? { opacity: 0.75 } : undefined}
                            >
                                <Text className={`text-sm font-medium ${selected ? 'text-onPrimary' : 'text-onSurface'}`}>
                                    {cat.name}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        </ScrollView>
    );
}

function Step2({
    data,
    onChange,
}: {
    readonly data: FormData;
    readonly onChange: (patch: Partial<FormData>) => void;
}): React.JSX.Element {
    const t = useT();
    const { country } = useCountry();

    return (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }} showsVerticalScrollIndicator={false}>
            <View className="gap-2">
                <Text className="text-sm font-semibold text-onSurface">
                    {t('publish.description_label', { defaultValue: 'Description *' })}
                </Text>
                <TextInput
                    className="bg-surfaceContainerLowest border border-outlineVariant rounded-xl p-4 text-base text-onSurface"
                    value={data.description}
                    onChangeText={(v) => onChange({ description: v })}
                    placeholder={t('publish.description_placeholder', { defaultValue: 'Describe your service, experience and skills...' })}
                    placeholderTextColor={Colors.onSurfaceVariant}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    style={{ minHeight: 120 }}
                    maxLength={1000}
                />
                <Text className="text-xs text-onSurfaceVariant text-right">
                    {data.description.length}/1000
                </Text>
            </View>

            <View className="gap-2">
                <Text className="text-sm font-semibold text-onSurface">
                    {t('publish.price_label', { defaultValue: 'Price' })} ({country.currencySymbol})
                </Text>
                <TextInput
                    className="bg-surfaceContainerLowest border border-outlineVariant rounded-xl p-4 text-base text-onSurface"
                    value={data.price}
                    onChangeText={(v) => onChange({ price: v.replace(/[^0-9]/g, '') })}
                    placeholder="0"
                    placeholderTextColor={Colors.onSurfaceVariant}
                    keyboardType="numeric"
                    returnKeyType="next"
                />
            </View>

            <View className="gap-2">
                <Text className="text-sm font-semibold text-onSurface">
                    {t('publish.commune_label', { defaultValue: 'City / Commune *' })}
                </Text>
                <TextInput
                    className="bg-surfaceContainerLowest border border-outlineVariant rounded-xl p-4 text-base text-onSurface"
                    value={data.commune}
                    onChangeText={(v) => onChange({ commune: v })}
                    placeholder={t('publish.commune_placeholder', { defaultValue: 'e.g. Santiago Centro' })}
                    placeholderTextColor={Colors.onSurfaceVariant}
                    returnKeyType="done"
                    maxLength={80}
                />
            </View>
        </ScrollView>
    );
}

function Step3({
    data,
    categories,
}: {
    readonly data: FormData;
    readonly categories: readonly ApiCategory[];
}): React.JSX.Element {
    const t = useT();
    const { country } = useCountry();
    const selectedCats = categories.filter((c) => data.categoryIds.includes(c.id));

    return (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }} showsVerticalScrollIndicator={false}>
            <Text className="text-base font-bold text-onSurface">
                {t('publish.review_title', { defaultValue: 'Review your listing' })}
            </Text>

            <View className="bg-surfaceContainerLowest rounded-2xl border border-outlineVariant overflow-hidden">
                <Row label={t('publish.review_service_title', { defaultValue: 'Title' })} value={data.title} />
                <Row
                    label={t('publish.categories_label', { defaultValue: 'Categories' })}
                    value={selectedCats.map((c) => c.name).join(', ')}
                />
                <Row
                    label={t('publish.description_label', { defaultValue: 'Description' })}
                    value={data.description}
                    multiline
                />
                <Row
                    label={t('publish.price_label', { defaultValue: 'Price' })}
                    value={data.price ? `${country.currencySymbol} ${data.price}` : '—'}
                />
                <Row
                    label={t('publish.commune_label', { defaultValue: 'Commune' })}
                    value={data.commune}
                    isLast
                />
            </View>

            <View className="bg-primaryContainer/10 rounded-xl p-4 border border-primaryContainer/20">
                <Text className="text-sm text-primaryContainer leading-5">
                    {t('publish.review_note', { defaultValue: 'Your service will be reviewed and published within 24 hours.' })}
                </Text>
            </View>
        </ScrollView>
    );
}

function Row({
    label,
    value,
    multiline = false,
    isLast = false,
}: {
    readonly label: string;
    readonly value: string;
    readonly multiline?: boolean;
    readonly isLast?: boolean;
}): React.JSX.Element {
    return (
        <View className={`px-4 py-3 ${!isLast ? 'border-b border-outlineVariant' : ''}`}>
            <Text className="text-xs text-onSurfaceVariant mb-1">{label}</Text>
            <Text
                className="text-[15px] text-onSurface leading-5"
                numberOfLines={multiline ? undefined : 2}
            >
                {value || '—'}
            </Text>
        </View>
    );
}

export default function PublishScreen(): React.JSX.Element {
    const t = useT();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const { countryCode } = useCountry();
    const queryClient = useQueryClient();

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState<FormData>({
        title: '',
        description: '',
        price: '',
        commune: '',
        categoryIds: [],
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['categories', countryCode],
        queryFn: () => getCategories(countryCode),
    });

    const patchForm = useCallback((patch: Partial<FormData>): void => {
        setForm((prev) => ({ ...prev, ...patch }));
    }, []);

    const canAdvance = (): boolean => {
        if (step === 1) return form.title.trim().length >= 3 && form.categoryIds.length > 0;
        if (step === 2) return form.description.trim().length >= 20 && form.commune.trim().length > 0;
        return true;
    };

    const handleNext = (): void => {
        if (step < TOTAL_STEPS) {
            setStep((s) => s + 1);
        }
    };

    const handleBack = (): void => {
        if (step > 1) {
            setStep((s) => s - 1);
        } else {
            router.back();
        }
    };

    const handleSubmit = async (): Promise<void> => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            const result = await publishService({
                title: form.title.trim(),
                description: form.description.trim(),
                price: form.price ? Number(form.price) : 0,
                commune: form.commune.trim(),
                categoryIds: form.categoryIds,
            });
            void queryClient.invalidateQueries({ queryKey: ['my-services'] });
            void queryClient.invalidateQueries({ queryKey: ['services'] });
            Alert.alert(
                t('publish.success_title', { defaultValue: 'Service Published!' }),
                t('publish.success_body', { defaultValue: `"${result.title}" is now under review.` }),
                [{ text: 'OK', onPress: () => router.back() }],
            );
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : undefined;
            Alert.alert(
                t('error', { defaultValue: 'Error' }),
                msg ?? t('publish.error_body', { defaultValue: 'Could not publish service. Try again.' }),
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const stepTitles: readonly string[] = [
        t('publish.step1_title', { defaultValue: 'Basic Info' }),
        t('publish.step2_title', { defaultValue: 'Details' }),
        t('publish.step3_title', { defaultValue: 'Review' }),
    ];

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-surface"
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header */}
            <View
                className="flex-row items-center gap-3 px-4 pb-3 border-b border-outlineVariant"
                style={{ paddingTop: insets.top + 12 }}
            >
                <Pressable
                    className="w-10 h-10 justify-center items-center"
                    onPress={handleBack}
                    accessibilityRole="button"
                >
                    <Icon name="arrow-left" size={24} color={Colors.onSurface} />
                </Pressable>
                <View className="flex-1">
                    <Text className="text-lg font-bold text-onSurface">
                        {t('publish.screen_title', { defaultValue: 'Publish Service' })}
                    </Text>
                    <Text className="text-xs text-onSurfaceVariant">
                        {t('publish.step_of', { step, total: TOTAL_STEPS, name: stepTitles[step - 1], defaultValue: `Step ${step} of ${TOTAL_STEPS} — ${stepTitles[step - 1]}` })}
                    </Text>
                </View>
            </View>

            <StepIndicator current={step} total={TOTAL_STEPS} />

            <View className="flex-1">
                {step === 1 && <Step1 data={form} categories={categories} onChange={patchForm} />}
                {step === 2 && <Step2 data={form} onChange={patchForm} />}
                {step === 3 && <Step3 data={form} categories={categories} />}
            </View>

            {/* Bottom CTA */}
            <View
                className="px-5 pt-4 border-t border-outlineVariant bg-surface"
                style={{ paddingBottom: Math.max(insets.bottom, 20) }}
            >
                <Pressable
                    className="bg-primary rounded-2xl h-14 justify-center items-center"
                    style={({ pressed }) => ({
                        opacity: pressed || isSubmitting || !canAdvance() ? 0.65 : 1,
                        shadowColor: Colors.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 12,
                        elevation: 6,
                    })}
                    onPress={step < TOTAL_STEPS ? handleNext : () => { void handleSubmit(); }}
                    disabled={isSubmitting || !canAdvance()}
                    accessibilityRole="button"
                >
                    {isSubmitting ? (
                        <ActivityIndicator color={Colors.onPrimary} />
                    ) : (
                        <Text className="text-onPrimary text-[17px] font-bold">
                            {step < TOTAL_STEPS
                                ? t('publish.next', { defaultValue: 'Next' })
                                : t('publish.submit', { defaultValue: 'Publish Service' })}
                        </Text>
                    )}
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}
