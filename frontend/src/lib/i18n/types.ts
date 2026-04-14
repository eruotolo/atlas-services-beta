export interface Dictionary {
    nav: {
        search: string;
        publish: string;
        login: string;
        adminPanel: string;
        memberPro: string;
        searchMobile: string;
    };
    home: {
        heroTitle: string;
        heroSubtitle: string;
        searchPlaceholder: string;
        searchButton: string;
        popularLabel: string;
        popularItems: string;
        featuredLabel: string;
        featuredTitle: string;
        viewAll: string;
        adSpaceTitle: string;
        adSpaceSubtitle: string;
        learnMore: string;
        proCtaTag: string;
        proCtaTitle: string;
        proCtaDescription: string;
        proCtaButton: string;
        communityAdsTitle: string;
        contactCta: string;
        heroAllCountry: string;
        heroAriaRegion: string;
    };
    search: {
        pageTitle: string;
        filters: string;
        clearFilters: string;
        clearAllFilters: string;
        category: string;
        all: string;
        region: string;
        allRegions: string;
        city: string;
        allCities: string;
        placeholder: string;
        searchButton: string;
        results: string;
        noResults: string;
        noResultsHint: string;
        viewLessCategories: string;
        viewAllCategories: string;
    };
    service: {
        featured: string;
        from: string;
        requestQuote: string;
    };
    publish: {
        step: string;
        steps: {
            yourData: string;
            yourTrade: string;
            level: string;
            duration: string;
            payment: string;
            success: string;
        };
        basicLevel: string;
        alwaysFree: string;
        premiumLevel: string;
        recommended: string;
        moreClients: string;
        normalListing: string;
        directContact: string;
        featuredListing: string;
        proSeal: string;
        prioritySearch: string;
        publishFree: string;
        continuePremium: string;
        changeLevelAnytime: string;
    };
    footer: {
        tagline: string;
        platform: string;
        aboutUs: string;
        howItWorks: string;
        publishService: string;
        proSubscriptions: string;
        support: string;
        helpCenter: string;
        terms: string;
        privacy: string;
        contact: string;
        proCalloutTitle: string;
        proCalloutDesc: string;
        proCalloutCta: string;
        rights: string;
        madeWith: string;
        changeCountry: string;
    };
    common: {
        loading: string;
        error: string;
        save: string;
        cancel: string;
        back: string;
        next: string;
        close: string;
    };
}

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
