/**
 * Algorithmic Reverb and Delay DSP processor for Web Audio API.
 * Synthesizes procedural stereo impulse responses in memory (zero audio asset downloads).
 */

export function createProceduralImpulseResponse(
  ctx: AudioContext,
  durationSeconds: number = 2.5,
  decayRate: number = 2.0
): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * Math.max(0.2, durationSeconds));
  const impulse = ctx.createBuffer(2, length, sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    // Exponential decay curve
    const envelope = Math.exp(-t * decayRate);
    // Gaussian white noise with stereo decorrelation
    const noiseL = (Math.random() * 2 - 1) * envelope;
    const noiseR = (Math.random() * 2 - 1) * envelope;

    left[i] = noiseL;
    right[i] = noiseR;
  }

  return impulse;
}

export function createStereoPingPongDelay(
  ctx: AudioContext,
  delayTimeSeconds: number = 0.25,
  feedbackAmount: number = 0.35
): {
  input: GainNode;
  output: GainNode;
} {
  const input = ctx.createGain();
  const output = ctx.createGain();

  const delayL = ctx.createDelay(2.0);
  const delayR = ctx.createDelay(2.0);
  const feedbackGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  delayL.delayTime.value = delayTimeSeconds;
  delayR.delayTime.value = delayTimeSeconds * 1.5; // Cross-stereo offset

  feedbackGain.gain.value = Math.min(0.9, Math.max(0, feedbackAmount));
  filter.type = "lowpass";
  filter.frequency.value = 3500; // Warm analog tape damping

  // Routing: input -> delayL -> delayR -> feedback -> input
  input.connect(delayL);
  delayL.connect(filter);
  filter.connect(feedbackGain);
  feedbackGain.connect(delayR);
  delayR.connect(filter);

  delayL.connect(output);
  delayR.connect(output);

  return { input, output };
}