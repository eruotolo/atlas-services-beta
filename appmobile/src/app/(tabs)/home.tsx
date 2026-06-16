import { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';

import { Colors } from '@/shared/constants/colors';
import { Icon } from '@/shared/components/Icon';
import { useGeolocation } from '@/features/geo/hooks/useGeolocation';
import { SearchBar } from '@/shared/components/SearchBar';
import { CategoryGrid } from '@/features/home/components/CategoryGrid';
import { FeaturedCarousel } from '@/features/home/components/FeaturedCarousel';
import { ActiveBookingBanner } from '@/features/home/components/ActiveBookingBanner';
import { ChatIA } from '@/features/chatbot/components/ChatIA';
import { CountrySelectorSheet } from '@/features/country/components/CountrySelectorSheet';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useAuthGate } from '@/features/auth/hooks/useAuthGate';
import { useT } from '@/features/i18n/context/LocaleContext';
import { useCountry } from '@/features/country/context/CountryContext';
import { getCategories, getServices } from '@/features/services/actions/queries';
import { getUnreadCount } from '@/features/messages/actions/queries';
import { getServiceRequests } from '@/features/bookings/actions/queries';
import { getCategorySymbol } from '@/features/categories/lib/categorySymbols';
import { formatCurrency } from '@/shared/lib/formatCurrency';
import type { Category, FeaturedService } from '@/features/home/types';
import type { ServiceListItem } from '@/features/services/types';

const MORE_CATEGORY: Category = {
    id: 'more',
    name: 'More',
    symbol: 'ellipsis',
    fallback: '···',
    iconName: 'grid',
};

const TOP_BAR_HEIGHT = 52;

function mapServiceToFeatured(item: ServiceListItem, symbol: string, locale: string): FeaturedService {
    return {
        id: item.slug,
        title: item.title,
        price: formatCurrency(item.price, symbol, locale),
        rating: item.rating,
        reviewCount: item.reviewsCount,
        imageUrl: item.imagenPrincipal ?? '',
        providerName: item.user.name,
    };
}

