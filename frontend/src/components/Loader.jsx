/** Animated loading spinner with EcoVolt branding. */
export default function Loader({ text = 'Loading...' }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            {/* Spinning ring */}
            <div className="relative w-12 h-12 mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-surface-700/40" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-500 animate-spin" />
            </div>
            <p className="text-sm text-surface-400">{text}</p>
        </div>
    );
}
