'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

interface Dashboard3DPulseProps {
  availableVotes: number;
  totalVotesLimit: number;
  activeCycleNumber: number;
  ideasCount: number;
  verifiedCount: number;
}

/**
 * Dashboard3DPulse
 * High-performance 3D interactive consensus core on HTML5 Canvas.
 * Renders an interactive 3D geodesic sphere of consensus nodes, orbital energy particles,
 * and holographic rings. Supports mouse/touch rotation in 3D spherical space.
 * Zero external 3D dependencies, GPU-accelerated canvas, respects prefers-reduced-motion.
 */
export function Dashboard3DPulse({
  availableVotes,
  totalVotesLimit,
  activeCycleNumber,
  ideasCount,
  verifiedCount,
}: Dashboard3DPulseProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  // Rotation angles for 3D sphere
  const rotationRef = useRef({ rotX: 0.2, rotY: 0.4, targetX: 0.2, targetY: 0.4 });
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = 400);
    let height = (canvas.height = 400);

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.width = rect.width * dpr;
      height = canvas.height = rect.height * dpr;
    };
    handleResize();

    // Generate 3D nodes on a sphere
    const nodeCount = 48;
    const sphereRadius = Math.min(width, height) * 0.24;
    const nodes: { x: number; y: number; z: number; pulse: number; speed: number }[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      nodes.push({
        x: sphereRadius * Math.cos(theta) * Math.sin(phi),
        y: sphereRadius * Math.sin(theta) * Math.sin(phi),
        z: sphereRadius * Math.cos(phi),
        pulse: Math.random() * Math.PI * 2,
        speed: 0.03 + Math.random() * 0.04,
      });
    }

    // Orbital particles
    const particleCount = 28;
    const particles: {
      radius: number;
      speed: number;
      angle: number;
      tilt: number;
      size: number;
      hue: number;
    }[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        radius: sphereRadius * (1.1 + Math.random() * 0.4),
        speed: (0.01 + Math.random() * 0.015) * (Math.random() > 0.5 ? 1 : -1),
        angle: Math.random() * Math.PI * 2,
        tilt: (Math.random() - 0.5) * 0.8,
        size: 1.5 + Math.random() * 2,
        hue: Math.random() > 0.4 ? 220 : 180, // Indigo or Cyan
      });
    }

    let time = 0;

    const render = () => {
      time += 0.015;

      // Auto rotation if not dragging and motion allowed
      if (!shouldReduceMotion && !isDraggingRef.current) {
        rotationRef.current.targetY += 0.006;
        rotationRef.current.targetX = Math.sin(time * 0.5) * 0.15 + 0.1;
      }

      // Smooth interpolation towards target rotation
      rotationRef.current.rotX += (rotationRef.current.targetX - rotationRef.current.rotX) * 0.08;
      rotationRef.current.rotY += (rotationRef.current.targetY - rotationRef.current.rotY) * 0.08;

      const cosX = Math.cos(rotationRef.current.rotX);
      const sinX = Math.sin(rotationRef.current.rotX);
      const cosY = Math.cos(rotationRef.current.rotY);
      const sinY = Math.sin(rotationRef.current.rotY);

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const fov = Math.min(width, height) * 1.1;

      // 1. Draw glowing background radial gradient
      const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, sphereRadius * 1.5);
      bgGrad.addColorStop(0, 'rgba(99, 102, 241, 0.18)');
      bgGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.08)');
      bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, sphereRadius * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // 2. Project and sort nodes by Z depth
      const projectedNodes = nodes.map((node) => {
        // Rotate Y
        const x1 = node.x * cosY + node.z * sinY;
        const z1 = -node.x * sinY + node.z * cosY;

        // Rotate X
        const y2 = node.y * cosX - z1 * sinX;
        const z2 = node.y * sinX + z1 * cosX;

        // Perspective scale
        const scale = fov / (fov + z2 + sphereRadius * 1.2);
        const px = cx + x1 * scale;
        const py = cy + y2 * scale;

        node.pulse += node.speed;
        const currentRadius = (2 + Math.sin(node.pulse) * 1.2) * scale;

        return { px, py, pz: z2, scale, radius: currentRadius };
      });

      projectedNodes.sort((a, b) => a.pz - b.pz);

      // 3. Draw geodesic connection lines between nearby nodes
      ctx.lineWidth = 0.8;
      for (let i = 0; i < projectedNodes.length; i++) {
        const p1 = projectedNodes[i];
        if (!p1) continue;
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const p2 = projectedNodes[j];
          if (!p2) continue;
          const dist = Math.hypot(p1.px - p2.px, p1.py - p2.py);
          if (dist < 48 * p1.scale) {
            const alpha = (1 - dist / (48 * p1.scale)) * (0.15 + (p1.pz / sphereRadius) * 0.1);
            if (alpha > 0.02) {
              ctx.strokeStyle = `rgba(129, 140, 248, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(p1.px, p1.py);
              ctx.lineTo(p2.px, p2.py);
              ctx.stroke();
            }
          }
        }
      }

      // 4. Draw projected sphere nodes
      for (const node of projectedNodes) {
        const depthAlpha = Math.max(
          0.15,
          Math.min(1, (node.pz + sphereRadius) / (sphereRadius * 2)),
        );
        ctx.fillStyle = `rgba(165, 180, 252, ${depthAlpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(node.px, node.py, Math.max(1, node.radius), 0, Math.PI * 2);
        ctx.fill();

        // Node specular glow for front-facing nodes
        if (node.pz > 0) {
          ctx.fillStyle = `rgba(6, 182, 212, ${depthAlpha * 0.4})`;
          ctx.beginPath();
          ctx.arc(node.px, node.py, node.radius * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 5. Draw orbital particles
      for (const p of particles) {
        if (!shouldReduceMotion) {
          p.angle += p.speed;
        }

        const ox = p.radius * Math.cos(p.angle);
        const oz = p.radius * Math.sin(p.angle);
        const oy = p.radius * Math.sin(p.angle) * p.tilt;

        // Apply sphere rotations
        const x1 = ox * cosY + oz * sinY;
        const z1 = -ox * sinY + oz * cosY;
        const y2 = oy * cosX - z1 * sinX;
        const z2 = oy * sinX + z1 * cosX;

        const scale = fov / (fov + z2 + sphereRadius * 1.2);
        const px = cx + x1 * scale;
        const py = cy + y2 * scale;
        const alpha = Math.max(0.2, (z2 + sphereRadius * 1.5) / (sphereRadius * 3));

        ctx.fillStyle =
          p.hue === 180
            ? `rgba(6, 182, 212, ${alpha * 0.85})`
            : `rgba(168, 85, 247, ${alpha * 0.85})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // 6. Draw central energy pulse ring
      const pulseSize =
        (sphereRadius * 0.35 + Math.sin(time * 2) * 6) * (fov / (fov + sphereRadius));
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, pulseSize, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [shouldReduceMotion]);

  // Pointer drag event handlers for 3D rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    rotationRef.current.targetY += dx * 0.008;
    rotationRef.current.targetX = Math.max(
      -1,
      Math.min(1, rotationRef.current.targetX - dy * 0.008),
    );
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        isDraggingRef.current = false;
      }}
      className="hover:border-[var(--indigo)]/40 group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6 shadow-2xl backdrop-blur-md transition-all duration-300"
      style={{
        boxShadow: '0 20px 48px -12px rgba(0, 0, 0, 0.45), inset 0 1px 0 var(--edge-specular)',
      }}
    >
      {/* Dynamic 3D Canvas */}
      <div className="relative h-[280px] w-full max-w-[340px] cursor-grab active:cursor-grabbing sm:h-[320px] sm:max-w-[380px]">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="h-full w-full touch-none select-none"
          title="Interactive 3D Consensus Core — Drag to rotate"
          aria-label="3D visualization of IdeaPulse consensus core"
        />

        {/* Floating Top Indicator */}
        <div className="bg-[var(--surface-2)]/80 pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-2.5 py-1 text-[11px] font-semibold text-[var(--cyan-bright)] shadow-sm backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
          </span>
          <span>Cycle {activeCycleNumber} Core</span>
        </div>

        {/* Floating Interactive Drag Tooltip */}
        <div className="bg-[var(--surface-2)]/70 pointer-events-none absolute bottom-3 right-3 rounded-md border border-[var(--border-subtle)] px-2 py-0.5 text-[10px] text-[var(--text-tertiary)] backdrop-blur-sm transition-opacity duration-200">
          {isHovered ? 'Drag to rotate 3D view' : 'Interactive 3D'}
        </div>
      </div>

      {/* Realtime Consensus HUD Summary Chips */}
      <div className="mt-4 grid w-full grid-cols-3 gap-2.5 border-t border-[var(--border-subtle)] pt-4">
        {/* Available Daily Votes */}
        <div className="bg-[var(--surface-2)]/60 hover:border-[var(--indigo-bright)]/40 flex flex-col items-center justify-center rounded-xl border border-[var(--border-subtle)] p-2.5 text-center transition-colors">
          <div className="flex items-center gap-1 text-[11px] font-medium text-[var(--text-tertiary)]">
            <Zap className="h-3 w-3 text-[var(--indigo-bright)]" />
            <span>Daily Votes</span>
          </div>
          <div className="mt-1 font-mono text-base font-bold text-[var(--cyan-bright)]">
            {availableVotes}
            <span className="text-xs font-normal text-[var(--text-tertiary)]">
              /{totalVotesLimit}
            </span>
          </div>
        </div>

        {/* Active Proposals */}
        <div className="bg-[var(--surface-2)]/60 hover:border-[var(--indigo-bright)]/40 flex flex-col items-center justify-center rounded-xl border border-[var(--border-subtle)] p-2.5 text-center transition-colors">
          <div className="flex items-center gap-1 text-[11px] font-medium text-[var(--text-tertiary)]">
            <Activity className="h-3 w-3 text-[var(--violet-bright)]" />
            <span>My Ideas</span>
          </div>
          <div className="mt-1 font-mono text-base font-bold text-[var(--text-primary)]">
            {ideasCount}
          </div>
        </div>

        {/* Verified Standing */}
        <div className="bg-[var(--surface-2)]/60 hover:border-[var(--indigo-bright)]/40 flex flex-col items-center justify-center rounded-xl border border-[var(--border-subtle)] p-2.5 text-center transition-colors">
          <div className="flex items-center gap-1 text-[11px] font-medium text-[var(--text-tertiary)]">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            <span>Total Backers</span>
          </div>
          <div className="mt-1 font-mono text-base font-bold text-emerald-400">{verifiedCount}</div>
        </div>
      </div>
    </div>
  );
}
