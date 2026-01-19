import { useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ScrollReveal = ({
    children,
    scrollContainerRef,
    enableBlur = true,
    baseRotation = 3,
    blurStrength = 4,
    baseOpacity = 0.1,
    containerClassName = "",
    textClassName = "",
    rotationEnd = "bottom bottom",
    wordAnimationEnd = "bottom bottom",
}) => {
    const containerRef = useRef(null);

    const splitText = useMemo(() => {
        const text = typeof children === "string" ? children : "";
        return text.split(/(\s+)/).map((word, index) => {
            if (word.match(/^\s+$/)) {
                return <span key={index}>{word}</span>;
            }
            return (
                <span
                    className="inline-block word"
                    key={index}
                    style={{
                        opacity: baseOpacity,
                        filter: enableBlur ? `blur(${blurStrength}px)` : "none",
                    }}
                >
                    {word}
                </span>
            );
        });
    }, [children, baseOpacity, enableBlur, blurStrength]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const words = container.querySelectorAll(".word");
        const scroller =
            scrollContainerRef && scrollContainerRef.current
                ? scrollContainerRef.current
                : window;

        gsap.to(container, {
            rotation: 0,
            scrollTrigger: {
                trigger: container,
                scroller,
                start: "top bottom",
                end: rotationEnd,
                scrub: true,
            },
        });

        gsap.to(words, {
            opacity: 1,
            filter: "blur(0px)",
            stagger: 0.05,
            scrollTrigger: {
                trigger: container,
                scroller,
                start: "top bottom",
                end: wordAnimationEnd,
                scrub: true,
            },
        });

        return () => {
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
    }, [scrollContainerRef, rotationEnd, wordAnimationEnd]);

    return (
        <div
            ref={containerRef}
            className={containerClassName}
            style={{
                transform: `rotate(${baseRotation}deg)`,
                transformOrigin: "center center",
            }}
        >
            <span className={textClassName}>{splitText}</span>
        </div>
    );
};

export default ScrollReveal;
