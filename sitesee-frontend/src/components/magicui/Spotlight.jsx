"use client";

import { useRef, useState, useEffect } from "react";
import { cn } from "../../lib/utils";

const Spotlight = ({
    className,
    fill = "white",
}) => {
    const divRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e) => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleMouseEnter = () => setOpacity(1);
    const handleMouseLeave = () => setOpacity(0);

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "relative overflow-hidden",
                className
            )}
        >
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${fill === "white" ? "rgba(255,255,255,0.06)" : "rgba(59,130,246,0.08)"}, transparent 40%)`,
                }}
            />
        </div>
    );
};

// Variant that wraps children
export const SpotlightCard = ({
    children,
    className,
    spotlightColor = "rgba(59,130,246,0.08)",
}) => {
    const divRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e) => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleMouseEnter = () => setOpacity(1);
    const handleMouseLeave = () => setOpacity(0);

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn("relative overflow-hidden", className)}
        >
            <div
                className="pointer-events-none absolute -inset-px transition-opacity duration-500"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
                }}
            />
            {children}
        </div>
    );
};

export default Spotlight;
