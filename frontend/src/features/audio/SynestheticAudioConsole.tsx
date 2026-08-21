'use client';

import React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { SpectralVisualizer } from "./SpectralVisualizer";
import { KeystrokePad } from "./KeystrokePad";
import { PresetSoundboard } from "./PresetSoundboard";
import { audioPresets } from "@/lib/audio/presets";

export function SynestheticAudioConsole() {
  const {
    isMuted,
    lastPlayed,
    toggleMute,
    playPreset,
    playBlueprint,
    playKeystroke,
    playBackspace,
  } = useAudioEngine();

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
          onClick={toggleMute}
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
        <SpectralVisualizer lastPlayed={lastPlayed} />
        <div className="lg:col-span-2">
          <KeystrokePad
            onKeystroke={playKeystroke}
            onBackspace={playBackspace}
            onEnter={() => playBlueprint(audioPresets[0].blueprint, audioPresets[0].name)}
          />
        </div>
      </div>

      {/* Preset Soundboard Grid */}
      <PresetSoundboard onPlayPreset={playPreset} />
    </div>
  );
}