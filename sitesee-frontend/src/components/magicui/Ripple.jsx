"use client";

import { cn } from "../../lib/utils";

const Ripple = ({
    mainCircleSize = 210,
    mainCircleOpacity = 0.24,
    numCircles = 8,
    className,
}) => {
    return (
        <div
            className={cn(
                "pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden [mask-image:radial-gradient(ellipse_at_center,white,transparent)]",
                className
            )}
        >
            {Array.from({ length: numCircles }, (_, i) => {
                const size = mainCircleSize + i * 70;
                const opacity = mainCircleOpacity - i * 0.03;
                const animationDelay = `${i * 0.06}s`;
                const borderStyle = i === numCircles - 1 ? "dashed" : "solid";
                const borderOpacity = 5 + i * 5;

                return (
                    <div
                        key={i}
                        className={cn(
                            "absolute animate-ripple rounded-full border bg-blue-500/10 dark:bg-blue-400/10",
                            "[--i:1]"
                        )}
                        style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            opacity,
                            animationDelay,
                            borderStyle,
                            borderWidth: "1px",
                            borderColor: `rgb(59 130 246 / ${borderOpacity / 100})`,
                        }}
                    />
                );
            })}
        </div>
    );
};

export default Ripple;
