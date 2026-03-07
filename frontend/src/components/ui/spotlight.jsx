import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export function Spotlight({ children, className, fill = "white" }) {
    const divRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = useCallback((e) => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }, []);

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setOpacity(1)}
            onMouseLeave={() => setOpacity(0)}
            className={cn("relative overflow-hidden", className)}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px z-10"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(14, 165, 233, 0.06), transparent 40%)`,
                }}
                animate={{ opacity }}
                transition={{ duration: 0.3 }}
            />
            {children}
        </div>
    );
}
