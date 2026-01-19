import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const ScrollStackContext = createContext(null);

export function ScrollStackItem({ children, className = "" }) {
    const itemRef = useRef(null);
    const ctx = useContext(ScrollStackContext);

    useEffect(() => {
        if (!itemRef.current || !ctx) return;
        ctx.registerItem(itemRef.current);
        return () => ctx.unregisterItem(itemRef.current);
    }, [ctx]);

    return (
        <div
            ref={itemRef}
            className={`scroll-stack-item ${className}`}
            style={{
                position: "sticky",
                top: 0,
                willChange: "transform, opacity",
            }}
        >
            {children}
        </div>
    );
}

export default function ScrollStack({
    children,
    className = "",
    containerClassName = "",
}) {
    const containerRef = useRef(null);
    const itemsRef = useRef([]);
    const [lenisInstance, setLenisInstance] = useState(null);

    const registerItem = (el) => {
        if (!itemsRef.current.includes(el)) {
            itemsRef.current.push(el);
        }
    };

    const unregisterItem = (el) => {
        itemsRef.current = itemsRef.current.filter((item) => item !== el);
    };

    useEffect(() => {
        // Initialize Lenis for smooth scrolling
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            smoothWheel: true,
        });

        setLenisInstance(lenis);

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Connect Lenis to ScrollTrigger
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);

        return () => {
            lenis.destroy();
        };
    }, []);

    useEffect(() => {
        if (!containerRef.current || itemsRef.current.length === 0) return;

        const items = itemsRef.current;
        const ctx = gsap.context(() => {
            items.forEach((item, index) => {
                if (index === items.length - 1) return; // Skip last item

                gsap.to(item, {
                    scale: 0.9,
                    opacity: 0.5,
                    filter: "blur(4px)",
                    scrollTrigger: {
                        trigger: item,
                        start: "top top",
                        end: "bottom top",
                        scrub: 0.5,
                        pin: false,
                    },
                });
            });
        }, containerRef);

        return () => ctx.revert();
    }, [children]);

    return (
        <ScrollStackContext.Provider value={{ registerItem, unregisterItem, lenisInstance }}>
            <div ref={containerRef} className={`scroll-stack-container ${containerClassName}`}>
                <div className={`scroll-stack ${className}`} style={{ position: "relative" }}>
                    {children}
                </div>
            </div>
        </ScrollStackContext.Provider>
    );
}
