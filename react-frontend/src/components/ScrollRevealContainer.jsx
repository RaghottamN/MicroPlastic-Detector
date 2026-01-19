import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ScrollRevealContainer = ({
    children,
    enableBlur = true,
    blurStrength = 4,
    baseOpacity = 0.1,
    baseY = 30,
    duration = 0.8,
    className = "",
}) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Set initial state
        gsap.set(container, {
            opacity: baseOpacity,
            y: baseY,
            filter: enableBlur ? `blur(${blurStrength}px)` : "none",
        });

        // Animate on scroll
        gsap.to(container, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: duration,
            ease: "power2.out",
            scrollTrigger: {
                trigger: container,
                start: "top 85%",
                end: "top 50%",
                toggleActions: "play none none reverse",
            },
        });

        return () => {
            ScrollTrigger.getAll().forEach((trigger) => {
                if (trigger.trigger === container) {
                    trigger.kill();
                }
            });
        };
    }, [baseOpacity, baseY, blurStrength, duration, enableBlur]);

    return (
        <div ref={containerRef} className={className}>
            {children}
        </div>
    );
};

export default ScrollRevealContainer;
