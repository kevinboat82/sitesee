"use client";

import { useId } from "react";
import { cn } from "../../lib/utils";

const GridPattern = ({
    width = 40,
    height = 40,
    x = -1,
    y = -1,
    strokeDasharray = 0,
    squares,
    className,
    ...props
}) => {
    const id = useId();

    return (
        <svg
            aria-hidden="true"
            className={cn(
                "pointer-events-none absolute inset-0 h-full w-full stroke-gray-400/10 dark:stroke-gray-600/10",
                "[mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]",
                className
            )}
            {...props}
        >
            <defs>
                <pattern
                    id={id}
                    width={width}
                    height={height}
                    patternUnits="userSpaceOnUse"
                    x={x}
                    y={y}
                >
                    <path
                        d={`M.5 ${height}V.5H${width}`}
                        fill="none"
                        strokeDasharray={strokeDasharray}
                    />
                </pattern>
            </defs>
            <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
            {squares && (
                <svg x={x} y={y} className="overflow-visible">
                    {squares.map(([x, y], index) => (
                        <rect
                            strokeWidth="0"
                            key={`${x}-${y}-${index}`}
                            width={width - 1}
                            height={height - 1}
                            x={x * width + 1}
                            y={y * height + 1}
                            className="fill-blue-500/5 dark:fill-blue-400/5"
                        />
                    ))}
                </svg>
            )}
        </svg>
    );
};

export default GridPattern;
