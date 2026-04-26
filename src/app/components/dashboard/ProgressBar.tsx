type ProgressBarProps = {
    value: number;
    colorClass?: string;
    trackClass?: string;
    heightClass?: string;
};

function ProgressBar({
    value,
    colorClass = "bg-yellow-400",
    trackClass = "bg-white/75",
    heightClass = "h-[5px]",
}: ProgressBarProps) {
    const safeValue = Math.max(0, Math.min(100, value));

    return (
        <div
            className={`w-full overflow-hidden rounded-full ${trackClass} ${heightClass}`}
        >
            <div
                className={`h-full rounded-full ${colorClass}`}
                style={{ width: `${safeValue}%` }}
            />
        </div>
    );
}

export default ProgressBar;