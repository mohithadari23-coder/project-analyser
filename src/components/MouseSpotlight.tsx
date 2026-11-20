import { useEffect, useRef } from 'react';

export function MouseSpotlight() {
  const spotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = spotRef.current;
    if (!el) return;

    const handleMove = (e: PointerEvent) => {
      el.style.transform = `translate3d(${e.clientX - 240}px, ${e.clientY - 240}px, 0)`;
      el.style.opacity = '1';
    };

    const handleLeave = () => {
      el.style.opacity = '0';
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('pointerleave', handleLeave);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerleave', handleLeave);
    };
  }, []);

  return (
    <div
      ref={spotRef}
      aria-hidden="true"
      className="fixed top-0 left-0 w-[480px] h-[480px] rounded-full pointer-events-none z-[1] opacity-0 transition-opacity duration-300"
      style={{
        background:
          'radial-gradient(circle, rgba(255,255,255,0.11) 0%, rgba(212,212,216,0.05) 42%, transparent 72%)',
      }}
    />
  );
}
