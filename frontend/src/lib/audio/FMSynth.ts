import { FMVoice, EnvelopeConfig } from "./types";

/**
 * 2-Operator / Multi-Operator Frequency Modulation (FM) Synthesizer Voice.
 * Modulator node modulates the instantaneous frequency of the Carrier node.
 */
export function createFMVoice(
  ctx: AudioContext,
  voice: FMVoice,
  overallEnvelope: EnvelopeConfig,
  startTime: number,
  duration: number
): GainNode {
  const voiceOutput = ctx.createGain();
  voiceOutput.gain.value = 0;

  const carrier = ctx.createOscillator();
  carrier.type = voice.carrierType;
  carrier.frequency.setValueAtTime(voice.carrierFrequency, startTime);

  const modulator = ctx.createOscillator();
  modulator.type = voice.modulatorType;
  const modFreq = voice.carrierFrequency * Math.max(0.1, voice.modRatio);
  modulator.frequency.setValueAtTime(modFreq, startTime);

  // Modulation Index Gain Node (Depth of frequency deviation in Hz)
  const modGain = ctx.createGain();
  const baseIndex = voice.modIndex || 100;
  modGain.gain.setValueAtTime(baseIndex, startTime);

  // Apply Modulator Envelope if defined
  const modEnv = voice.modEnvelope || overallEnvelope;
  const attackEnd = startTime + Math.max(0.005, modEnv.attack);
  const decayEnd = attackEnd + Math.max(0.01, modEnv.decay);

  modGain.gain.setValueAtTime(0, startTime);
  modGain.gain.linearRampToValueAtTime(baseIndex, attackEnd);
  modGain.gain.exponentialRampToValueAtTime(Math.max(1, baseIndex * modEnv.sustain), decayEnd);
  modGain.gain.linearRampToValueAtTime(0, startTime + duration);

  // FM Connection: Modulator -> ModGain -> Carrier.frequency
  modulator.connect(modGain);
  modGain.connect(carrier.frequency);

  // Carrier Voice Gain
  const carrierGain = ctx.createGain();
  carrier.connect(carrierGain);
  carrierGain.connect(voiceOutput);

  // Voice level
  const targetGain = voice.volumeDb ? Math.pow(10, voice.volumeDb / 20) : 0.4;
  carrierGain.gain.setValueAtTime(targetGain, startTime);

  // Start & Stop
  modulator.start(startTime);
  carrier.start(startTime);

  modulator.stop(startTime + duration + 0.1);
  carrier.stop(startTime + duration + 0.1);

  return voiceOutput;
}