export default function HomeScreen(): React.JSX.Element {
    const t = useT();
    const insets = useSafeAreaInsets();
    const { user, isAuthenticated } = useAuth();
    const requireAuth = useAuthGate();
    const { country, countryCode } = useCountry();

    const [search, setSearch] = useState('');
    const [selectorVisible, setSelectorVisible] = useState(false);

    const { data: apiCategories = [] } = useQuery({
        queryKey: ['categories', countryCode],
        queryFn: () => getCategories(countryCode),
    });

    const { data: featuredData } = useQuery({
        queryKey: ['featured', countryCode],
        queryFn: () => getServices({ destacado: true, countryCode, limit: 10 }),
    });

    const { data: unreadCount = 0 } = useQuery({
        queryKey: ['unread-count'],
        queryFn: getUnreadCount,
        enabled: isAuthenticated,
        staleTime: 60_000,
    });

    const { data: inProgressRequests } = useQuery({
        queryKey: ['service-requests-progress'],
        queryFn: getServiceRequests,
        enabled: isAuthenticated,
        select: (data) => data.filter((r) => r.status === 'IN_PROGRESS'),
    });

    const categories: readonly Category[] = [
        ...apiCategories.map((cat) => {
            const sym = getCategorySymbol(cat.slug);
            return {
                id: cat.slug,
                name: cat.name,
                symbol: sym.symbol,
                fallback: sym.fallback,
                iconName: sym.iconName,
            };
        }),
        MORE_CATEGORY,
    ];

    const featuredServices: readonly FeaturedService[] = (featuredData?.services ?? []).map((item) =>
        mapServiceToFeatured(item, country.currencySymbol, country.locale),
    );

    const salutation = (() => {
        const h = new Date().getHours();
        if (h < 12) return t('home.salutation_morning');
        if (h < 18) return t('home.salutation_afternoon');
        return t('home.salutation_evening');
    })();

    const greeting = isAuthenticated && user != null
        ? t('home.greeting_user', { salutation, name: user.name.split(' ')[0] })
        : t('home.greeting_guest', { salutation });

    const activeBooking = inProgressRequests?.[0];

    const handleSearch = (): void => {
        if (search.trim().length > 0) {
            router.push(`/(tabs)/services?q=${encodeURIComponent(search.trim())}`);
        }
    };

    return (
        <View className="flex-1 bg-surface">
            {/* Fixed top bar */}
            <View
                className="absolute top-0 left-0 right-0 z-10 flex-row justify-between items-center px-5 pb-3 bg-surface border-b border-outlineVariant"
                style={{ paddingTop: insets.top + 8 }}
            >
                <Image
                    source={require('@/assets/images/logo.png')}
                    style={{ width: 110, height: 30 }}
                    resizeMode="contain"
                />
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

            {/* Scrollable content */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerClassName="gap-6"
                style={{ paddingTop: TOP_BAR_HEIGHT + insets.top + 8, paddingBottom: 32 }}
            >
                {/* Greeting */}
                <View className="px-5 gap-[10px] pt-4">
                    <Text className="text-[26px] font-bold text-primary tracking-[-0.26px] leading-8">
                        {greeting}
                    </Text>
                    <LocationPill onPress={() => setSelectorVisible(true)} />
                </View>

                {/* Search */}
                <View className="px-5">
                    <SearchBar
                        value={search}
                        onChangeText={setSearch}
                        onFilter={() => router.push('/(tabs)/services')}
                        placeholder={t('home.search_placeholder')}
                        onSubmitEditing={handleSearch}
                    />
                </View>

                {/* Categories */}
                <View className="gap-[14px]">
                    {categories.length > 1 ? (
                        <CategoryGrid
                            categories={categories}
                            onSelect={(id) => {
                                if (id === 'more') {
                                    router.push('/(tabs)/services');
                                } else {
                                    router.push(`/(tabs)/services?category=${encodeURIComponent(id)}`);
                                }
                            }}
                        />
                    ) : (
                        <ActivityIndicator style={{ margin: 20 }} color={Colors.primary} />
                    )}
                </View>

                {/* Featured services */}
                {featuredServices.length > 0 && (
                    <View className="gap-[14px]">
                        <FeaturedCarousel
                            services={featuredServices}
                            onBook={(slug) => requireAuth('book', () => router.push(`/service/${slug}`))}
                            onSeeAll={() => router.push('/(tabs)/services')}
                        />
                    </View>
                )}
            </ScrollView>

            {/* Active booking banner */}
            {isAuthenticated && activeBooking != null && (
                <View className="absolute left-4 right-4" style={{ bottom: 12 }}>
                    <ActiveBookingBanner
                        booking={{
                            id: activeBooking.id,
                            serviceType: activeBooking.service.title,
                            providerName: activeBooking.service.user.name,
                            status: 'in_progress',
                        }}
                    />
                </View>
            )}

            <ChatIA bottomOffset={isAuthenticated && activeBooking != null ? 88 : 16} />

            <CountrySelectorSheet
                visible={selectorVisible}
                onClose={() => setSelectorVisible(false)}
            />
        </View>
    );
}

function LocationPill({ onPress }: { readonly onPress: () => void }): React.JSX.Element {
    const { country } = useCountry();
    const { cityName, isLocating } = useGeolocation();

    const label = isLocating
        ? 'Localizando...'
        : cityName != null
            ? `${cityName}, ${country.name}`
            : country.name;

    return (
        <Pressable
            className="flex-row items-center self-start bg-surfaceContainerLow rounded-[20px] px-3 py-1.5 gap-1.5"
            style={({ pressed }) => pressed ? { opacity: 0.75 } : undefined}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel="Change location"
        >
            <Icon
                name="location"
                size={14}
                color={isLocating ? Colors.onSurfaceVariant : Colors.primary}
            />
            <Text className="text-[13px] font-medium text-onSurface">{label}</Text>
            {!isLocating && <Icon name="chevron-down" size={13} color={Colors.onSurfaceVariant} />}
        </Pressable>
    );
}
