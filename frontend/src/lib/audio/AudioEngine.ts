import { SoundBlueprint, SoundSource, FMVoice, PhysicalPluckVoice } from "./types";
import { createFMVoice } from "./FMSynth";
import { createPhysicalPluckVoice } from "./KarplusStrong";
import { createProceduralImpulseResponse, createStereoPingPongDelay } from "./ReverbDelay";
import { backspaceSwoosh, errorTritone } from "./presets";

class AudioEngine {
  private static instance: AudioEngine | null = null;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private masterLimiter: DynamicsCompressorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.65;

  // Ambient Drone Layer
  private ambientGain: GainNode | null = null;
  private ambientOscs: OscillatorNode[] = [];
  private ambientLFO: OscillatorNode | null = null;
  private isAmbientActive: boolean = false;
  private currentAmbientFreq: number = 432;

  // Cached Convolution Reverb
  private convolverNode: ConvolverNode | null = null;

  private constructor() {}

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  public init(): void {
    if (typeof window === "undefined" || this.ctx) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn("[AudioEngine] Web Audio API is not supported in this environment.");
        return;
      }

      this.ctx = new AudioContextClass({ latencyHint: "interactive" });

      // 1. Master Limiter (Prevents any clipping or distortion)
      this.masterLimiter = this.ctx.createDynamicsCompressor();
      this.masterLimiter.threshold.setValueAtTime(-12, this.ctx.currentTime);
      this.masterLimiter.knee.setValueAtTime(4, this.ctx.currentTime);
      this.masterLimiter.ratio.setValueAtTime(12, this.ctx.currentTime);
      this.masterLimiter.attack.setValueAtTime(0.002, this.ctx.currentTime);
      this.masterLimiter.release.setValueAtTime(0.08, this.ctx.currentTime);

      // 2. Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);

      // 3. Visualizer Analyser (256 FFT Bins)
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      // 4. Procedural Convolution Reverb Cache
      this.convolverNode = this.ctx.createConvolver();
      this.convolverNode.buffer = createProceduralImpulseResponse(this.ctx, 2.8, 1.8);

