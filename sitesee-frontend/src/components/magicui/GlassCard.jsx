"use client";

import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const GlassCard = forwardRef(({
    children,
    className,
    hover = true,
    glow = false,
    glowColor = "blue",
    ...props
}, ref) => {
    const glowColors = {
        blue: "hover:shadow-glow",
        purple: "hover:shadow-glow-purple",
        amber: "hover:shadow-glow-amber",
        emerald: "hover:shadow-glow-emerald",
    };

    return (
        <div
            ref={ref}
            className={cn(
                // Base styles
                "relative rounded-2xl overflow-hidden",
                "bg-white/80 dark:bg-white/5",
                "backdrop-blur-xl",
                "border border-gray-200/50 dark:border-white/10",
                "shadow-lg dark:shadow-2xl",

                // Transitions
                "transition-all duration-300 ease-out",

                // Hover effects
                hover && [
                    "hover:border-gray-300/60 dark:hover:border-white/20",
                    "hover:shadow-xl dark:hover:shadow-2xl",
                    "hover:-translate-y-0.5",
                ],

                // Glow effect
                glow && glowColors[glowColor],

                className
            )}
            {...props}
        >
            {/* Subtle gradient overlay for glass effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent dark:from-white/5 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
});

GlassCard.displayName = "GlassCard";

export default GlassCard;
