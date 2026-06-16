import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';

import { Colors } from '@/shared/constants/colors';
import { Icon } from '@/shared/components/Icon';
import { SearchBar } from '@/shared/components/SearchBar';
import { CategoryChips } from '@/features/services/components/CategoryChips';
import { ServiceProviderCard } from '@/features/services/components/ServiceProviderCard';
import { FilterSheet, type GeoFilters } from '@/features/geo/components/FilterSheet';
import { useAuthGate } from '@/features/auth/hooks/useAuthGate';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useT } from '@/features/i18n/context/LocaleContext';
import { useCountry } from '@/features/country/context/CountryContext';
import { getCategories, getServices } from '@/features/services/actions/queries';
import { addFavorite, removeFavorite } from '@/features/favorites/actions/mutations';
import { getFavoriteIds } from '@/features/favorites/actions/queries';
import { getUnreadCount } from '@/features/messages/actions/queries';
import { getCategorySymbol } from '@/features/categories/lib/categorySymbols';
import type { ServiceCategory, ServiceProvider } from '@/features/services/types';

const TOP_BAR_HEIGHT = 52;
const PAGE_SIZE = 20;

const ALL_CATEGORY: ServiceCategory = { id: 'all', label: 'All Services', icon: 'grid' };

export default function ServicesScreen(): React.JSX.Element {
    const t = useT();
    const insets = useSafeAreaInsets();
    const requireAuth = useAuthGate();
    const { isAuthenticated } = useAuth();
    const { countryCode } = useCountry();

    const { category: paramCategory, q: paramQuery } = useLocalSearchParams<{ category?: string; q?: string }>();

    const [search, setSearch] = useState(paramQuery ?? '');
    const [selectedCategory, setSelectedCategory] = useState(paramCategory ?? 'all');
    const [filterVisible, setFilterVisible] = useState(false);
    const [geoFilters, setGeoFilters] = useState<GeoFilters>({
        regionId: null,
        regionCode: null,
        localitySlug: null,
    });

    const [favorites, setFavorites] = useState<ReadonlySet<string>>(new Set());

    const { data: unreadCount = 0 } = useQuery({
        queryKey: ['unread-count'],
        queryFn: getUnreadCount,
        enabled: isAuthenticated,
        staleTime: 60_000,
    });

    const { data: serverFavoriteIds } = useQuery({
        queryKey: ['favorite-ids'],
        queryFn: getFavoriteIds,
        enabled: isAuthenticated,
        staleTime: 5 * 60_000,
    });

    useEffect(() => {
        if (serverFavoriteIds) setFavorites(serverFavoriteIds);
    }, [serverFavoriteIds]);

    const { data: apiCategories = [] } = useQuery({
        queryKey: ['categories', countryCode],
        queryFn: () => getCategories(countryCode),
    });

    const categories: readonly ServiceCategory[] = useMemo(() => [
        { ...ALL_CATEGORY, label: t('categories.all') },
        ...apiCategories.map((cat) => {
            const sym = getCategorySymbol(cat.slug);
            return { id: cat.slug, label: cat.name, icon: sym.iconName };
        }),
    ], [apiCategories, t]);

    const queryParams = useMemo(() => ({
        countryCode,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        query: search.trim() || undefined,
        limit: PAGE_SIZE,
        regionCode: geoFilters.regionCode ?? undefined,
        localitySlug: geoFilters.localitySlug ?? undefined,
    }), [countryCode, selectedCategory, search, geoFilters]);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
    } = useInfiniteQuery({
        queryKey: ['services', queryParams],
        queryFn: ({ pageParam }) =>
            getServices({ ...queryParams, page: pageParam as number }),
        initialPageParam: 1,
        getNextPageParam: (lastPage, pages) => {
            const loaded = pages.reduce((acc, p) => acc + p.services.length, 0);
            return loaded < lastPage.total ? pages.length + 1 : undefined;
        },
    });

    const providers: readonly ServiceProvider[] = useMemo(
        () =>
            (data?.pages ?? []).flatMap((page) =>
                page.services.map((item) => ({
                    id: item.slug,
                    name: item.user.name,
                    role: item.title,
                    rating: item.rating,
                    reviewCount: item.reviewsCount,
                    pricePerHour: item.price,
                    imageUrl: item.imagenPrincipal ?? '',
                    isTopRated: item.nivel === 'FEATURED',
                })),
            ),
        [data],
    );

    const { mutate: mutateFavorite } = useMutation({
        mutationFn: async ({ id, add }: { id: string; add: boolean }) => {
            if (add) await addFavorite(id);
            else await removeFavorite(id);
        },
        onError: (_err, { id, add }) => {
            setFavorites((prev) => {
                const next = new Set(prev);
                if (add) next.delete(id);
                else next.add(id);
                return next;
            });
        },
    });

    const toggleFavorite = useCallback((id: string): void => {
        if (!isAuthenticated) {
            requireAuth('book', () => toggleFavorite(id));
            return;
        }
        const adding = !favorites.has(id);
        setFavorites((prev) => {
            const next = new Set(prev);
            if (adding) next.add(id);
            else next.delete(id);
            return next;
        });
        mutateFavorite({ id, add: adding });
    }, [favorites, isAuthenticated, requireAuth, mutateFavorite]);

    const handleEndReached = (): void => {
        if (hasNextPage && !isFetchingNextPage) {
            void fetchNextPage();
        }
    };

    const hasGeoFilters = geoFilters.regionId != null;

    return (
        <View className="flex-1 bg-surface">
            {/* Fixed top bar */}
            <View
                className="absolute top-0 left-0 right-0 z-10 flex-row justify-between items-center px-5 pb-3 bg-surface border-b border-outlineVariant"
                style={{ paddingTop: insets.top + 8 }}
            >
                <View className="w-10 items-center">
                    <Pressable
                        className="w-10 h-10 justify-center items-center rounded-full"
                        style={({ pressed }) => pressed ? { opacity: 0.7 } : undefined}
                        accessibilityLabel="Location"
                        accessibilityRole="button"
                    >
                        <Icon name="location" size={22} color={Colors.primary} />
                    </Pressable>
                </View>

                <Image
                    source={require('@/assets/images/logo.png')}
                    style={{ width: 110, height: 30 }}
                    resizeMode="contain"
                />

                <View className="w-10 items-center">
                    <Pressable
                        className="w-10 h-10 justify-center items-center"
                        style={({ pressed }) => pressed ? { opacity: 0.7 } : undefined}
                        onPress={() => router.push('/notifications' as any)}
                        accessibilityLabel="Notifications"
                        accessibilityRole="button"
                    >
                        <Icon name="bell" size={22} color={Colors.primary} />
                        {unreadCount > 0 && (
                            <View
                                className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error"
                                style={{ borderWidth: 1.5, borderColor: Colors.surface }}
                            />
                        )}
                    </Pressable>
                </View>
            </View>

            <FlatList
                data={providers}
                keyExtractor={(item) => item.id}
                numColumns={1}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingTop: TOP_BAR_HEIGHT + insets.top + 8,
                    paddingBottom: 32,
                }}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                ListHeaderComponent={
                    <View className="gap-5 pb-2">
                        <View className="px-5 gap-1">
                            <Text className="text-[26px] font-bold text-primary tracking-[-0.26px] leading-8">
                                {t('services.headline')}
                            </Text>
                            <Text className="text-base text-onSurfaceVariant leading-6">
                                {t('services.subline')}
                                {hasGeoFilters && (
                                    <Text className="text-primary font-semibold"> · {t('geo.filter')} ✓</Text>
                                )}
                            </Text>
                        </View>

                        <View className="px-5">
                            <SearchBar
                                value={search}
                                onChangeText={setSearch}
                                placeholder={t('home.search_placeholder')}
                                onFilter={() => setFilterVisible(true)}
                            />
                        </View>

                        <CategoryChips
                            categories={categories}
                            selectedId={selectedCategory}
                            onSelect={setSelectedCategory}
                        />
                    </View>
                }
                renderItem={({ item }) => (
                    <View className="px-5 mb-4">
                        <ServiceProviderCard
                            provider={item}
                            isFavorite={favorites.has(item.id)}
                            onPress={(id) => router.push(`/service/${id}`)}
                            onBook={(id) => requireAuth('book', () => router.push(`/service/${id}`))}
                            onToggleFavorite={toggleFavorite}
                        />
                    </View>
                )}
                ListFooterComponent={
                    isFetchingNextPage ? (
                        <ActivityIndicator color={Colors.primary} style={{ marginVertical: 20 }} />
                    ) : null
                }
                ListEmptyComponent={
                    isLoading ? (
                        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
                    ) : isError ? (
                        <View className="items-center py-12">
                            <Text className="text-[15px] text-onSurfaceVariant">
                                {t('services.error')}
                            </Text>
                        </View>
                    ) : (
                        <View className="items-center py-12">
                            <Text className="text-[15px] text-onSurfaceVariant">{t('services.empty')}</Text>
                        </View>
                    )
                }
            />

            <FilterSheet
                visible={filterVisible}
                current={geoFilters}
                onApply={(filters) => { setGeoFilters(filters); }}
                onClose={() => setFilterVisible(false)}
            />
        </View>
    );
}
