'use client';

import { useState, type ChangeEvent, type ReactElement, type ReactNode } from 'react';

import type { Dictionary } from '@/lib/i18n/types';
import { Icon, Mono } from '@/shared/components/hireeo';
import type { CategoriaServicio } from '@/shared/types/common';

import type {
    AvailabilityFilter,
    RatingFilter,
    VerificationFilter,
} from './types';

export interface ActiveChip {
    key: string;
    label: string;
    onRemove: () => void;
}

interface FiltersSidebarProps {
    dict: Dictionary;
    categories: CategoriaServicio[];
    selectedCategories: string[];
    onCategoryToggle: (categoryId: string) => void;
    availability: AvailabilityFilter;
    onAvailabilityChange: (a: AvailabilityFilter) => void;
    rating: RatingFilter;
    onRatingChange: (r: RatingFilter) => void;
    verification: VerificationFilter;
    onVerificationChange: (v: VerificationFilter) => void;
    priceMin: number | null;
    priceMax: number | null;
    onPriceMinChange: (n: number | null) => void;
    onPriceMaxChange: (n: number | null) => void;
    onClearAll: () => void;
    activeChips?: readonly ActiveChip[];
}

const INITIAL_CATEGORIES_LIMIT = 12;

interface FilterItemProps {
    label: string;
    count?: string;
    active: boolean;
    onClick: () => void;
}

function FilterItem({ label, count, active, onClick }: FilterItemProps): ReactElement {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full cursor-pointer items-center justify-between rounded-[5px] px-2 py-1.5 text-left transition-colors"
            style={{
                background: active ? 'var(--tint)' : 'transparent',
            }}
        >
            <span className="flex items-center gap-2">
                <span
                    className="inline-flex h-[13px] w-[13px] items-center justify-center rounded-[3px] border"
                    style={{
                        borderColor: active ? 'var(--ink)' : 'var(--line)',
                        background: active ? 'var(--ink)' : 'var(--bg)',
                        borderWidth: 1.5,
                    }}
                >
                    {active ? <Icon name="check" size={9} stroke="var(--bg)" strokeWidth={3} /> : null}
                </span>
                <span
                    className="text-[12.5px]"
                    style={{
                        color: active ? 'var(--ink)' : 'var(--sub)',
                        fontWeight: active ? 500 : 400,
                    }}
                >
                    {label}
                </span>
            </span>
            {count ? (
                <Mono className="text-[10.5px]" style={{ color: 'var(--muted)' }}>
                    {count}
                </Mono>
            ) : null}
        </button>
    );
}

interface FilterGroupProps {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
}

function FilterGroup({ title, children, defaultOpen = true }: FilterGroupProps): ReactElement {
    const [open, setOpen] = useState<boolean>(defaultOpen);
    return (
        <div className="mb-5">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="mb-2 flex w-full cursor-pointer items-center justify-between"
            >
                <span
                    className="text-[12.5px] font-semibold"
                    style={{ color: 'var(--ink)' }}
                >
                    {title}
                </span>
                <Icon
                    name={open ? 'chevronUp' : 'chevronDown'}
                    size={12}
                    stroke="var(--sub)"
                />
            </button>
            {open ? <div className="flex flex-col gap-0.5">{children}</div> : null}
        </div>
    );
}

function PriceGroup({
    dict,
    priceMin,
    priceMax,
    onMinChange,
    onMaxChange,
}: {
    dict: Dictionary;
    priceMin: number | null;
    priceMax: number | null;
    onMinChange: (n: number | null) => void;
    onMaxChange: (n: number | null) => void;
}): ReactElement {
    function parseNumber(e: ChangeEvent<HTMLInputElement>): number | null {
        const raw = e.target.value.replace(/[^\d]/g, '');
        return raw === '' ? null : Number(raw);
    }

    return (
        <FilterGroup title={dict.search.groupPrice}>
            <div className="flex items-center gap-1.5">
                <div
                    className="relative flex flex-1 items-center rounded-md border bg-bg"
                    style={{ borderColor: 'var(--line)' }}
                >
                    <input
                        inputMode="numeric"
                        value={priceMin ?? ''}
                        onChange={(e) => onMinChange(parseNumber(e))}
                        placeholder="0"
                        className="w-full bg-transparent px-2.5 py-1.5 text-[12.5px] outline-none"
                        style={{ color: 'var(--ink)' }}
                    />
                    <span
                        className="pr-2 text-[10.5px]"
                        style={{ color: 'var(--muted)' }}
                    >
                        {dict.search.priceMin}
                    </span>
                </div>
                <span style={{ color: 'var(--muted)' }}>—</span>
                <div
                    className="relative flex flex-1 items-center rounded-md border bg-bg"
                    style={{ borderColor: 'var(--line)' }}
                >
                    <input
                        inputMode="numeric"
                        value={priceMax ?? ''}
                        onChange={(e) => onMaxChange(parseNumber(e))}
                        placeholder="—"
                        className="w-full bg-transparent px-2.5 py-1.5 text-[12.5px] outline-none"
                        style={{ color: 'var(--ink)' }}
                    />
                    <span
                        className="pr-2 text-[10.5px]"
                        style={{ color: 'var(--muted)' }}
                    >
                        {dict.search.priceMax}
                    </span>
                </div>
            </div>
        </FilterGroup>
    );
}

