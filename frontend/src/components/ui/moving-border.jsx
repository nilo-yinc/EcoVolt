import { useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export function MovingBorder({
    children,
    duration = 4000,
    className,
    containerClassName,
    borderClassName,
    as: Component = "div",
    ...otherProps
}) {
    return (
        <Component
            className={cn("relative overflow-hidden rounded-xl p-[1px] group", containerClassName)}
            {...otherProps}
        >
            {/* Animated border */}
            <div className="absolute inset-0 rounded-xl overflow-hidden">
                <motion.div
                    className={cn("absolute w-[200%] h-[200%] opacity-60", borderClassName)}
                    style={{
                        background: "conic-gradient(from 0deg, transparent 0deg, #0ea5e9 60deg, transparent 120deg)",
                        top: "-50%",
                        left: "-50%",
                    }}
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: duration / 1000,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
            </div>
            {/* Inner content */}
            <div className={cn("relative rounded-[11px] bg-slate-950", className)}>
                {children}
            </div>
        </Component>
    );
}
