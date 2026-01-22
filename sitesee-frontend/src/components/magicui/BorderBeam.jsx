"use client";

import { cn } from "../../lib/utils";

const BorderBeam = ({
    className,
    size = 200,
    duration = 15,
    delay = 0,
    colorFrom = "#ffaa40",
    colorTo = "#9c40ff",
    borderWidth = 1.5,
}) => {
    return (
        <div
            style={{
                "--size": size,
                "--duration": `${duration}s`,
                "--delay": `-${delay}s`,
                "--color-from": colorFrom,
                "--color-to": colorTo,
                "--border-width": `${borderWidth}px`,
            }}
            className={cn(
                "pointer-events-none absolute inset-0 rounded-[inherit]",
                "[border:calc(var(--border-width))_solid_transparent]",
                "[background:linear-gradient(to_right,var(--color-from),var(--color-to))_border-box]",
                "[mask-composite:exclude]",
                "[mask:linear-gradient(white_0_0)_padding-box,linear-gradient(white_0_0)]",

                // Pseudo element for animation
                "after:absolute after:aspect-square after:w-[calc(var(--size)*1px)]",
                "after:animate-border-beam after:[animation-delay:var(--delay)]",
                "after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)]",
                "after:[offset-anchor:calc(var(--size)*1px)_50%]",
                "after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]",

                className
            )}
        />
    );
};

export default BorderBeam;
