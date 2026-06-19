import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { Colors } from '@/shared/constants/colors';
import { Icon } from '@/shared/components/Icon';
import { useT } from '@/features/i18n/context/LocaleContext';
import { useCountry } from '@/features/country/context/CountryContext';
import { getCountry, getRegions, getLocalities } from '@/features/geo/actions/queries';
import { useAddresses, useCreateAddress, useDeleteAddress } from '@/features/profile/hooks/useAddresses';
import type { UserAddress } from '@/features/profile/actions/addresses';
import type { GeoRegion, GeoLocality } from '@/features/geo/actions/queries';

interface AddressFormState {
    alias: string;
    street: string;
    number: string;
    apartment: string;
    reference: string;
    regionId: string;
    localityId: string;
}

const EMPTY_FORM: AddressFormState = {
    alias: '',
    street: '',
    number: '',
    apartment: '',
    reference: '',
    regionId: '',
    localityId: '',
};

function GeoPickerModal({
    visible,
    title,
    items,
    selectedId,
    onSelect,
    onClose,
}: {
    readonly visible: boolean;
    readonly title: string;
    readonly items: readonly { id: string; name: string }[];
    readonly selectedId: string;
    readonly onSelect: (id: string, name: string) => void;
    readonly onClose: () => void;
}): React.JSX.Element {
    const insets = useSafeAreaInsets();
    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
                <View className="flex-row items-center justify-between px-5 py-4 border-b border-outlineVariant">
                    <Text className="text-lg font-bold text-onSurface">{title}</Text>
                    <Pressable onPress={onClose} accessibilityRole="button">
                        <Icon name="x" size={24} color={Colors.onSurface} />
                    </Pressable>
                </View>
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id}
                    ItemSeparatorComponent={() => <View className="h-px bg-outlineVariant mx-5" />}
                    renderItem={({ item }) => (
                        <Pressable
                            className="flex-row items-center justify-between px-5 py-4"
                            style={({ pressed }) => pressed ? { backgroundColor: Colors.surfaceContainerLow } : undefined}
                            onPress={() => { onSelect(item.id, item.name); onClose(); }}
                            accessibilityRole="button"
                        >
                            <Text className="text-[15px] text-onSurface">{item.name}</Text>
                            {selectedId === item.id && (
                                <Icon name="circle-check-filled" size={20} color={Colors.primary} />
                            )}
                        </Pressable>
                    )}
                />
            </View>
        </Modal>
    );
}

