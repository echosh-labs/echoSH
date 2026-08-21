'use client';

import { useCallback } from "react";
import { audioEngine } from "@/lib/audio/AudioEngine";
import { SoundBlueprint } from "@/lib/audio/types";

export function useSoundEffect() {
  const playClick = useCallback(() => {
    audioEngine.playUIClick();
  }, []);

  const playHover = useCallback(() => {
    audioEngine.playUIHover();
  }, []);

  const playChime = useCallback((freq: number = 880) => {
    audioEngine.playUIChime(freq);
  }, []);

  const playBlueprint = useCallback((blueprint: SoundBlueprint, customPitchHz?: number) => {
    audioEngine.playBlueprint(blueprint, customPitchHz);
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

  return {
    playClick,
    playHover,
    playChime,
    playBlueprint,
    playKeystroke,
    playBackspace,
    playError,
  };
}