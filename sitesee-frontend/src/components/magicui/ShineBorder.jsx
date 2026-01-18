"use client";

import { cn } from "../../lib/utils";

const ShineBorder = ({
    borderRadius = 8,
    borderWidth = 1,
    duration = 14,
    color = "#ffffff",
    className,
    children,
}) => {
    return (
        <div
            style={{
                "--border-radius": `${borderRadius}px`,
            }}
            className={cn(
                "relative min-h-[60px] w-full place-items-center rounded-[--border-radius] bg-white p-3 text-black dark:bg-black dark:text-white",
                className
            )}
        >
            {/* Animated border - pointer-events-none so clicks pass through */}
            <div
                style={{
                    "--border-width": `${borderWidth}px`,
                    "--border-radius": `${borderRadius}px`,
                    "--duration": `${duration}s`,
                    "--mask-linear-gradient": `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
                    "--background-radial-gradient": `radial-gradient(transparent,transparent, ${Array.isArray(color) ? color.join(",") : color},transparent,transparent)`,
                }}
                className={`pointer-events-none before:bg-shine-size before:absolute before:inset-0 before:aspect-square before:size-full before:rounded-[--border-radius] before:p-[--border-width] before:will-change-[background-position] before:content-[""] before:![-webkit-mask-composite:xor] before:![mask-composite:exclude] before:[background-image:--background-radial-gradient] before:[background-size:300%_300%] before:[mask:--mask-linear-gradient] motion-safe:before:animate-shine`}
            />
            {/* Content wrapper with higher z-index for clickability */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default ShineBorder;

