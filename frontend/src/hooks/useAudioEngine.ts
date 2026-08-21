'use client';

import { useState, useEffect, useCallback } from "react";
import { audioEngine } from "@/lib/audio/AudioEngine";
import { AudioPreset, SoundBlueprint } from "@/lib/audio/types";

export function useAudioEngine() {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [masterVolume, setMasterVolumeState] = useState<number>(0.65);
  const [isAmbientActive, setIsAmbientActive] = useState<boolean>(false);
  const [lastPlayed, setLastPlayed] = useState<string | null>(null);

  useEffect(() => {
    setIsMuted(audioEngine.getIsMuted());
    setMasterVolumeState(audioEngine.getMasterVolume());
    setIsAmbientActive(audioEngine.getIsAmbientActive());

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

  const setMasterVolume = useCallback((vol: number) => {
    audioEngine.setMasterVolume(vol);
    setMasterVolumeState(vol);
  }, []);

  const toggleAmbient = useCallback((targetFreq: number = 432) => {
    const active = audioEngine.toggleAmbientDrone(targetFreq);
    setIsAmbientActive(active);
    return active;
  }, []);

  const setAmbientFrequency = useCallback((freq: number) => {
    audioEngine.setAmbientFrequency(freq);
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
    audioEngine.playKeystrokePitch(char);
  }, []);

  const playBackspace = useCallback(() => {
    audioEngine.playBackspace();
  }, []);

  const playError = useCallback(() => {
    audioEngine.playError();
  }, []);

  const playUIClick = useCallback(() => {
    audioEngine.playUIClick();
  }, []);

  const playUIHover = useCallback(() => {
    audioEngine.playUIHover();
  }, []);

  const playUIChime = useCallback((freq: number = 880) => {
    audioEngine.playUIChime(freq);
  }, []);

  return {
    isMuted,
    masterVolume,
    isAmbientActive,
    lastPlayed,
    toggleMute,
    setMasterVolume,
    toggleAmbient,
    setAmbientFrequency,
    playBlueprint,
    playPreset,
    playKeystroke,
    playBackspace,
    playError,
    playUIClick,
    playUIHover,
    playUIChime,
  };
}