function AddressModal({
    visible,
    onClose,
    countryCode,
}: {
    readonly visible: boolean;
    readonly onClose: () => void;
    readonly countryCode: string;
}): React.JSX.Element {
    const t = useT();
    const insets = useSafeAreaInsets();
    const [form, setForm] = useState<AddressFormState>(EMPTY_FORM);
    const [regionName, setRegionName] = useState('');
    const [localityName, setLocalityName] = useState('');
    const [showRegionPicker, setShowRegionPicker] = useState(false);
    const [showLocalityPicker, setShowLocalityPicker] = useState(false);

    const { data: countryData } = useQuery({
        queryKey: ['country', countryCode],
        queryFn: () => getCountry(countryCode),
    });
    const { data: regions = [] } = useQuery({
        queryKey: ['regions', countryCode],
        queryFn: () => getRegions(countryCode),
    });
    const { data: localities = [] } = useQuery({
        queryKey: ['localities', form.regionId],
        queryFn: () => getLocalities(form.regionId),
        enabled: form.regionId.length > 0,
    });

    const { mutate: createAddress, isPending } = useCreateAddress();

    const patch = (key: keyof AddressFormState, value: string): void => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const isValid =
        form.street.trim().length > 0 &&
        form.number.trim().length > 0 &&
        form.regionId.length > 0 &&
        form.localityId.length > 0 &&
        countryData?.id != null;

    const handleCreate = (): void => {
        if (!isValid || countryData?.id == null) return;
        createAddress(
            {
                alias: form.alias.trim() || undefined,
                street: form.street.trim(),
                number: form.number.trim(),
                apartment: form.apartment.trim() || undefined,
                reference: form.reference.trim() || undefined,
                countryId: countryData.id,
                regionId: form.regionId,
                localityId: form.localityId,
            },
            {
                onSuccess: (result) => {
                    if (result.success) {
                        setForm(EMPTY_FORM);
                        setRegionName('');
                        setLocalityName('');
                        onClose();
                    } else {
                        Alert.alert(t('error', { defaultValue: 'Error' }), result.error ?? '');
                    }
                },
                onError: () => {
                    Alert.alert(t('error', { defaultValue: 'Error' }), t('addresses.create_error', { defaultValue: 'Could not save address.' }));
                },
            },
        );
    };

    const handleClose = (): void => {
        setForm(EMPTY_FORM);
        setRegionName('');
        setLocalityName('');
        onClose();
    };

    return (
        <>
            <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
                <KeyboardAvoidingView
                    className="flex-1 bg-surface"
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View
                        className="flex-row items-center justify-between px-5 pb-4 border-b border-outlineVariant"
                        style={{ paddingTop: insets.top + 12 }}
                    >
                        <Pressable onPress={handleClose} accessibilityRole="button">
                            <Text className="text-base text-onSurfaceVariant font-medium">
                                {t('actions.cancel', { defaultValue: 'Cancel' })}
                            </Text>
                        </Pressable>
                        <Text className="text-base font-bold text-onSurface">
                            {t('addresses.add_title', { defaultValue: 'New Address' })}
                        </Text>
                        <View style={{ width: 60 }} />
                    </View>

                    <ScrollView
                        contentContainerStyle={{ padding: 20, gap: 16 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Field label={t('addresses.alias', { defaultValue: 'Label (e.g. Home, Work)' })} optional>
                            <TextInput
                                className="bg-surfaceContainerLowest border border-outlineVariant rounded-xl p-4 text-base text-onSurface"
                                value={form.alias}
                                onChangeText={(v) => patch('alias', v)}
                                placeholder={t('addresses.alias_placeholder', { defaultValue: 'Home' })}
                                placeholderTextColor={Colors.onSurfaceVariant}
                                maxLength={40}
                            />
                        </Field>

                        <View className="flex-row gap-3">
                            <View className="flex-1">
                                <Field label={t('addresses.street', { defaultValue: 'Street *' })}>
                                    <TextInput
                                        className="bg-surfaceContainerLowest border border-outlineVariant rounded-xl p-4 text-base text-onSurface"
                                        value={form.street}
                                        onChangeText={(v) => patch('street', v)}
                                        placeholder={t('addresses.street_placeholder', { defaultValue: 'Main St' })}
                                        placeholderTextColor={Colors.onSurfaceVariant}
                                        maxLength={100}
                                    />
                                </Field>
                            </View>
                            <View style={{ width: 90 }}>
                                <Field label={t('addresses.number', { defaultValue: 'Number *' })}>
                                    <TextInput
                                        className="bg-surfaceContainerLowest border border-outlineVariant rounded-xl p-4 text-base text-onSurface"
                                        value={form.number}
                                        onChangeText={(v) => patch('number', v)}
                                        placeholder="123"
                                        placeholderTextColor={Colors.onSurfaceVariant}
                                        keyboardType="numeric"
                                        maxLength={10}
                                    />
                                </Field>
                            </View>
                        </View>

                        <Field label={t('addresses.apartment', { defaultValue: 'Apt / Floor' })} optional>
                            <TextInput
                                className="bg-surfaceContainerLowest border border-outlineVariant rounded-xl p-4 text-base text-onSurface"
                                value={form.apartment}
                                onChangeText={(v) => patch('apartment', v)}
                                placeholder={t('addresses.apartment_placeholder', { defaultValue: 'Apt 4B' })}
                                placeholderTextColor={Colors.onSurfaceVariant}
                                maxLength={40}
                            />
                        </Field>

                        <Field label={t('addresses.region', { defaultValue: 'Region *' })}>
                            <Pressable
                                className="bg-surfaceContainerLowest border border-outlineVariant rounded-xl p-4 flex-row items-center justify-between"
                                style={({ pressed }) => pressed ? { opacity: 0.75 } : undefined}
                                onPress={() => setShowRegionPicker(true)}
                                accessibilityRole="button"
                            >
                                <Text className={`text-base ${regionName ? 'text-onSurface' : 'text-onSurfaceVariant'}`}>
                                    {regionName || t('addresses.region_placeholder', { defaultValue: 'Select region' })}
                                </Text>
                                <Icon name="chevron-down" size={18} color={Colors.onSurfaceVariant} />
                            </Pressable>
                        </Field>

                        <Field label={t('addresses.locality', { defaultValue: 'City / Commune *' })}>
                            <Pressable
                                className={`bg-surfaceContainerLowest border border-outlineVariant rounded-xl p-4 flex-row items-center justify-between ${form.regionId ? '' : 'opacity-50'}`}
                                style={({ pressed }) => pressed && form.regionId ? { opacity: 0.75 } : undefined}
                                onPress={() => form.regionId && setShowLocalityPicker(true)}
                                disabled={!form.regionId}
                                accessibilityRole="button"
                            >
                                <Text className={`text-base ${localityName ? 'text-onSurface' : 'text-onSurfaceVariant'}`}>
                                    {localityName || t('addresses.locality_placeholder', { defaultValue: 'Select city' })}
                                </Text>
                                <Icon name="chevron-down" size={18} color={Colors.onSurfaceVariant} />
                            </Pressable>
                        </Field>

                        <Field label={t('addresses.reference', { defaultValue: 'Reference note' })} optional>
                            <TextInput
                                className="bg-surfaceContainerLowest border border-outlineVariant rounded-xl p-4 text-base text-onSurface"
                                value={form.reference}
                                onChangeText={(v) => patch('reference', v)}
                                placeholder={t('addresses.reference_placeholder', { defaultValue: 'Blue gate, 2nd floor...' })}
                                placeholderTextColor={Colors.onSurfaceVariant}
                                multiline
                                numberOfLines={2}
                                textAlignVertical="top"
                                maxLength={200}
                            />
                        </Field>
                    </ScrollView>

                    <View
                        className="px-5 pt-4 border-t border-outlineVariant bg-surface"
                        style={{ paddingBottom: Math.max(insets.bottom, 20) }}
                    >
                        <Pressable
                            className="bg-primary rounded-2xl h-14 justify-center items-center"
                            style={({ pressed }) => ({
                                opacity: pressed || isPending || !isValid ? 0.65 : 1,
                            })}
                            onPress={handleCreate}
                            disabled={isPending || !isValid}
                            accessibilityRole="button"
                        >
                            {isPending
                                ? <ActivityIndicator color={Colors.onPrimary} />
                                : <Text className="text-onPrimary text-[17px] font-bold">
                                    {t('addresses.save', { defaultValue: 'Save Address' })}
                                </Text>
                            }
                        </Pressable>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            <GeoPickerModal
                visible={showRegionPicker}
                title={t('addresses.region', { defaultValue: 'Region' })}
                items={regions}
                selectedId={form.regionId}
                onSelect={(id, name) => {
                    patch('regionId', id);
                    setRegionName(name);
                    patch('localityId', '');
                    setLocalityName('');
                }}
                onClose={() => setShowRegionPicker(false)}
            />

            <GeoPickerModal
                visible={showLocalityPicker}
                title={t('addresses.locality', { defaultValue: 'City / Commune' })}
                items={localities}
                selectedId={form.localityId}
                onSelect={(id, name) => { patch('localityId', id); setLocalityName(name); }}
                onClose={() => setShowLocalityPicker(false)}
            />
        </>
    );
}

function Field({
    label,
    optional = false,
    children,
}: {
    readonly label: string;
    readonly optional?: boolean;
    readonly children: React.ReactNode;
}): React.JSX.Element {
    return (
        <View className="gap-1.5">
            <Text className="text-sm font-semibold text-onSurface">
                {label}
                {optional && <Text className="text-onSurfaceVariant font-normal"> (optional)</Text>}
            </Text>
            {children}
        </View>
    );
}

export default function AddressesScreen(): React.JSX.Element {
    const insets = useSafeAreaInsets();
    const t = useT();
    const { countryCode } = useCountry();
    const [showAddModal, setShowAddModal] = useState(false);

    const { data: addresses = [], isLoading, isError, refetch } = useAddresses();
    const { mutate: deleteAddress } = useDeleteAddress();

    const handleDelete = (id: string): void => {
        Alert.alert(
            t('addresses.delete_title', { defaultValue: 'Delete Address' }),
            t('addresses.delete_confirm', { defaultValue: 'Are you sure you want to delete this address?' }),
            [
                { text: t('actions.cancel', { defaultValue: 'Cancel' }), style: 'cancel' },
                {
                    text: t('actions.delete', { defaultValue: 'Delete' }),
                    style: 'destructive',
                    onPress: () => deleteAddress(id, {
                        onError: () => Alert.alert(t('error', { defaultValue: 'Error' }), t('addresses.delete_error', { defaultValue: 'Could not delete address.' })),
                    }),
                },
            ],
        );
    };

    return (
        <View className="flex-1 bg-surface">
            <View
                className="flex-row items-center justify-between px-4 pb-4 border-b border-outlineVariant"
                style={{ paddingTop: insets.top + 12 }}
            >
                <Pressable className="w-10 h-10 justify-center items-start" onPress={() => router.back()} accessibilityRole="button">
                    <Icon name="arrow-left" size={24} color={Colors.onSurface} />
                </Pressable>
                <Text className="text-lg font-bold text-onSurface">
                    {t('profile.addresses', { defaultValue: 'My Addresses' })}
                </Text>
                <Pressable
                    className="w-10 h-10 justify-center items-end"
                    onPress={() => setShowAddModal(true)}
                    accessibilityRole="button"
                    accessibilityLabel={t('addresses.add_title', { defaultValue: 'New Address' })}
                >
                    <Icon name="plus" size={24} color={Colors.primary} />
                </Pressable>
            </View>

            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : isError ? (
                <View className="flex-1 justify-center items-center gap-4 px-8">
                    <Text className="text-base text-onSurfaceVariant text-center">
                        {t('errors.load_failed', { defaultValue: 'Could not load addresses.' })}
                    </Text>
                    <Pressable className="bg-primary px-6 py-3 rounded-xl" onPress={() => void refetch()}>
                        <Text className="text-onPrimary font-semibold">{t('actions.retry', { defaultValue: 'Retry' })}</Text>
                    </Pressable>
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
                    {(addresses as readonly UserAddress[]).length > 0 ? (
                        (addresses as readonly UserAddress[]).map((addr) => (
                            <View
                                key={addr.id}
                                className="bg-surfaceContainerLowest p-4 rounded-xl border border-outlineVariant"
                            >
                                <View className="flex-row items-start justify-between gap-2">
                                    <View className="flex-row items-center gap-2 flex-1">
                                        <Icon name="home-pin" size={20} color={Colors.primary} />
                                        <Text className="text-base font-bold text-onSurface flex-1">
                                            {addr.alias ?? `${addr.street} ${addr.number}`}
                                        </Text>
                                    </View>
                                    <Pressable
                                        className="p-1"
                                        onPress={() => handleDelete(addr.id)}
                                        accessibilityRole="button"
                                        accessibilityLabel={t('actions.delete', { defaultValue: 'Delete' })}
                                    >
                                        <Icon name="trash" size={18} color={Colors.error} />
                                    </Pressable>
                                </View>
                                <Text className="text-sm text-onSurfaceVariant leading-5 mt-2 ml-7">
                                    {addr.street} {addr.number}
                                    {addr.apartment ? `, ${addr.apartment}` : ''}
                                </Text>
                                <Text className="text-sm text-onSurfaceVariant leading-5 ml-7">
                                    {addr.locality?.name}, {addr.region?.name}
                                </Text>
                                {addr.reference != null && addr.reference.length > 0 && (
                                    <Text className="text-xs text-onSurfaceVariant ml-7 mt-1 italic">
                                        {addr.reference}
                                    </Text>
                                )}
                            </View>
                        ))
                    ) : (
                        <View className="items-center mt-10 gap-3">
                            <Icon name="location-off" size={48} color={Colors.outlineVariant} />
                            <Text className="text-lg font-bold text-onSurface">
                                {t('profile.no_addresses', { defaultValue: 'No addresses yet' })}
                            </Text>
                            <Text className="text-sm text-onSurfaceVariant text-center px-5">
                                {t('profile.no_addresses_desc', { defaultValue: 'Add an address to make booking easier.' })}
                            </Text>
                            <Pressable
                                className="mt-2 bg-primary px-6 py-3 rounded-xl"
                                onPress={() => setShowAddModal(true)}
                            >
                                <Text className="text-onPrimary font-semibold">
                                    {t('addresses.add_title', { defaultValue: 'Add Address' })}
                                </Text>
                            </Pressable>
                        </View>
                    )}
                </ScrollView>
            )}

            <AddressModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                countryCode={countryCode}
            />
        </View>
    );
}
