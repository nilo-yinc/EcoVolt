import { useEffect, useState } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "../../lib/utils";

export function TextGenerateEffect({ words, className, filter = true, duration = 0.5 }) {
    const [scope, animate] = useAnimate();
    const wordsArray = words.split(" ");

    useEffect(() => {
        animate(
            "span",
            { opacity: 1, filter: filter ? "blur(0px)" : "none" },
            { duration, delay: stagger(0.08) }
        );
    }, [scope]);

    return (
        <div className={cn("font-mono", className)} ref={scope}>
            {wordsArray.map((word, idx) => (
                <motion.span
                    key={word + idx}
                    className="opacity-0 inline-block mr-[0.3em]"
                    style={{ filter: filter ? "blur(8px)" : "none" }}
                >
                    {word}
                </motion.span>
            ))}
        </div>
    );
}