      // Graph: MasterGain -> Analyser -> Limiter -> Destination
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.masterLimiter);
      this.masterLimiter.connect(this.ctx.destination);

      console.log("[AudioEngine] Advanced Multi-Paradigm Web Audio 2.0 DSP Engine initialized.");
    } catch (err) {
      console.warn("[AudioEngine] Initialization error:", err);
    }
  }

  public ensureContext(): void {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMasterVolume(vol: number): void {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        this.isMuted ? 0 : this.masterVolume,
        this.ctx.currentTime
      );
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getAnalyserNode(): AnalyserNode | null {
    return this.analyser;
  }

  public getAnalyserData(): Uint8Array | null {
    if (!this.analyser) return null;
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  // --- CONTINUOUS AMBIENT GENERATIVE DRONE ---
  public toggleAmbientDrone(targetFreq: number = 432): boolean {
    this.ensureContext();
    if (this.isAmbientActive) {
      this.stopAmbientDrone();
      return false;
    } else {
      this.startAmbientDrone(targetFreq);
      return true;
    }
  }

  public getIsAmbientActive(): boolean {
    return this.isAmbientActive;
  }

  public startAmbientDrone(targetFreq: number = 432): void {
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    this.stopAmbientDrone(); // Clean previous if any
    this.currentAmbientFreq = targetFreq;
    this.isAmbientActive = true;

    const now = this.ctx.currentTime;
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.0001, now);
    this.ambientGain.gain.linearRampToValueAtTime(0.12, now + 3.0); // Gentle 3-second fade in

    // Multi-Layer Harmonic Drone (Fundamental + Sub-Octave + Fifth)
    const freqs = [targetFreq * 0.5, targetFreq, targetFreq * 1.5];
    const oscTypes: OscillatorType[] = ["sine", "triangle", "sine"];

    this.ambientOscs = freqs.map((f, i) => {
      const osc = this.ctx!.createOscillator();
      osc.type = oscTypes[i % oscTypes.length];
      osc.frequency.setValueAtTime(f, now);
      if (i > 0) osc.detune.setValueAtTime((i % 2 === 0 ? 5 : -5), now);

      const filter = this.ctx!.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, now);

      osc.connect(filter);
      filter.connect(this.ambientGain!);
      osc.start(now);
      return osc;
    });

    // Slow Celestial LFO Breathing Filter
    const lfo = this.ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.08, now); // 12-second cycle
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(200, now);
    lfo.connect(lfoGain);

    this.ambientGain.connect(this.masterGain);
  }

  public setAmbientFrequency(newFreq: number): void {
    if (!this.ctx || !this.isAmbientActive) return;
    const now = this.ctx.currentTime;
    this.currentAmbientFreq = newFreq;

    const ratios = [0.5, 1.0, 1.5];
    this.ambientOscs.forEach((osc, i) => {
      const target = newFreq * (ratios[i] || 1.0);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, target), now + 2.0);
    });
  }

  public stopAmbientDrone(): void {
    if (!this.ctx || !this.ambientGain) {
      this.isAmbientActive = false;
      return;
    }
    const now = this.ctx.currentTime;
    this.ambientGain.gain.linearRampToValueAtTime(0.0001, now + 1.5);

    setTimeout(() => {
      this.ambientOscs.forEach((o) => {
        try { o.stop(); o.disconnect(); } catch {}
      });
      this.ambientOscs = [];
      try { this.ambientGain?.disconnect(); } catch {}
      this.ambientGain = null;
      this.isAmbientActive = false;
    }, 1600);
  }

  // --- PLAY PROCEDURAL BLUEPRINTS & VOICES ---
  public playBlueprint(blueprint: SoundBlueprint, customPitchHz?: number): void {
    this.ensureContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const duration = Math.max(0.05, blueprint.duration || 1.0);

    const bpOutput = this.ctx.createGain();
    bpOutput.gain.value = 0;

    // 1. Synthesize All Sound Sources
    blueprint.sources.forEach((src: SoundSource) => {
      if (src.type === "fm") {
        const fmNode = createFMVoice(
          this.ctx!,
          {
            ...src,
            carrierFrequency: customPitchHz || src.carrierFrequency,
          },
          blueprint.envelope,
          now,
          duration
        );
        fmNode.connect(bpOutput);
      } else if (src.type === "pluck") {
        const pluckNode = createPhysicalPluckVoice(
          this.ctx!,
          {
            ...src,
            frequency: customPitchHz || src.frequency,
          },
          blueprint.envelope,
          now,
          duration
        );
        pluckNode.connect(bpOutput);
      } else if (src.type === "noise") {
        const noiseNode = this.createNoiseSource(src.noiseType, now, duration);
        noiseNode.connect(bpOutput);
      } else {
        const osc = this.ctx!.createOscillator();
        osc.type = src.oscillatorType;
        const baseFreq = customPitchHz || src.frequency;
        osc.frequency.setValueAtTime(baseFreq, now);
        if (src.detune) osc.detune.setValueAtTime(src.detune, now);

        const oscGain = this.ctx!.createGain();
        const vol = src.volumeDb ? Math.pow(10, src.volumeDb / 20) : 0.5;
        oscGain.gain.setValueAtTime(vol, now);

        osc.connect(oscGain);
        oscGain.connect(bpOutput);

        osc.start(now);
        osc.stop(now + duration + 0.1);
      }
    });

    // 2. Main ADSR Envelope Node
    const envNode = this.ctx.createGain();
    const env = blueprint.envelope;
    const attackEnd = now + Math.max(0.002, env.attack);
    const decayEnd = attackEnd + Math.max(0.01, env.decay);

    envNode.gain.setValueAtTime(0.0001, now);
    envNode.gain.linearRampToValueAtTime(1.0, attackEnd);
    envNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, env.sustain), decayEnd);
    envNode.gain.linearRampToValueAtTime(0.0001, now + duration);

    bpOutput.connect(envNode);

    // 3. Filter Processing
    let lastNode: AudioNode = envNode;
    if (blueprint.filter) {
      const filter = this.ctx.createBiquadFilter();
      filter.type = blueprint.filter.type;
      filter.frequency.setValueAtTime(blueprint.filter.frequency, now);
      filter.Q.setValueAtTime(blueprint.filter.Q, now);
      lastNode.connect(filter);
      lastNode = filter;
    }

    // 4. FX Routing (Stereo Delay & Algorithmic Reverb)
    if (blueprint.effects?.delay) {
      const delay = createStereoPingPongDelay(
        this.ctx,
        blueprint.effects.delay.delayTime,
        blueprint.effects.delay.feedback
      );
      lastNode.connect(delay.input);
      delay.output.connect(this.masterGain);
    }

    if (blueprint.effects?.reverb && this.convolverNode) {
      const reverbSend = this.ctx.createGain();
      reverbSend.gain.setValueAtTime(blueprint.effects.reverb.mix || 0.3, now);
      lastNode.connect(reverbSend);
      reverbSend.connect(this.convolverNode);
      this.convolverNode.connect(this.masterGain);
    }

    lastNode.connect(this.masterGain);
  }

  // --- NOISE GENERATOR BUFFER ---
  private createNoiseSource(type: "white" | "pink" | "brown", startTime: number, duration: number): AudioNode {
    const sampleRate = this.ctx!.sampleRate;
    const bufferSize = Math.floor(sampleRate * Math.min(duration, 5.0));
    const buffer = this.ctx!.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === "white") {
        data[i] = white * 0.3;
      } else if (type === "brown") {
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 1.5;
      } else {
        // Pink noise filter
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    }

    const source = this.ctx!.createBufferSource();
    source.buffer = buffer;
    source.start(startTime);
    source.stop(startTime + duration);
    return source;
  }

  // --- HAPTIC UI FEEDBACK SOUNDS ---
  public playUIClick(): void {
    this.playBlueprint({
      sources: [{ type: "oscillator", oscillatorType: "sine", frequency: 1800 }],
      envelope: { attack: 0.001, decay: 0.03, sustain: 0.0, release: 0.01 },
      duration: 0.04,
    });
  }

  public playUIHover(): void {
    this.playBlueprint({
      sources: [{ type: "oscillator", oscillatorType: "triangle", frequency: 1200 }],
      envelope: { attack: 0.005, decay: 0.04, sustain: 0.0, release: 0.01 },
      duration: 0.05,
    });
  }

  public playUIChime(freq: number = 880): void {
    this.playBlueprint({
      sources: [
        { type: "oscillator", oscillatorType: "sine", frequency: freq },
        { type: "oscillator", oscillatorType: "sine", frequency: freq * 2.01, detune: 4 },
      ],
      envelope: { attack: 0.005, decay: 0.4, sustain: 0.1, release: 0.6 },
      filter: { type: "lowpass", frequency: 3500, Q: 2 },
      effects: { reverb: { decay: 1.5, mix: 0.3 } },
      duration: 0.8,
    });
  }

  public playKeystrokePitch(char: string): void {
    const code = char.charCodeAt(0) || 65;
    const baseFreq = 260 + (code % 32) * 28; // 260 Hz to ~1130 Hz

    this.playBlueprint({
      sources: [
        { type: "oscillator", oscillatorType: "sine", frequency: baseFreq },
        { type: "oscillator", oscillatorType: "triangle", frequency: baseFreq * 2, detune: 6 },
      ],
      envelope: { attack: 0.003, decay: 0.08, sustain: 0.0, release: 0.05 },
      duration: 0.14,
    });
  }

  public playBackspace(): void {
    this.playBlueprint(backspaceSwoosh);
  }

  public playError(): void {
    this.playBlueprint(errorTritone);
  }
}

export const audioEngine = AudioEngine.getInstance();