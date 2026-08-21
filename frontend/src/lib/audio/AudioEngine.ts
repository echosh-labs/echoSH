import { SoundBlueprint, SoundSource } from "./types";
import { backspaceSwoosh, errorTritone } from "./presets";

class AudioEngine {
  private static instance: AudioEngine | null = null;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private masterLimiter: DynamicsCompressorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isMuted: boolean = false;

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

      // Master Limiter
      this.masterLimiter = this.ctx.createDynamicsCompressor();
      this.masterLimiter.threshold.setValueAtTime(-12, this.ctx.currentTime);
      this.masterLimiter.knee.setValueAtTime(4, this.ctx.currentTime);
      this.masterLimiter.ratio.setValueAtTime(12, this.ctx.currentTime);
      this.masterLimiter.attack.setValueAtTime(0.002, this.ctx.currentTime);
      this.masterLimiter.release.setValueAtTime(0.08, this.ctx.currentTime);

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.65, this.ctx.currentTime);

      // Visualizer Analyser
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      // Graph: MasterGain -> Analyser -> Limiter -> Destination
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.masterLimiter);
      this.masterLimiter.connect(this.ctx.destination);

      console.log("[AudioEngine] Native Web Audio DSP engine active.");
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

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.65, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getAnalyserData(): Uint8Array | null {
    if (!this.analyser) return null;
    const buffer = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(buffer);
    return buffer;
  }

  // --- High-Performance Keystroke Synthesis ---
  public playKeystroke(char: string): void {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const isSpecial = /[^\w\s]/.test(char);
    const freq = isSpecial ? 1200 : 250 + ((char.charCodeAt(0) * 5) % 800);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isSpecial ? "sine" : "triangle";
    osc.frequency.setValueAtTime(freq, now);

    // Ultra-snappy envelope
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.25, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  public playBackspace(): void {
    this.playBlueprint(backspaceSwoosh);
  }

  public playError(): void {
    this.playBlueprint(errorTritone);
  }

  // --- Declarative Sound Blueprint Player ---
  public playBlueprint(bp: SoundBlueprint): void {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const dur = bp.duration || 0.5;

    // 1. Envelope Gain
    const ampGain = ctx.createGain();
    const env = bp.envelope;
    const attack = Math.max(0.002, env.attack);
    const decay = Math.max(0.01, env.decay);
    const sustain = Math.max(0.0001, Math.min(1.0, env.sustain));
    const release = Math.max(0.01, env.release);

    ampGain.gain.setValueAtTime(0.0001, now);
    ampGain.gain.exponentialRampToValueAtTime(0.8, now + attack);
    ampGain.gain.exponentialRampToValueAtTime(sustain * 0.8, now + attack + decay);
    ampGain.gain.setValueAtTime(sustain * 0.8, now + dur);
    ampGain.gain.exponentialRampToValueAtTime(0.0001, now + dur + release);

    // 2. Filter (if defined)
    let outputNode: AudioNode = ampGain;
    let filterNode: BiquadFilterNode | null = null;
    if (bp.filter) {
      filterNode = ctx.createBiquadFilter();
      filterNode.type = bp.filter.type;
      filterNode.frequency.setValueAtTime(bp.filter.frequency, now);
      filterNode.Q.setValueAtTime(bp.filter.Q, now);
      if (bp.filter.gain !== undefined) {
        filterNode.gain.setValueAtTime(bp.filter.gain, now);
      }
      ampGain.connect(filterNode);
      outputNode = filterNode;
    }

    // 3. Effects Chain (Delay, Reverb, Panner)
    if (bp.effects?.delay) {
      const delay = ctx.createDelay();
      const delayFeedback = ctx.createGain();
      const delayGain = ctx.createGain();

      delay.delayTime.setValueAtTime(bp.effects.delay.delayTime, now);
      delayFeedback.gain.setValueAtTime(bp.effects.delay.feedback, now);
      delayGain.gain.setValueAtTime(bp.effects.delay.mix, now);

      outputNode.connect(delay);
      delay.connect(delayFeedback);
      delayFeedback.connect(delay);
      delay.connect(delayGain);
      delayGain.connect(this.masterGain);
    }

    if (bp.effects?.panner && "createStereoPanner" in ctx) {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(bp.effects.panner.pan, now);
      outputNode.connect(panner);
      outputNode = panner;
    }

    outputNode.connect(this.masterGain);

    // 4. Oscillators & Noise Sources
    const createdOscs: OscillatorNode[] = [];
    bp.sources.forEach((source: SoundSource) => {
      if (source.type === "oscillator") {
        const osc = ctx.createOscillator();
        osc.type = source.oscillatorType;
        osc.frequency.setValueAtTime(source.frequency, now);
        if (source.detune) {
          osc.detune.setValueAtTime(source.detune, now);
        }
        osc.connect(ampGain);
        osc.start(now);
        osc.stop(now + dur + release + 0.1);
        createdOscs.push(osc);
      } else if (source.type === "noise") {
        const noiseNode = this.createNoiseBuffer(source.noiseType, dur + release + 0.1);
        if (noiseNode) {
          noiseNode.connect(ampGain);
          noiseNode.start(now);
          noiseNode.stop(now + dur + release + 0.1);
        }
      }
    });

    // 5. LFO Modulation
    if (bp.lfo) {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = bp.lfo.type;
      lfo.frequency.setValueAtTime(bp.lfo.frequency, now);
      lfoGain.gain.setValueAtTime(bp.lfo.depth, now);

      lfo.connect(lfoGain);

      if (bp.lfo.target === "frequency") {
        createdOscs.forEach((o) => lfoGain.connect(o.frequency));
      } else if (bp.lfo.target === "filterCutoff" && filterNode) {
        lfoGain.connect(filterNode.frequency);
      }

      lfo.start(now);
      lfo.stop(now + dur + release + 0.1);
    }
  }

  // --- Procedural Noise Generator ---
  private createNoiseBuffer(type: "white" | "pink" | "brown", durationSec: number): AudioBufferSourceNode | null {
    if (!this.ctx) return null;
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = Math.floor(sampleRate * durationSec);
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const output = buffer.getChannelData(0);

    if (type === "white") {
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    } else if (type === "pink") {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    } else if (type === "brown") {
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Gain compensation
      }
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    return noiseSource;
  }
}

export const audioEngine = AudioEngine.getInstance();