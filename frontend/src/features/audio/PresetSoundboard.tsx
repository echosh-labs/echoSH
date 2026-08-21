'use client';

import React, { useState } from "react";
import { Play } from "lucide-react";
import { audioPresets } from "@/lib/audio/presets";
import { AudioPreset } from "@/lib/audio/types";

interface PresetSoundboardProps {
  onPlayPreset: (preset: AudioPreset) => void;
}

const CATEGORIES = [
  "All",
  "Planetary & Esoteric",
  "Percussion",
  "Sound Effects",
  "Instruments",
  "Pads & Drones",
];

export function PresetSoundboard({ onPlayPreset }: PresetSoundboardProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredPresets =
    activeCategory === "All"
      ? audioPresets
      : audioPresets.filter((p) => p.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
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

      {/* Preset Cards Grid */}
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
                onClick={() => onPlayPreset(preset)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono transition-all"
              >
                <Play className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                <span>Synthesize</span>
              </button>
              {preset.rawCommand && (
                <span
                  className="text-[10px] font-mono text-slate-500 truncate max-w-[140px]"
                  title={preset.rawCommand}
                >
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