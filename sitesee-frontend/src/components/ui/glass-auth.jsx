/* eslint-disable react-refresh/only-export-components */
import { cn } from "../../lib/utils";
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo, useCallback, createContext, Children } from "react";
import { cva } from "class-variance-authority";
import { ArrowRight, Mail, Lock, Eye, EyeOff, ArrowLeft, X, AlertCircle, PartyPopper, Loader, Home } from "lucide-react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import confetti from "canvas-confetti";

// --- CONFETTI LOGIC ---
const ConfettiContext = createContext({});

const Confetti = forwardRef((props, ref) => {
    const { options, globalOptions = { resize: true, useWorker: true }, manualstart = false, ...rest } = props;
    const instanceRef = useRef(null);

    const canvasRef = useCallback((node) => {
        if (node !== null) {
            if (instanceRef.current) return;
            instanceRef.current = confetti.create(node, { ...globalOptions, resize: true });
        } else {
            if (instanceRef.current) {
                instanceRef.current.reset();
                instanceRef.current = null;
            }
        }
    }, [globalOptions]);

    const fire = useCallback((opts = {}) => instanceRef.current?.({ ...options, ...opts }), [options]);
    const api = useMemo(() => ({ fire }), [fire]);
    useImperativeHandle(ref, () => api, [api]);
    useEffect(() => { if (!manualstart) fire(); }, [manualstart, fire]);

    return <canvas ref={canvasRef} {...rest} />;
});
Confetti.displayName = "Confetti";

