import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const ScrambledText = ({
    children,
    className = '',
    radius = 0, // Not strictly used in simple text scramble but kept for API compat
    duration = 0.7,
    speed = 0.3, // Controls scramble speed
    scrambleChars = '!<>-_\\/[]{}—=+*^?#________',
    revealDelay = 0,
}) => {
    const elementRef = useRef(null);
    const originalText = useRef(children);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        // Reset text content to original in case of re-renders
        // element.innerText = originalText.current;

        const tl = gsap.timeline();

        // Simple Scramble Effect using GSAP TextPlugin is possible, 
        // but without paying plugins, we can simulate it with a simple tween.
        // However, for a high quality "Scramble", we should implement a custom logic 
        // or use exact logic if provided. 
        // The user provided snippet suggests an API but not implementation.
        // I will write a robust custom Scramble effect using GSAP.

        const chars = scrambleChars.split('');
        const text = originalText.current;
        const length = text.length;

        let progress = { value: 0 };

        tl.to(progress, {
            value: 1,
            duration: duration,
            delay: revealDelay,
            ease: "none",
            onUpdate: () => {
                let result = "";
                for (let i = 0; i < length; i++) {
                    if (i < Math.floor(progress.value * length)) {
                        result += text[i];
                    } else {
                        result += text[i] === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)];
                    }
                }
                element.innerText = result;
            },
            onComplete: () => {
                element.innerText = text;
            }
        });

        return () => {
            tl.kill();
        };
    }, [children, duration, speed, scrambleChars, revealDelay]);

    return (
        <span ref={elementRef} className={className}>
            {children}
        </span>
    );
};

export default ScrambledText;
