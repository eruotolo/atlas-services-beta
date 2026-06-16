import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Colors } from '@/shared/constants/colors';
import { Icon } from '@/shared/components/Icon';
import { useT } from '@/features/i18n/context/LocaleContext';
import { useAvailableLeads, useSubmitQuote } from '@/features/services/hooks/useLeads';
import type { AvailableLead } from '@/features/services/types/leads';

const URGENCY_LABELS: Record<string, string> = {
    urgent: 'Urgent',
    this_week: 'This week',
    whenever: 'Whenever',
};

const URGENCY_COLORS: Record<string, string> = {
    urgent: '#EF4444',
    this_week: '#F59E0B',
    whenever: '#6B7280',
};

function LeadCard({
    lead,
    onQuote,
}: {
    readonly lead: AvailableLead;
    readonly onQuote: (lead: AvailableLead) => void;
}): React.JSX.Element {
    const t = useT();
    const urgencyColor = URGENCY_COLORS[lead.urgency] ?? Colors.onSurfaceVariant;
    const alreadyQuoted = lead.quotes.length > 0;

    return (
        <View className="bg-surfaceContainerLowest rounded-2xl border border-outlineVariant p-4 gap-3">
            {/* Header row */}
            <View className="flex-row items-start justify-between gap-2">
                <View className="flex-1 gap-1">
                    <Text className="text-[15px] font-bold text-onSurface" numberOfLines={2}>
                        {lead.category.name}
                    </Text>
                    <Text className="text-xs text-onSurfaceVariant">
                        {new Date(lead.createdAt).toLocaleDateString()}
                    </Text>
                </View>
                <View className="px-2 py-1 rounded-full" style={{ backgroundColor: `${urgencyColor}22` }}>
                    <Text className="text-xs font-semibold" style={{ color: urgencyColor }}>
                        {URGENCY_LABELS[lead.urgency] ?? lead.urgency}
                    </Text>
                </View>
            </View>

            {/* Description */}
            <Text className="text-[13px] text-onSurfaceVariant leading-5" numberOfLines={4}>
                {lead.description}
            </Text>

            {/* Client info */}
            <View className="flex-row items-center gap-2">
                <View className="w-7 h-7 rounded-full bg-primaryContainer/20 justify-center items-center">
                    <Icon name="user" size={16} color={Colors.primaryContainer} />
                </View>
                <Text className="text-[13px] font-medium text-onSurface">{lead.user.name}</Text>
            </View>

            {/* CTA */}
            <Pressable
                className={`h-11 rounded-xl justify-center items-center ${alreadyQuoted ? 'bg-surfaceContainerHigh' : 'bg-primary'}`}
                style={({ pressed }) => (pressed && !alreadyQuoted) ? { opacity: 0.85 } : undefined}
                onPress={() => !alreadyQuoted && onQuote(lead)}
                disabled={alreadyQuoted}
                accessibilityRole="button"
            >
                <Text className={`text-sm font-bold ${alreadyQuoted ? 'text-onSurfaceVariant' : 'text-onPrimary'}`}>
                    {alreadyQuoted
                        ? t('leads.already_quoted', { defaultValue: 'Quote Sent' })
                        : t('leads.send_quote', { defaultValue: 'Send Quote' })}
                </Text>
            </Pressable>
        </View>
    );
}

function QuoteModal({
    lead,
    visible,
    onClose,
    onSubmit,
    isSubmitting,
}: {
    readonly lead: AvailableLead | null;
    readonly visible: boolean;
    readonly onClose: () => void;
    readonly onSubmit: (price: string, message: string) => void;
    readonly isSubmitting: boolean;
}): React.JSX.Element {
    const t = useT();
    const insets = useSafeAreaInsets();
    const [price, setPrice] = useState('');
    const [message, setMessage] = useState('');

    const isValid = price.trim().length > 0 && message.trim().length >= 10;

    const handleClose = (): void => {
        setPrice('');
        setMessage('');
        onClose();
    };

    return (
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
                        {t('leads.quote_modal_title', { defaultValue: 'Send Quote' })}
                    </Text>
                    <View style={{ width: 60 }} />
                </View>

                <View className="flex-1 p-5 gap-5">
                    {lead != null && (
                        <View className="bg-surfaceContainerLow rounded-xl p-4">
                            <Text className="text-xs text-onSurfaceVariant mb-1">
                                {t('leads.service_requested', { defaultValue: 'Service requested' })}
                            </Text>
                            <Text className="text-sm font-semibold text-onSurface">{lead.category.name}</Text>
                            <Text className="text-xs text-onSurfaceVariant mt-1" numberOfLines={2}>
                                {lead.description}
                            </Text>
                        </View>
                    )}

                    <View className="gap-2">
                        <Text className="text-sm font-semibold text-onSurface">
                            {t('leads.your_price', { defaultValue: 'Your Price *' })}
                        </Text>
                        <TextInput
                            className="bg-surfaceContainerLowest border border-outlineVariant rounded-xl p-4 text-base text-onSurface"
                            value={price}
                            onChangeText={(v) => setPrice(v.replace(/[^0-9]/g, ''))}
                            placeholder="0"
                            placeholderTextColor={Colors.onSurfaceVariant}
                            keyboardType="numeric"
                            returnKeyType="next"
                        />
                    </View>

                    <View className="gap-2">
                        <Text className="text-sm font-semibold text-onSurface">
                            {t('leads.your_message', { defaultValue: 'Message *' })}
                        </Text>
                        <TextInput
                            className="bg-surfaceContainerLowest border border-outlineVariant rounded-xl p-4 text-base text-onSurface"
                            value={message}
                            onChangeText={setMessage}
                            placeholder={t('leads.message_placeholder', { defaultValue: 'Describe your approach and experience...' })}
                            placeholderTextColor={Colors.onSurfaceVariant}
                            multiline
                            numberOfLines={5}
                            textAlignVertical="top"
                            style={{ minHeight: 110 }}
                            maxLength={500}
                        />
                        <Text className="text-xs text-onSurfaceVariant text-right">{message.length}/500</Text>
                    </View>
                </View>

                <View
                    className="px-5 pt-4 border-t border-outlineVariant"
                    style={{ paddingBottom: Math.max(insets.bottom, 20) }}
                >
                    <Pressable
                        className="bg-primary rounded-2xl h-14 justify-center items-center"
                        style={({ pressed }) => ({
                            opacity: pressed || isSubmitting || !isValid ? 0.65 : 1,
                        })}
                        onPress={() => onSubmit(price, message)}
                        disabled={isSubmitting || !isValid}
                        accessibilityRole="button"
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color={Colors.onPrimary} />
                        ) : (
                            <Text className="text-onPrimary text-[17px] font-bold">
                                {t('leads.submit_quote', { defaultValue: 'Submit Quote' })}
                            </Text>
                        )}
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

