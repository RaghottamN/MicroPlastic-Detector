import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function TargetCursor({
    spinDuration = 2,
    hideDefaultCursor = true,
    hoverDuration = 0.2
}) {
    const cursorRef = useRef(null);
    const ringRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        if (hideDefaultCursor) {
            document.body.style.cursor = 'none';
        }

        const cursor = cursorRef.current;
        const ring = ringRef.current;

        // Ensure elements exist
        if (!cursor || !ring) return;

        // Move cursor logic
        const moveCursor = (e) => {
            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1,
                ease: 'power2.out'
            });
            gsap.to(ring, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.3,
                ease: 'power2.out'
            });
        };

        const handleMouseEnter = () => setIsHovering(true);
        const handleMouseLeave = () => setIsHovering(false);

        // Add event listeners for hover targets
        const addHoverListeners = () => {
            const targets = document.querySelectorAll('button, a, input, .cursor-target');
            targets.forEach(target => {
                target.addEventListener('mouseenter', handleMouseEnter);
                target.addEventListener('mouseleave', handleMouseLeave);
            });
        };

        window.addEventListener('mousemove', moveCursor);
        addHoverListeners();

        // Spin animation for the ring
        gsap.to(ring, {
            rotation: 360,
            duration: spinDuration,
            repeat: -1,
            ease: "linear"
        });

        // Cleanup
        return () => {
            document.body.style.cursor = 'auto';
            window.removeEventListener('mousemove', moveCursor);
        };
    }, [hideDefaultCursor, spinDuration]);

    useEffect(() => {
        const ring = ringRef.current;
        if (!ring) return;

        if (isHovering) {
            gsap.to(ring, {
                scale: 2,
                opacity: 0.5,
                duration: hoverDuration
            });
        } else {
            gsap.to(ring, {
                scale: 1,
                opacity: 1,
                duration: hoverDuration
            });
        }
    }, [isHovering, hoverDuration]);

    return (
        <>
            {/* Main Cursor Dot */}
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-50 mix-blend-difference -translate-x-1/2 -translate-y-1/2"
            />

            {/* Rotating Ring */}
            <div
                ref={ringRef}
                className="fixed top-0 left-0 w-8 h-8 border border-white rounded-full pointer-events-none z-50 mix-blend-difference -translate-x-1/2 -translate-y-1/2 flex items-center justify-center opacity-80"
            >
                {/* Crosshair accents */}
                <div className="absolute w-full h-[1px] bg-transparent" />
                <div className="absolute top-0 w-[1px] h-2 bg-white" />
                <div className="absolute bottom-0 w-[1px] h-2 bg-white" />
                <div className="absolute left-0 w-2 h-[1px] bg-white" />
                <div className="absolute right-0 w-2 h-[1px] bg-white" />
            </div>
        </>
    );
}
