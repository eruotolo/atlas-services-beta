import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';

import { useCountry } from '@/features/country/context/CountryContext';
import { getLocalities, getRegions, type GeoLocality, type GeoRegion } from '@/features/geo/actions/queries';
import { useT } from '@/features/i18n/context/LocaleContext';
import { Colors } from '@/shared/constants/colors';

export interface GeoFilters {
    readonly regionId: string | null;
    readonly regionCode: string | null;
    readonly localitySlug: string | null;
}

interface FilterSheetProps {
    readonly visible: boolean;
    readonly current: GeoFilters;
    readonly onApply: (filters: GeoFilters) => void;
    readonly onClose: () => void;
}

export function FilterSheet({ visible, current, onApply, onClose }: FilterSheetProps): React.JSX.Element {
    const t = useT();
    const insets = useSafeAreaInsets();
    const { countryCode } = useCountry();

    const [selectedRegion, setSelectedRegion] = useState<GeoRegion | null>(null);
    const [selectedLocality, setSelectedLocality] = useState<GeoLocality | null>(null);

    const { data: regions = [], isLoading: regionsLoading } = useQuery({
        queryKey: ['regions', countryCode],
        queryFn: () => getRegions(countryCode),
        enabled: visible,
    });

    const { data: localities = [], isLoading: localitiesLoading } = useQuery({
        queryKey: ['localities', selectedRegion?.id],
        queryFn: () => getLocalities(selectedRegion!.id),
        enabled: selectedRegion != null,
    });

    useEffect(() => {
        if (!visible) return;
        setSelectedRegion(null);
        setSelectedLocality(null);
    }, [visible]);

    const handleApply = (): void => {
        onApply({
            regionId: selectedRegion?.id ?? null,
            regionCode: selectedRegion?.code ?? null,
            localitySlug: selectedLocality?.slug ?? null,
        });
        onClose();
    };

    const handleClear = (): void => {
        setSelectedRegion(null);
        setSelectedLocality(null);
        onApply({ regionId: null, regionCode: null, localitySlug: null });
        onClose();
    };

    const hasFilters = current.regionId != null || current.localitySlug != null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View
                className="flex-1 bg-surface"
                style={{ paddingBottom: insets.bottom + 16 }}
            >
                {/* Header */}
                <View className="flex-row justify-between items-center px-5 pt-5 pb-4 border-b border-outlineVariant">
                    <Text className="text-lg font-bold text-onSurface">{t('geo.filter')}</Text>
                    <Pressable onPress={onClose} hitSlop={8}>
                        <Text className="text-lg text-onSurfaceVariant">✕</Text>
                    </Pressable>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5">
                    {/* Region section */}
                    <Text className="text-xs font-bold text-onSurfaceVariant tracking-[0.8px] uppercase mt-5 mb-[10px]">
                        {t('geo.select_region')}
                    </Text>
                    {regionsLoading ? (
                        <ActivityIndicator color={Colors.primary} className="my-4" />
                    ) : (
                        <View className="gap-2">
                            {regions.map((region) => (
                                <Pressable
                                    key={region.id}
                                    className={`px-4 py-3 rounded-[10px] border ${selectedRegion?.id === region.id ? 'bg-primaryContainer border-primaryContainer' : 'bg-surfaceContainerLow border-outlineVariant'}`}
                                    onPress={() => {
                                        setSelectedRegion(region);
                                        setSelectedLocality(null);
                                    }}
                                >
                                    <Text className={`text-[15px] ${selectedRegion?.id === region.id ? 'text-onPrimary font-semibold' : 'text-onSurface'}`}>
                                        {region.name}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    )}

                    {/* Locality section */}
                    {selectedRegion != null && (
                        <>
                            <Text className="text-xs font-bold text-onSurfaceVariant tracking-[0.8px] uppercase mt-5 mb-[10px]">
                                {t('geo.select_locality')}
                            </Text>
                            {localitiesLoading ? (
                                <ActivityIndicator color={Colors.primary} className="my-4" />
                            ) : (
                                <View className="gap-2">
                                    {localities.map((locality) => (
                                        <Pressable
                                            key={locality.id}
                                            className={`px-4 py-3 rounded-[10px] border ${selectedLocality?.id === locality.id ? 'bg-primaryContainer border-primaryContainer' : 'bg-surfaceContainerLow border-outlineVariant'}`}
                                            onPress={() => setSelectedLocality(locality)}
                                        >
                                            <Text className={`text-[15px] ${selectedLocality?.id === locality.id ? 'text-onPrimary font-semibold' : 'text-onSurface'}`}>
                                                {locality.name}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            )}
                        </>
                    )}
                </ScrollView>

                {/* Actions */}
                <View className="px-5 pt-4 gap-[10px]">
                    {hasFilters && (
                        <Pressable
                            className="border border-outlineVariant rounded-[14px] h-12 justify-center items-center"
                            onPress={handleClear}
                        >
                            <Text className="text-onSurfaceVariant text-[15px] font-semibold">{t('geo.clear_filters')}</Text>
                        </Pressable>
                    )}
                    <Pressable
                        className="bg-primary rounded-[14px] h-[52px] justify-center items-center"
                        onPress={handleApply}
                    >
                        <Text className="text-onPrimary text-base font-bold">{t('geo.apply_filters')}</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}
