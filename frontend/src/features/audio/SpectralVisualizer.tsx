'use client';

import React, { useRef, useEffect } from "react";
import { Activity } from "lucide-react";
import { audioEngine } from "@/lib/audio/AudioEngine";

interface SpectralVisualizerProps {
  lastPlayed: string | null;
}

export function SpectralVisualizer({ lastPlayed }: SpectralVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const data = audioEngine.getAnalyserData();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (data) {
        const barWidth = (canvas.width / data.length) * 2.5;
        let x = 0;

        for (let i = 0; i < data.length; i++) {
          const barHeight = (data[i] / 255) * canvas.height;
          const r = Math.min(255, 16 + data[i]);
          const g = Math.min(255, 185 + data[i] * 0.3);
          const b = Math.min(255, 129 + data[i] * 0.5);

          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="rounded-2xl bg-mercury-900/40 border border-slate-800 p-5 flex flex-col justify-between backdrop-blur-md">
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
        <span className="flex items-center gap-1.5 font-medium">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          FFT Spectral Monitor
        </span>
        <span className="text-[11px] text-emerald-400">48 kHz • 256 Bins</span>
      </div>
      <canvas
        ref={canvasRef}
        width={300}
        height={90}
        className="w-full h-24 rounded-lg bg-mercury-950/80 border border-slate-900 shadow-inner"
      />
      <div className="text-[11px] font-mono text-slate-500 mt-2 truncate">
        Last Active Cue: <span className="text-slate-300 font-semibold">{lastPlayed || "Idle"}</span>
      </div>
    </div>
  );
}