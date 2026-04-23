function SkeletonBlock({
    className = "",
}: {
    className?: string;
}) {
    return <div className={`animate-pulse rounded-[10px] bg-[#D7D9DD] ${className}`} />;
}

function DashboardSkeleton() {
    return (
        <section className="min-h-full bg-[#EFEFEF] px-5 py-6 text-[#1F2933] md:px-7 lg:px-8">
            <div className="mx-auto max-w-[1360px]">
                <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <SkeletonBlock className="h-9 w-[190px] rounded-[8px]" />
                        <SkeletonBlock className="mt-3 h-4 w-[240px] rounded-[6px]" />
                    </div>

                    <SkeletonBlock className="h-8 w-[96px] rounded-full" />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={`summary-${index}`}
                            className="rounded-[14px] border-t-[3px] border-[#C8CCD2] bg-[#E2E4E7] px-5 pb-5 pt-4"
                        >
                            <div className="mb-7 flex items-start justify-between gap-4">
                                <SkeletonBlock className="h-3 w-[72px]" />
                                <SkeletonBlock className="h-9 w-9 rounded-[8px]" />
                            </div>

                            <div className="flex items-end gap-2">
                                <SkeletonBlock className="h-9 w-[110px]" />
                                <SkeletonBlock className="h-4 w-[48px]" />
                            </div>

                            <SkeletonBlock className="mt-4 h-3 w-[96px]" />
                        </div>
                    ))}
                </div>

                <div className="mt-8">
                    <div className="mb-5">
                        <SkeletonBlock className="h-7 w-[170px]" />
                        <SkeletonBlock className="mt-2 h-4 w-[170px]" />
                    </div>

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        {Array.from({ length: 2 }).map((_, index) => (
                            <div
                                key={`service-${index}`}
                                className="min-h-[190px] rounded-[18px] bg-[#E2E4E7] p-6"
                            >
                                <SkeletonBlock className="mb-6 h-11 w-11 rounded-[10px]" />
                                <SkeletonBlock className="h-7 w-[140px]" />
                                <SkeletonBlock className="mt-3 h-4 w-[160px]" />
                                <SkeletonBlock className="mt-1 h-4 w-[130px]" />

                                <div className="mt-8 flex items-end justify-between gap-4">
                                    <SkeletonBlock className="h-9 w-[110px]" />
                                    <SkeletonBlock className="h-4 w-[32px]" />
                                </div>

                                <SkeletonBlock className="mt-4 h-[5px] w-full rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8">
                    <div className="mb-5">
                        <SkeletonBlock className="h-7 w-[250px]" />
                        <SkeletonBlock className="mt-2 h-4 w-[250px]" />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={`channel-${index}`}
                                className="min-h-[160px] rounded-[18px] bg-[#E2E4E7] p-5"
                            >
                                <SkeletonBlock className="mb-6 h-11 w-11 rounded-[10px]" />
                                <SkeletonBlock className="h-6 w-[90px]" />
                                <SkeletonBlock className="mt-3 h-4 w-[120px]" />
                                <SkeletonBlock className="mt-1 h-4 w-[80px]" />

                                <div className="mt-8 flex items-end justify-between gap-4">
                                    <SkeletonBlock className="h-8 w-[90px]" />
                                    <SkeletonBlock className="h-4 w-[28px]" />
                                </div>

                                <SkeletonBlock className="mt-4 h-[5px] w-full rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default DashboardSkeleton;