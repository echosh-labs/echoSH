import { PhysicalPluckVoice, EnvelopeConfig } from "./types";

/**
 * Karplus-Strong Physical Modeling Plucked String Synthesizer Voice.
 * Injects a micro-burst of noise into an acoustic feedback loop tuned to target frequency.
 */
export function createPhysicalPluckVoice(
  ctx: AudioContext,
  voice: PhysicalPluckVoice,
  overallEnvelope: EnvelopeConfig,
  startTime: number,
  duration: number
): GainNode {
  const voiceOutput = ctx.createGain();
  voiceOutput.gain.value = 0;

  const targetFreq = Math.max(20, voice.frequency);
  const periodSeconds = 1.0 / targetFreq;

  // 1. Excitation Noise Burst Buffer
  const burstLength = Math.max(64, Math.floor(ctx.sampleRate * periodSeconds));
  const burstBuffer = ctx.createBuffer(1, burstLength, ctx.sampleRate);
  const burstData = burstBuffer.getChannelData(0);

  for (let i = 0; i < burstLength; i++) {
    burstData[i] = (Math.random() * 2 - 1) * Math.exp((-i / burstLength) * 3);
  }

  const burstSource = ctx.createBufferSource();
  burstSource.buffer = burstBuffer;

  // 2. Feedback Delay Line
  const delayNode = ctx.createDelay(1.0);
  delayNode.delayTime.setValueAtTime(periodSeconds, startTime);

  // 3. String Damping Lowpass Filter
  const dampingFilter = ctx.createBiquadFilter();
  dampingFilter.type = "lowpass";
  const brightness = Math.max(1.0, voice.brightness || 4.0);
  dampingFilter.frequency.setValueAtTime(
    Math.min(18000, targetFreq * brightness),
    startTime
  );

  // 4. Feedback Gain (Decay / Sustain factor)
  const feedbackGain = ctx.createGain();
  const dampingFactor = Math.min(0.99, Math.max(0.7, 1.0 - (voice.damping || 0.05)));
  feedbackGain.gain.setValueAtTime(dampingFactor, startTime);

  // Loop: Burst -> Delay -> Filter -> Feedback -> Delay
  burstSource.connect(delayNode);
  delayNode.connect(dampingFilter);
  dampingFilter.connect(feedbackGain);
  feedbackGain.connect(delayNode);

  // Output tap
  const pluckGain = ctx.createGain();
  const targetGain = voice.volumeDb ? Math.pow(10, voice.volumeDb / 20) : 0.6;
  pluckGain.gain.setValueAtTime(targetGain, startTime);

  dampingFilter.connect(pluckGain);
  pluckGain.connect(voiceOutput);

  // Trigger Burst
  burstSource.start(startTime);
  burstSource.stop(startTime + 0.1);

  return voiceOutput;
}