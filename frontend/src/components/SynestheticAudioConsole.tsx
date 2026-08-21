'use client';

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Play, Sparkles, Terminal, Activity, Music, Radio } from "lucide-react";
import { audioEngine } from "@/lib/audio/AudioEngine";
import { audioPresets } from "@/lib/audio/presets";
import { AudioPreset } from "@/lib/audio/types";

export function SynestheticAudioConsole() {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [lastPlayed, setLastPlayed] = useState<string | null>(null);
  const [typedChars, setTypedChars] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize engine on first interaction
  useEffect(() => {
    const handleGesture = () => {
      audioEngine.ensureContext();
      window.removeEventListener("click", handleGesture);
      window.removeEventListener("keydown", handleGesture);
    };
    window.addEventListener("click", handleGesture);
    window.addEventListener("keydown", handleGesture);
    return () => {
      window.removeEventListener("click", handleGesture);
      window.removeEventListener("keydown", handleGesture);
    };
  }, []);

  // Real-time FFT Audio Visualizer Loop
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

  const handleToggleMute = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  const handlePlayPreset = (preset: AudioPreset) => {
    audioEngine.playBlueprint(preset.blueprint);
    setLastPlayed(preset.name);
  };

  const handleKeyTyping = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      audioEngine.playBackspace();
      setTypedChars((prev) => prev.slice(0, -1));
    } else if (e.key === "Enter") {
      audioEngine.playBlueprint(audioPresets[0].blueprint);
      setTypedChars("");
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      audioEngine.playKeystroke(e.key);
      setTypedChars((prev) => (prev + e.key).slice(-30));
    }
  };

  const categories = ["All", "Planetary & Esoteric", "Percussion", "Sound Effects", "Instruments", "Pads & Drones"];
  const filteredPresets = activeCategory === "All"
    ? audioPresets
    : audioPresets.filter((p) => p.category === activeCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-mono text-sm tracking-wider uppercase font-semibold">
              // Procedural DSP Engine
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              Web Audio 2.0
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100 mt-1">
            Synesthetic Audio Synthesizer
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl font-light">
            Procedural, mathematical sound synthesis with zero static audio files. Experience real-time keystroke harmony, planetary octaves, and declarative sound blueprints.
          </p>
        </div>

        <button
          onClick={handleToggleMute}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all border ${
            isMuted
              ? "bg-rose-950/40 border-rose-500/40 text-rose-400 hover:bg-rose-900/50"
              : "bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
          <span>{isMuted ? "ENGINE MUTED" : "AUDIO ACTIVE"}</span>
        </button>
      </div>

      {/* Real-time Waveform Visualizer & Interactive Typing Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visualizer Canvas */}
        <div className="lg:col-span-1 rounded-2xl bg-mercury-900/40 border border-slate-800 p-5 flex flex-col justify-between backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
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

        {/* Interactive Synesthetic Keystroke Pad */}
        <div className="lg:col-span-2 rounded-2xl bg-mercury-900/40 border border-slate-800 p-5 flex flex-col justify-between backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                Live Synesthetic Keystroke Tester
              </span>
              <span className="text-[11px] text-slate-500">250Hz - 1200Hz Dynamic Range</span>
            </div>
            <input
              type="text"
              placeholder="Type anything here to test real-time keystroke pitch synthesis..."
              onKeyDown={handleKeyTyping}
              className="w-full px-4 py-3 rounded-xl bg-mercury-950/90 border border-slate-700/80 text-sm font-mono text-emerald-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 shadow-inner"
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <div>
              Buffer: <span className="text-emerald-400">{typedChars || "Ready..."}</span>
            </div>
            <div className="text-slate-500">
              [Backspace] = Swoosh • [Enter] = Orbital Bell
            </div>
          </div>
        </div>
      </div>

      {/* Preset Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              activeCategory === cat
                ? "bg-slate-800 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)] font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Preset Soundboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPresets.map((preset) => (
          <div
            key={preset.name}
            className="rounded-xl bg-mercury-900/30 border border-slate-800/80 p-4 hover:border-emerald-500/30 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-serif font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                  {preset.name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {preset.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-light leading-relaxed mb-3">
                {preset.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
              <button
                onClick={() => handlePlayPreset(preset)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono transition-all"
              >
                <Play className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                <span>Synthesize</span>
              </button>
              {preset.rawCommand && (
                <span className="text-[10px] font-mono text-slate-500 truncate max-w-[150px]" title={preset.rawCommand}>
                  {preset.rawCommand}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}