'use client';

import React, { useRef, useEffect, useState } from "react";
import { Flame, Droplets, Sparkles, RefreshCw } from "lucide-react";
import { AlchemicalPrinciple } from "@/types";

interface AlchemicalCrucibleProps {
  principles: AlchemicalPrinciple[];
}

export function AlchemicalCrucible({ principles }: AlchemicalCrucibleProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activePrinciple, setActivePrinciple] = useState(0);

  // Interactive Liquid Quicksilver Fluid Particle Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = 320);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 320;
    };
    window.addEventListener("resize", handleResize);

    // Particles array simulating mercury droplets
    const particleCount = 45;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      glow: string;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 8 + 4,
        color: i % 3 === 0 ? "#10b981" : "#e2e8f0",
        glow: i % 3 === 0 ? "rgba(16,185,129,0.5)" : "rgba(226,232,240,0.4)",
      });
    }

    let mouseX = width / 2;
    let mouseY = height / 2;
    let isHovering = false;

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      isHovering = true;
    };

    const onMouseLeave = () => {
      isHovering = false;
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle background grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Update and draw droplets
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Interaction with mouse (attraction / fluidity)
        if (isHovering) {
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            p.vx += (dx / dist) * 0.15;
            p.vy += (dy / dist) * 0.15;
          }
        }

        // Apply friction
        p.vx *= 0.98;
        p.vy *= 0.98;

        p.x += p.vx;
        p.y += p.vy;

        // Boundary bounce
        if (p.x < p.radius) { p.x = p.radius; p.vx *= -1; }
        if (p.x > width - p.radius) { p.x = width - p.radius; p.vx *= -1; }
        if (p.y < p.radius) { p.y = p.radius; p.vy *= -1; }
        if (p.y > height - p.radius) { p.y = height - p.radius; p.vy *= -1; }

        // Draw connections / surface tension between nearby drops
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 75) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(226, 232, 240, ${0.35 * (1 - dist / 75)})`;
            ctx.lineWidth = (p.radius + p2.radius) / 6;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Draw particle droplet
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.glow;
        ctx.shadowBlur = 12;
        ctx.fill();

        // Highlight glint
        ctx.beginPath();
        ctx.arc(p.x - p.radius * 0.3, p.y - p.radius * 0.3, p.radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.75)";
        ctx.fill();
        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const principle = principles[activePrinciple];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono mb-3">
          <Droplets className="w-3.5 h-3.5 text-emerald-400" />
          <span>HYDRARGYRUM & THE TRIA PRIMA</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-4xl font-bold text-silver-gradient">
          The Alchemical Crucible
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto mt-2">
          In the Paracelsian Great Work, Quicksilver (Mercury) serves as the universal fluid medium uniting Sulfur (Soul) and Salt (Body).
        </p>
      </div>

      {/* Quicksilver Fluid Physics Canvas */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-700/60 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2 px-2">
          <span>Interactive Quicksilver Canvas (Move mouse to coalesce droplets)</span>
          <span className="text-emerald-400">Element 80: Hydrargyrum (Hg)</span>
        </div>
        <canvas ref={canvasRef} className="w-full h-80 rounded-xl bg-slate-950 cursor-crosshair" />
      </div>

      {/* Tria Prima Selector & Deep Dive */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {principles.map((p, idx) => (
          <div
            key={p.principle}
            onClick={() => setActivePrinciple(idx)}
            className={`p-6 rounded-2xl border cursor-pointer transition-all ${
              activePrinciple === idx
                ? "glass-panel-emerald border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                : "glass-panel border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="font-serif text-3xl text-emerald-400 font-bold">{p.symbol}</span>
              <span className="text-[11px] font-mono text-slate-400">{p.latin_name}</span>
            </div>
            <h4 className="font-serif text-lg font-bold text-slate-100">{p.principle}</h4>
            <p className="text-xs font-mono text-emerald-400/90 mt-0.5">{p.role}</p>
            <p className="text-xs text-slate-300 leading-relaxed font-light mt-3">{p.description}</p>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1">
              {p.properties?.map((prop, propIdx) => (
                <span
                  key={propIdx}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/80 text-slate-400 border border-slate-800"
                >
                  {prop}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
