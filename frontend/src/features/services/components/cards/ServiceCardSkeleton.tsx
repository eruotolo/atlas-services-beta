export default function ServiceCardSkeleton() {
    return (
        <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/50">
            {/* Image skeleton */}
            <div className="skeleton h-48 w-full" />

            <div className="flex flex-grow flex-col p-5">
                {/* Category + Rating */}
                <div className="mb-2 flex items-center justify-between">
                    <div className="skeleton h-3 w-20" />
                    <div className="skeleton h-3 w-14" />
                </div>

                {/* Title */}
                <div className="skeleton mb-2 h-5 w-3/4" />

                {/* Description */}
                <div className="skeleton mb-1 h-3 w-full" />
                <div className="skeleton mb-4 h-3 w-2/3" />

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4 dark:border-gray-800">
                    <div className="skeleton h-3 w-16" />
                    <div className="skeleton h-5 w-20" />
                </div>
            </div>
        </div>
    );
}
