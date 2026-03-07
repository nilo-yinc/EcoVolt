import { cn } from "../../lib/utils";

export function BackgroundBeams({ className }) {
    return (
        <div className={cn("absolute inset-0 overflow-hidden pointer-events-none z-0", className)}>
            <svg
                className="absolute w-full h-full opacity-[0.03]"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(14,165,233,0.3)" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            {/* Scanning line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-scan" />
            {/* Corner brackets */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-cyan-500/20" />
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-cyan-500/20" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-cyan-500/20" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-cyan-500/20" />
        </div>
    );
}
