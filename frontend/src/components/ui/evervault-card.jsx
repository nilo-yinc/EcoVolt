import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export function EvervaultCard({ text = "hover", className }) {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const ref = useRef(null);

    const handleMouse = useCallback((e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }, []);

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789⚡🔋💡";
    const [randomString, setRandomString] = useState("");

    useEffect(() => {
        if (!isHovered) return;
        const interval = setInterval(() => {
            let str = "";
            for (let i = 0; i < 1500; i++) {
                str += chars[Math.floor(Math.random() * chars.length)];
            }
            setRandomString(str);
        }, 50);
        return () => clearInterval(interval);
    }, [isHovered]);

    return (
        <div
            ref={ref}
            onMouseMove={handleMouse}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                "relative flex items-center justify-center overflow-hidden rounded-3xl bg-transparent p-0.5",
                className
            )}
        >
            <div
                className="pointer-events-none absolute h-full w-full overflow-hidden rounded-3xl"
                style={{
                    maskImage: `radial-gradient(250px circle at ${mousePos.x}px ${mousePos.y}px, white, transparent)`,
                    WebkitMaskImage: `radial-gradient(250px circle at ${mousePos.x}px ${mousePos.y}px, white, transparent)`,
                }}
            >
                <p className="absolute inset-0 break-all text-xs font-mono leading-tight text-emerald-500/40 transition-opacity duration-300"
                    style={{ opacity: isHovered ? 0.8 : 0 }}>
                    {randomString}
                </p>
            </div>

            <div className="relative z-10 flex items-center justify-center rounded-[22px] bg-slate-900 px-8 py-6">
                <motion.span
                    className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
                    animate={{ scale: isHovered ? 1.1 : 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {text}
                </motion.span>
            </div>
        </div>
    );
}

export function Icon({ className, ...rest }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className={className}
            {...rest}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
        </svg>
    );
}
