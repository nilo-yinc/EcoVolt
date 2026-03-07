import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { Link } from "react-router-dom";

export function HoverEffect({ items, className }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
            {items.map((item, idx) => (
                <Link
                    to={item.link || "#"}
                    key={idx}
                    className="relative group block p-1 h-full w-full"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <AnimatePresence>
                        {hoveredIndex === idx && (
                            <motion.span
                                className="absolute inset-0 h-full w-full bg-cyan-500/[0.06] block rounded-2xl"
                                layoutId="hoverBackground"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { duration: 0.15 } }}
                                exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.2 } }}
                            />
                        )}
                    </AnimatePresence>
                    <div className="relative z-10 rounded-xl border border-white/[0.06] bg-slate-900/80 backdrop-blur-sm p-5 h-full transition-colors duration-200 group-hover:border-cyan-500/20">
                        {item.icon && <div className="text-cyan-400 mb-3">{item.icon}</div>}
                        <h4 className="text-white font-semibold text-sm tracking-wide mb-1.5">{item.title}</h4>
                        {item.description && <p className="text-slate-400 text-xs leading-relaxed">{item.description}</p>}
                        {item.stat && <div className="text-cyan-400 font-mono text-lg font-bold mt-2">{item.stat}</div>}
                    </div>
                </Link>
            ))}
        </div>
    );
}