// --- TEXT LOOP ANIMATION COMPONENT ---
export function TextLoop({ children, className, interval = 2, transition = { duration: 0.3 }, variants, onIndexChange, stopOnEnd = false }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const items = Children.toArray(children);

    useEffect(() => {
        const intervalMs = interval * 1000;
        const timer = setInterval(() => {
            setCurrentIndex((current) => {
                if (stopOnEnd && current === items.length - 1) {
                    clearInterval(timer);
                    return current;
                }
                const next = (current + 1) % items.length;
                onIndexChange?.(next);
                return next;
            });
        }, intervalMs);
        return () => clearInterval(timer);
    }, [items.length, interval, onIndexChange, stopOnEnd]);

    const motionVariants = {
        initial: { y: 20, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -20, opacity: 0 },
    };

    return (
        <div className={cn('relative inline-block whitespace-nowrap', className)}>
            <AnimatePresence mode='popLayout' initial={false}>
                <motion.div key={currentIndex} initial='initial' animate='animate' exit='exit' transition={transition} variants={variants || motionVariants}>
                    {items[currentIndex]}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

// --- BLUR FADE ANIMATION COMPONENT ---
function BlurFade({ children, className, variant, duration = 0.4, delay = 0, yOffset = 6, inView = true, inViewMargin = "-50px", blur = "6px" }) {
    const ref = useRef(null);
    const inViewResult = useInView(ref, { once: true, margin: inViewMargin });
    const isInView = !inView || inViewResult;

    const defaultVariants = {
        hidden: { y: yOffset, opacity: 0, filter: `blur(${blur})` },
        visible: { y: -yOffset, opacity: 1, filter: `blur(0px)` },
    };
    const combinedVariants = variant || defaultVariants;

    return (
        <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} exit="hidden" variants={combinedVariants} transition={{ delay: 0.04 + delay, duration, ease: "easeOut" }} className={className}>
            {children}
        </motion.div>
    );
}

// --- GLASS BUTTON COMPONENT ---
const glassButtonVariants = cva("relative isolate all-unset cursor-pointer rounded-full transition-all", {
    variants: {
        size: {
            default: "text-base font-medium",
            sm: "text-sm font-medium",
            lg: "text-lg font-medium",
            icon: "h-10 w-10"
        }
    },
    defaultVariants: { size: "default" }
});

const glassButtonTextVariants = cva("glass-button-text relative block select-none tracking-tighter", {
    variants: {
        size: {
            default: "px-6 py-3.5",
            sm: "px-4 py-2",
            lg: "px-8 py-4",
            icon: "flex h-10 w-10 items-center justify-center"
        }
    },
    defaultVariants: { size: "default" }
});

const GlassButton = forwardRef(({ className, children, size, contentClassName, onClick, ...props }, ref) => {
    const handleWrapperClick = (e) => {
        const button = e.currentTarget.querySelector('button');
        if (button && e.target !== button) button.click();
    };

    return (
        <div className={cn("glass-button-wrap cursor-pointer rounded-full relative", className)} onClick={handleWrapperClick}>
            <button className={cn("glass-button relative z-10", glassButtonVariants({ size }))} ref={ref} onClick={onClick} {...props}>
                <span className={cn(glassButtonTextVariants({ size }), contentClassName)}>{children}</span>
            </button>
            <div className="glass-button-shadow rounded-full pointer-events-none"></div>
        </div>
    );
});
GlassButton.displayName = "GlassButton";

// --- GRADIENT BACKGROUND ---
const GradientBackground = ({ darkMode }) => (
    <>
        <style>
            {` @keyframes float1 { 0% { transform: translate(0, 0); } 50% { transform: translate(-10px, 10px); } 100% { transform: translate(0, 0); } } @keyframes float2 { 0% { transform: translate(0, 0); } 50% { transform: translate(10px, -10px); } 100% { transform: translate(0, 0); } } `}
        </style>
        <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" className="absolute top-0 left-0 w-full h-full">
            <defs>
                <linearGradient id="rev_grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: darkMode ? '#3b82f6' : '#60a5fa', stopOpacity: 0.8 }} />
                    <stop offset="100%" style={{ stopColor: darkMode ? '#06b6d4' : '#22d3ee', stopOpacity: 0.6 }} />
                </linearGradient>
                <linearGradient id="rev_grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: darkMode ? '#8b5cf6' : '#a78bfa', stopOpacity: 0.9 }} />
                    <stop offset="50%" style={{ stopColor: darkMode ? '#ec4899' : '#f472b6', stopOpacity: 0.7 }} />
                    <stop offset="100%" style={{ stopColor: darkMode ? '#f59e0b' : '#fbbf24', stopOpacity: 0.6 }} />
                </linearGradient>
                <radialGradient id="rev_grad3" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" style={{ stopColor: darkMode ? '#ef4444' : '#f87171', stopOpacity: 0.8 }} />
                    <stop offset="100%" style={{ stopColor: darkMode ? '#10b981' : '#34d399', stopOpacity: 0.4 }} />
                </radialGradient>
                <filter id="rev_blur1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="35" /></filter>
                <filter id="rev_blur2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="25" /></filter>
                <filter id="rev_blur3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="45" /></filter>
            </defs>
            <g style={{ animation: 'float1 20s ease-in-out infinite' }}>
                <ellipse cx="200" cy="500" rx="250" ry="180" fill="url(#rev_grad1)" filter="url(#rev_blur1)" transform="rotate(-30 200 500)" />
                <rect x="500" y="100" width="300" height="250" rx="80" fill="url(#rev_grad2)" filter="url(#rev_blur2)" transform="rotate(15 650 225)" />
            </g>
            <g style={{ animation: 'float2 25s ease-in-out infinite' }}>
                <circle cx="650" cy="450" r="150" fill="url(#rev_grad3)" filter="url(#rev_blur3)" opacity="0.7" />
                <ellipse cx="50" cy="150" rx="180" ry="120" fill={darkMode ? '#8b5cf620' : '#a78bfa30'} filter="url(#rev_blur2)" opacity="0.8" />
            </g>
        </svg>
    </>
);

// --- MODAL STEPS ---
const modalSteps = [
    { message: "Signing you in...", icon: <Loader className="w-12 h-12 text-blue-500 animate-spin" /> },
    { message: "Loading your data...", icon: <Loader className="w-12 h-12 text-blue-500 animate-spin" /> },
    { message: "Almost there...", icon: <Loader className="w-12 h-12 text-blue-500 animate-spin" /> },
    { message: "Welcome Back!", icon: <PartyPopper className="w-12 h-12 text-green-500" /> }
];
const TEXT_LOOP_INTERVAL = 1.2;

// --- GOOGLE ICON ---
const GoogleIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-5 h-5">
        <g fillRule="evenodd" fill="none">
            <g fillRule="nonzero" transform="translate(3, 2)">
                <path fill="#4285F4" d="M57.8123233,30.1515267 C57.8123233,27.7263183 57.6155321,25.9565533 57.1896408,24.1212666 L29.4960833,24.1212666 L29.4960833,35.0674653 L45.7515771,35.0674653 C45.4239683,37.7877475 43.6542033,41.8844383 39.7213169,44.6372555 L39.6661883,45.0037254 L48.4223791,51.7870338 L49.0290201,51.8475849 C54.6004021,46.7020943 57.8123233,39.1313952 57.8123233,30.1515267"></path>
                <path fill="#34A853" d="M29.4960833,58.9921667 C37.4599129,58.9921667 44.1456164,56.3701671 49.0290201,51.8475849 L39.7213169,44.6372555 C37.2305867,46.3742596 33.887622,47.5868638 29.4960833,47.5868638 C21.6960582,47.5868638 15.0758763,42.4415991 12.7159637,35.3297782 L12.3700541,35.3591501 L3.26524241,42.4054492 L3.14617358,42.736447 C7.9965904,52.3717589 17.959737,58.9921667 29.4960833,58.9921667"></path>
                <path fill="#FBBC05" d="M12.7159637,35.3297782 C12.0932812,33.4944915 11.7329116,31.5279353 11.7329116,29.4960833 C11.7329116,27.4640054 12.0932812,25.4976752 12.6832029,23.6623884 L12.6667095,23.2715173 L3.44779955,16.1120237 L3.14617358,16.2554937 C1.14708246,20.2539019 0,24.7439491 0,29.4960833 C0,34.2482175 1.14708246,38.7380388 3.14617358,42.736447 L12.7159637,35.3297782"></path>
                <path fill="#EB4335" d="M29.4960833,11.4050769 C35.0347044,11.4050769 38.7707997,13.7975244 40.9011602,15.7968415 L49.2255853,7.66898166 C44.1130815,2.91684746 37.4599129,0 29.4960833,0 C17.959737,0 7.9965904,6.62018183 3.14617358,16.2554937 L12.6832029,23.6623884 C15.0758763,16.5505675 21.6960582,11.4050769 29.4960833,11.4050769"></path>
            </g>
        </g>
    </svg>
);

export { Confetti, BlurFade, GlassButton, GradientBackground, GoogleIcon, modalSteps, TEXT_LOOP_INTERVAL, ConfettiContext };