export default function LeadsScreen(): React.JSX.Element {
    const insets = useSafeAreaInsets();
    const t = useT();

    const [selectedLead, setSelectedLead] = useState<AvailableLead | null>(null);

    const { data: leads = [], isLoading, isError, refetch } = useAvailableLeads();
    const { mutate, isPending } = useSubmitQuote();

    return (
        <View className="flex-1 bg-surfaceContainerLowest">
            <View
                className="flex-row items-center gap-3 px-4 pb-3 border-b border-outlineVariant bg-surface"
                style={{ paddingTop: insets.top + 12 }}
            >
                <Pressable
                    className="w-10 h-10 justify-center items-center"
                    onPress={() => router.back()}
                    accessibilityRole="button"
                >
                    <Icon name="arrow-left" size={24} color={Colors.onSurface} />
                </Pressable>
                <Text className="flex-1 text-lg font-bold text-onSurface">
                    {t('leads.screen_title', { defaultValue: 'Available Jobs' })}
                </Text>
            </View>

            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : isError ? (
                <View className="flex-1 justify-center items-center px-8 gap-4">
                    <Text className="text-base text-onSurfaceVariant text-center">
                        {t('errors.load_failed', { defaultValue: 'Could not load jobs.' })}
                    </Text>
                    <Pressable className="bg-primary px-6 py-3 rounded-xl" onPress={() => void refetch()}>
                        <Text className="text-onPrimary font-semibold">
                            {t('actions.retry', { defaultValue: 'Retry' })}
                        </Text>
                    </Pressable>
                </View>
            ) : (
                <FlatList
                    data={leads as AvailableLead[]}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <View className="mb-2">
                            <Text className="text-[28px] font-extrabold text-onSurface tracking-[-0.5px]">
                                {t('leads.screen_title', { defaultValue: 'Available Jobs' })}
                            </Text>
                            <Text className="text-sm text-onSurfaceVariant mt-1">
                                {t('leads.screen_subtitle', { defaultValue: 'Clients looking for your services' })}
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <LeadCard lead={item} onQuote={setSelectedLead} />
                    )}
                    ListEmptyComponent={
                        <View className="items-center py-16 gap-3">
                            <Icon name="file-text" size={56} color={Colors.outlineVariant} />
                            <Text className="text-lg font-bold text-onSurface text-center">
                                {t('leads.empty_title', { defaultValue: 'No jobs available' })}
                            </Text>
                            <Text className="text-sm text-onSurfaceVariant text-center px-8">
                                {t('leads.empty_desc', { defaultValue: 'New job requests will appear here when clients post them.' })}
                            </Text>
                        </View>
                    }
                />
            )}

            <QuoteModal
                lead={selectedLead}
                visible={selectedLead != null}
                onClose={() => setSelectedLead(null)}
                onSubmit={(price, message) => {
                    if (selectedLead == null) return;
                    mutate(
                        { serviceRequestId: selectedLead.id, price: Number(price), message },
                        {
                            onSuccess: (result) => {
                                if (result.success) {
                                    setSelectedLead(null);
                                    Alert.alert(
                                        t('leads.quote_sent_title', { defaultValue: 'Quote Sent!' }),
                                        t('leads.quote_sent_body', { defaultValue: 'The client will be notified of your offer.' }),
                                    );
                                } else {
                                    Alert.alert(t('error', { defaultValue: 'Error' }), result.error ?? 'Error');
                                }
                            },
                            onError: () => {
                                Alert.alert(t('error', { defaultValue: 'Error' }), t('leads.quote_error', { defaultValue: 'Could not send quote.' }));
                            },
                        },
                    );
                }}
                isSubmitting={isPending}
            />
        </View>
    );
}