export function FiltersSidebar({
    dict,
    categories,
    selectedCategories,
    onCategoryToggle,
    availability,
    onAvailabilityChange,
    rating,
    onRatingChange,
    verification,
    onVerificationChange,
    priceMin,
    priceMax,
    onPriceMinChange,
    onPriceMaxChange,
    onClearAll,
    activeChips,
}: FiltersSidebarProps): ReactElement {
    const [showAllCategories, setShowAllCategories] = useState<boolean>(false);
    const visibleCategories = showAllCategories
        ? categories
        : categories.slice(0, INITIAL_CATEGORIES_LIMIT);
    const hasMore = categories.length > INITIAL_CATEGORIES_LIMIT;

    const allActive = selectedCategories.includes('Todos') || selectedCategories.length === 0;

    return (
        <div className="sticky top-20">
            <div className="mb-3 flex items-center justify-between">
                <Mono
                    className="text-[11px] font-semibold"
                    style={{ color: 'var(--ink)', letterSpacing: '0.08em' }}
                >
                    {dict.search.filters.toUpperCase()}
                </Mono>
                <button
                    type="button"
                    onClick={onClearAll}
                    className="cursor-pointer text-[11px] font-semibold transition-opacity hover:opacity-80"
                    style={{ color: 'var(--accent)' }}
                >
                    {dict.search.clearFilters}
                </button>
            </div>

            {activeChips && activeChips.length > 0 ? (
                <div className="mb-5 flex flex-wrap gap-1">
                    {activeChips.map((chip) => (
                        <button
                            key={chip.key}
                            type="button"
                            onClick={chip.onRemove}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-[3px] text-[10.5px] font-medium transition-opacity hover:opacity-80"
                            style={{ background: 'var(--ink)', color: 'var(--bg)' }}
                        >
                            {chip.label}
                            <Icon name="x" size={8} stroke="var(--bg)" strokeWidth={2.5} />
                        </button>
                    ))}
                </div>
            ) : null}

            <FilterGroup title={dict.search.category}>
                <FilterItem
                    label={dict.search.all}
                    count="—"
                    active={allActive}
                    onClick={() => onCategoryToggle('Todos')}
                />
                {visibleCategories.map((cat) => (
                    <FilterItem
                        key={cat.id}
                        label={cat.nombre}
                        count={
                            typeof cat.serviceCount === 'number'
                                ? cat.serviceCount.toString()
                                : undefined
                        }
                        active={
                            selectedCategories.includes(cat.id) ||
                            selectedCategories.includes(cat.nombre)
                        }
                        onClick={() => onCategoryToggle(cat.nombre)}
                    />
                ))}
                {hasMore ? (
                    <button
                        type="button"
                        onClick={() => setShowAllCategories((v) => !v)}
                        className="mt-2 rounded-md border px-2 py-1.5 text-[11.5px] font-semibold transition-colors hover:bg-tint"
                        style={{
                            borderColor: 'var(--line)',
                            color: 'var(--sub)',
                        }}
                    >
                        {showAllCategories
                            ? dict.search.viewLessCategories
                            : `${dict.search.viewAllCategories} (+${categories.length - INITIAL_CATEGORIES_LIMIT})`}
                    </button>
                ) : null}
            </FilterGroup>

            <FilterGroup title={dict.search.groupAvailability}>
                <FilterItem
                    label={dict.search.ratingAny}
                    active={availability === 'any'}
                    onClick={() => onAvailabilityChange('any')}
                />
                <FilterItem
                    label={dict.search.availabilityToday}
                    active={availability === 'today'}
                    onClick={() => onAvailabilityChange('today')}
                />
                <FilterItem
                    label={dict.search.availabilityTomorrow}
                    active={availability === 'tomorrow'}
                    onClick={() => onAvailabilityChange('tomorrow')}
                />
                <FilterItem
                    label={dict.search.availabilityThisWeek}
                    active={availability === 'thisWeek'}
                    onClick={() => onAvailabilityChange('thisWeek')}
                />
                <FilterItem
                    label={dict.search.availabilityTwoWeeks}
                    active={availability === 'twoWeeks'}
                    onClick={() => onAvailabilityChange('twoWeeks')}
                />
            </FilterGroup>

            <FilterGroup title={dict.search.groupRating}>
                <FilterItem
                    label={dict.search.ratingAny}
                    active={rating === 'any'}
                    onClick={() => onRatingChange('any')}
                />
                <FilterItem
                    label={dict.search.rating45}
                    active={rating === 'r45'}
                    onClick={() => onRatingChange('r45')}
                />
                <FilterItem
                    label={dict.search.rating40}
                    active={rating === 'r40'}
                    onClick={() => onRatingChange('r40')}
                />
                <FilterItem
                    label={dict.search.rating35}
                    active={rating === 'r35'}
                    onClick={() => onRatingChange('r35')}
                />
            </FilterGroup>

            <FilterGroup title={dict.search.groupVerification}>
                <FilterItem
                    label={dict.search.verifAny}
                    active={verification === 'any'}
                    onClick={() => onVerificationChange('any')}
                />
                <FilterItem
                    label={dict.search.verifVerified}
                    active={verification === 'verified'}
                    onClick={() => onVerificationChange('verified')}
                />
                <FilterItem
                    label={dict.search.verifPro}
                    active={verification === 'pro'}
                    onClick={() => onVerificationChange('pro')}
                />
                <FilterItem
                    label={dict.search.verifTop}
                    active={verification === 'top'}
                    onClick={() => onVerificationChange('top')}
                />
            </FilterGroup>

            <PriceGroup
                dict={dict}
                priceMin={priceMin}
                priceMax={priceMax}
                onMinChange={onPriceMinChange}
                onMaxChange={onPriceMaxChange}
            />
        </div>
    );
}
