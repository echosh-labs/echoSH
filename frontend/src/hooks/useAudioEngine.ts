'use client';

import { useState, useEffect, useCallback } from "react";
import { audioEngine } from "@/lib/audio/AudioEngine";
import { audioPresets } from "@/lib/audio/presets";
import { AudioPreset, SoundBlueprint } from "@/lib/audio/types";

export function useAudioEngine() {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [lastPlayed, setLastPlayed] = useState<string | null>(null);

  useEffect(() => {
    setIsMuted(audioEngine.getIsMuted());

    const handleFirstGesture = () => {
      audioEngine.ensureContext();
      window.removeEventListener("click", handleFirstGesture);
      window.removeEventListener("keydown", handleFirstGesture);
    };

    window.addEventListener("click", handleFirstGesture);
    window.addEventListener("keydown", handleFirstGesture);

    return () => {
      window.removeEventListener("click", handleFirstGesture);
      window.removeEventListener("keydown", handleFirstGesture);
    };
  }, []);

  const toggleMute = useCallback(() => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
    return muted;
  }, []);

  const playBlueprint = useCallback((bp: SoundBlueprint, name?: string) => {
    audioEngine.playBlueprint(bp);
    if (name || bp.name) {
      setLastPlayed(name || bp.name || "Custom Synthesis");
    }
  }, []);

  const playPreset = useCallback((preset: AudioPreset) => {
    audioEngine.playBlueprint(preset.blueprint);
    setLastPlayed(preset.name);
  }, []);

  const playKeystroke = useCallback((char: string) => {
    audioEngine.playKeystroke(char);
  }, []);

  const playBackspace = useCallback(() => {
    audioEngine.playBackspace();
  }, []);

  const playError = useCallback(() => {
    audioEngine.playError();
  }, []);

  return {
    isMuted,
    lastPlayed,
    toggleMute,
    playBlueprint,
    playPreset,
    playKeystroke,
    playBackspace,
    playError,
    getAnalyserData: () => audioEngine.getAnalyserData(),
  };
}