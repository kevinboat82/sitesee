"use client";

import { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

const AnimatedGradient = ({
    className,
    colors = ["#3b82f6", "#8b5cf6", "#06b6d4"],
    speed = 8,
    blur = "medium",
}) => {
    const containerRef = useRef(null);

    const blurClass = {
        none: "",
        light: "blur-xl",
        medium: "blur-2xl",
        heavy: "blur-3xl",
    };

    return (
        <div
            ref={containerRef}
            className={cn(
                "absolute inset-0 overflow-hidden",
                className
            )}
        >
            {/* Primary gradient blob */}
            <div
                className={cn(
                    "absolute w-[80%] aspect-square rounded-full opacity-30",
                    blurClass[blur]
                )}
                style={{
                    background: `radial-gradient(circle, ${colors[0]} 0%, transparent 70%)`,
                    top: "10%",
                    left: "20%",
                    animation: `gradient-float-1 ${speed}s ease-in-out infinite`,
                }}
            />

            {/* Secondary gradient blob */}
            <div
                className={cn(
                    "absolute w-[60%] aspect-square rounded-full opacity-25",
                    blurClass[blur]
                )}
                style={{
                    background: `radial-gradient(circle, ${colors[1]} 0%, transparent 70%)`,
                    top: "40%",
                    right: "10%",
                    animation: `gradient-float-2 ${speed * 1.2}s ease-in-out infinite`,
                }}
            />

            {/* Tertiary gradient blob */}
            <div
                className={cn(
                    "absolute w-[50%] aspect-square rounded-full opacity-20",
                    blurClass[blur]
                )}
                style={{
                    background: `radial-gradient(circle, ${colors[2]} 0%, transparent 70%)`,
                    bottom: "10%",
                    left: "30%",
                    animation: `gradient-float-3 ${speed * 0.8}s ease-in-out infinite`,
                }}
            />

            <style>{`
        @keyframes gradient-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes gradient-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 20px) scale(0.95); }
          66% { transform: translate(20px, -40px) scale(1.05); }
        }
        @keyframes gradient-float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, 30px) scale(1.1); }
          66% { transform: translate(-30px, -20px) scale(0.9); }
        }
      `}</style>
        </div>
    );
};

export default AnimatedGradient;
