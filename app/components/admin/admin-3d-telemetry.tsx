'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Shield, Radio, Activity, AlertTriangle } from 'lucide-react';

interface Admin3DTelemetryProps {
  healthy: boolean;
  activeCycleNumber: number;
  unresolvedReportsCount: number;
  pendingClustersCount: number;
  abuseEvents24h: number;
}

/**
 * Admin3DTelemetry
 * High-performance 3D canvas telemetry scanner for the Admin Command Center.
 * Renders an isometric cybernetic grid, a 3D rotating platform node array,
 * and an active radar sweep measuring platform integrity and sybil resistance.
 */
export function Admin3DTelemetry({
  healthy,
  activeCycleNumber,
  unresolvedReportsCount,
  pendingClustersCount,
  abuseEvents24h,
}: Admin3DTelemetryProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  const rotationRef = useRef({ rotX: 0.65, rotY: 0.75, targetX: 0.65, targetY: 0.75 });
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = 400);
    let height = (canvas.height = 300);

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.width = rect.width * dpr;
      height = canvas.height = rect.height * dpr;
    };
    handleResize();

    // 3D Nodes representing system modules
    const modules = [
      { name: 'Cycle Engine', x: 0, y: 0, z: -40, status: healthy ? 'ok' : 'err' },
      { name: 'Consensus Ledger', x: -50, y: 0, z: 20, status: 'ok' },
      {
        name: 'Sybil Shield',
        x: 50,
        y: 0,
        z: 20,
        status: pendingClustersCount > 0 ? 'warn' : 'ok',
      },
      {
        name: 'Reports Queue',
        x: -30,
        y: 0,
        z: 60,
        status: unresolvedReportsCount > 0 ? 'warn' : 'ok',
      },
      { name: 'Rate Guard', x: 30, y: 0, z: 60, status: abuseEvents24h > 10 ? 'warn' : 'ok' },
      { name: 'Voter Core', x: 0, y: -35, z: 15, status: 'ok' },
    ];

    let time = 0;

    const render = () => {
      time += 0.02;

      if (!shouldReduceMotion && !isDraggingRef.current) {
        rotationRef.current.targetY += 0.005;
        rotationRef.current.targetX = 0.65 + Math.sin(time * 0.4) * 0.05;
      }

      rotationRef.current.rotX += (rotationRef.current.targetX - rotationRef.current.rotX) * 0.08;
      rotationRef.current.rotY += (rotationRef.current.targetY - rotationRef.current.rotY) * 0.08;

      const cosX = Math.cos(rotationRef.current.rotX);
      const sinX = Math.sin(rotationRef.current.rotX);
      const cosY = Math.cos(rotationRef.current.rotY);
      const sinY = Math.sin(rotationRef.current.rotY);

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2 + 10;
      const fov = 340;

      // 1. Draw glowing background grid
      ctx.save();
      const gridSize = 140;
      const gridSteps = 6;
      const step = (gridSize * 2) / gridSteps;

      ctx.strokeStyle = 'rgba(99, 102, 241, 0.12)';
      ctx.lineWidth = 1;

      for (let i = -gridSize; i <= gridSize; i += step) {
        // Line along Z
        const p1x = i * cosY + -gridSize * sinY;
        const p1z = -i * sinY + -gridSize * cosY;
        const p1y = 25 * cosX - p1z * sinX;
        const s1 = fov / (fov + (25 * sinX + p1z * cosX) + 200);

        const p2x = i * cosY + gridSize * sinY;
        const p2z = -i * sinY + gridSize * cosY;
        const p2y = 25 * cosX - p2z * sinX;
        const s2 = fov / (fov + (25 * sinX + p2z * cosX) + 200);

        ctx.beginPath();
        ctx.moveTo(cx + p1x * s1, cy + p1y * s1);
        ctx.lineTo(cx + p2x * s2, cy + p2y * s2);
        ctx.stroke();

        // Line along X
        const q1x = -gridSize * cosY + i * sinY;
        const q1z = gridSize * sinY + i * cosY;
        const q1y = 25 * cosX - q1z * sinX;
        const sq1 = fov / (fov + (25 * sinX + q1z * cosX) + 200);

        const q2x = gridSize * cosY + i * sinY;
        const q2z = -gridSize * sinY + i * cosY;
        const q2y = 25 * cosX - q2z * sinX;
        const sq2 = fov / (fov + (25 * sinX + q2z * cosX) + 200);

        ctx.beginPath();
        ctx.moveTo(cx + q1x * sq1, cy + q1y * sq1);
        ctx.lineTo(cx + q2x * sq2, cy + q2y * sq2);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Draw rotating radar beam
      const radarAngle = time * 2;
      const beamLen = 95;
      const bx = beamLen * Math.cos(radarAngle);
      const bz = beamLen * Math.sin(radarAngle);
      const bx1 = bx * cosY + bz * sinY;
      const bz1 = -bx * sinY + bz * cosY;
      const by2 = 25 * cosX - bz1 * sinX;
      const bs = fov / (fov + (25 * sinX + bz1 * cosX) + 200);

      ctx.save();
      const beamGrad = ctx.createLinearGradient(
        cx,
        cy + 25 * cosX * 0.8,
        cx + bx1 * bs,
        cy + by2 * bs,
      );
      beamGrad.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
      beamGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.strokeStyle = beamGrad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 20);
      ctx.lineTo(cx + bx1 * bs, cy + by2 * bs);
      ctx.stroke();
      ctx.restore();

      // 3. Project and draw module nodes
      const projected = modules.map((m) => {
        const x1 = m.x * cosY + m.z * sinY;
        const z1 = -m.x * sinY + m.z * cosY;
        const y2 = m.y * cosX - z1 * sinX;
        const z2 = m.y * sinX + z1 * cosX;

        const scale = fov / (fov + z2 + 200);
        return {
          ...m,
          px: cx + x1 * scale,
          py: cy + y2 * scale,
          pz: z2,
          scale,
        };
      });

      projected.sort((a, b) => a.pz - b.pz);

      // Connect modules with cyber telemetry lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.lineWidth = 1;
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        if (!p1) continue;
        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];
          if (!p2) continue;
          ctx.beginPath();
          ctx.moveTo(p1.px, p1.py);
          ctx.lineTo(p2.px, p2.py);
          ctx.stroke();
        }
      }

      // Draw 3D cubes / node heads
      for (const m of projected) {
        const size = 7 * m.scale;

        // Node fill color based on status
        let fillColor = 'rgba(6, 182, 212, 0.8)';
        let glowColor = 'rgba(6, 182, 212, 0.4)';
        if (m.status === 'warn') {
          fillColor = 'rgba(245, 158, 11, 0.9)';
          glowColor = 'rgba(245, 158, 11, 0.5)';
        } else if (m.status === 'err') {
          fillColor = 'rgba(239, 68, 68, 0.9)';
          glowColor = 'rgba(239, 68, 68, 0.5)';
        }

        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(m.px, m.py, size * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.arc(m.px, m.py, size, 0, Math.PI * 2);
        ctx.fill();

        // Node title
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = `${Math.max(9, Math.round(10 * m.scale))}px monospace`;
        ctx.fillText(m.name, m.px + size + 4, m.py + 3);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [healthy, unresolvedReportsCount, pendingClustersCount, abuseEvents24h, shouldReduceMotion]);

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
      0.2,
      Math.min(1.2, rotationRef.current.targetX - dy * 0.008),
    );
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        isDraggingRef.current = false;
      }}
      className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-5 shadow-2xl backdrop-blur-md"
      style={{
        boxShadow: '0 20px 48px -12px rgba(0, 0, 0, 0.4), inset 0 1px 0 var(--edge-specular)',
      }}
    >
      <div className="flex w-full items-center justify-between border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[rgba(6,182,212,0.3)] bg-[rgba(6,182,212,0.1)] text-[var(--cyan-bright)]">
            <Radio className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Consensus Mesh Telemetry
            </h3>
            <p className="text-[10px] text-[var(--text-tertiary)]">
              Interactive 3D Radar • Drag to tilt
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              healthy
                ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border border-red-500/30 bg-red-500/10 text-red-400'
            }`}
          >
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-current" />
            <span>{healthy ? 'SYSTEM HEALTHY' : 'INCIDENT DETECTED'}</span>
          </span>
        </div>
      </div>

      <div className="relative h-[240px] w-full cursor-grab active:cursor-grabbing">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="h-full w-full touch-none select-none"
          title="Consensus 3D Mesh Radar"
        />

        <div className="pointer-events-none absolute bottom-2 right-2 text-[10px] text-[var(--text-tertiary)]">
          {isHovered ? 'Drag to rotate 3D grid' : '3D Wireframe Active'}
        </div>
      </div>

      <div className="mt-2 grid w-full grid-cols-3 gap-2 border-t border-[var(--border-subtle)] pt-3 text-center text-xs">
        <div className="bg-[var(--surface-2)]/60 rounded-lg p-2">
          <div className="text-[10px] text-[var(--text-tertiary)]">Active Cycle</div>
          <div className="font-mono text-sm font-bold text-[var(--cyan-bright)]">
            #{activeCycleNumber}
          </div>
        </div>
        <div className="bg-[var(--surface-2)]/60 rounded-lg p-2">
          <div className="text-[10px] text-[var(--text-tertiary)]">Open Reports</div>
          <div
            className={`font-mono text-sm font-bold ${
              unresolvedReportsCount > 0 ? 'text-[var(--accent-warning)]' : 'text-emerald-400'
            }`}
          >
            {unresolvedReportsCount}
          </div>
        </div>
        <div className="bg-[var(--surface-2)]/60 rounded-lg p-2">
          <div className="text-[10px] text-[var(--text-tertiary)]">Sybil Clusters</div>
          <div
            className={`font-mono text-sm font-bold ${
              pendingClustersCount > 0 ? 'text-[var(--accent-warning)]' : 'text-emerald-400'
            }`}
          >
            {pendingClustersCount}
          </div>
        </div>
      </div>
    </div>
  );
}
