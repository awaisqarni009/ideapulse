'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface FlashlightProps {
  src: string;
  alt: string;
  className?: string;
}

export default function Flashlight({ src, alt, className = '' }: FlashlightProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      // Desktop: Beam follows pointer with damped spring via quickTo
      mm.add('(hover: hover) and (prefers-reduced-motion: no-preference)', () => {
        const pos = { x: 50, y: 40 };
        const qx = gsap.quickTo(pos, 'x', { duration: 0.6, ease: 'power3.out' });
        const qy = gsap.quickTo(pos, 'y', { duration: 0.6, ease: 'power3.out' });

        const render = () => {
          el.style.setProperty('--mx', `${pos.x}%`);
          el.style.setProperty('--my', `${pos.y}%`);
        };
        gsap.ticker.add(render);

        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          qx(((e.clientX - r.left) / r.width) * 100);
          qy(((e.clientY - r.top) / r.height) * 100);
        };
        el.addEventListener('pointermove', move);

        // "Lights on": open the beam once at load per spec §6.3
        const rObj = { val: 0 };
        gsap.to(rObj, {
          val: 26,
          duration: 1.2,
          ease: 'expo.out',
          onUpdate: () => {
            el.style.setProperty('--r', `${rObj.val}vmax`);
          },
        });

        return () => {
          gsap.ticker.remove(render);
          el.removeEventListener('pointermove', move);
        };
      });

      // Touch devices: gentle automated sweep across the garment once per spec §6.1
      mm.add('(hover: none) and (prefers-reduced-motion: no-preference)', () => {
        const sweep = { x: 30, y: 40, r: 0 };
        gsap.to(sweep, {
          x: 70,
          r: 28,
          duration: 5,
          ease: 'power2.inOut',
          onUpdate: () => {
            el.style.setProperty('--mx', `${sweep.x}%`);
            el.style.setProperty('--my', `${sweep.y}%`);
            el.style.setProperty('--r', `${sweep.r}vmax`);
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className={`flashlight ${className}`}>
      <img className="flashlight__base" src={src} alt={alt} />
      <img className="flashlight__lit" src={src} alt="" aria-hidden="true" />
    </div>
  );
}
