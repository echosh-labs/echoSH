/**
 * @file audioEngine.ts
 * @description Core module for generative audio. Manages a cache of reusable
 * instruments and can also generate dynamic, one-off sounds from blueprints.
 * This engine creates sounds from scratch based on declarative blueprints.
 */

import {
  SoundBlueprint
} from './audioBlueprints';
import * as Tone from 'tone';

interface ExtendedWindow extends Window {
  AudioContext?: typeof AudioContext
  webkitAudioContext?: typeof AudioContext
}

interface CustomAudioContext extends AudioContext {
  sinkId?: string
}

export interface LatencyInfo {
  baseLatency: number
  outputLatency: number
  sinkId: string
}

class AudioEngine {
  private static instance: AudioEngine
  private audioContext: CustomAudioContext | null = null
  private mainGain: Tone.Gain | null = null;
  private keystrokeSynth: Tone.PolySynth | null = null;
  private instruments: Map<string, Tone.PolySynth> = new Map();

  // Private constructor is intentional for the singleton pattern.
  private constructor() {
    /* linter-disable-line no-empty-function */
  }
  
  public initialize(): void {
    if (this.audioContext) return
    const extendedWindow = window as unknown as ExtendedWindow
    const AudioContextClass = extendedWindow.AudioContext || extendedWindow.webkitAudioContext

    if (AudioContextClass) {
      // Specify 'interactive' latency for faster audio response, crucial for UI feedback.
      this.audioContext = new AudioContextClass({
        latencyHint: 'interactive'
      }) as CustomAudioContext
      // Tone.js needs to know which AudioContext to use.
      Tone.setContext(this.audioContext);
      // A smaller look-ahead time reduces scheduling latency. The default of 100ms
      // is too high for responsive keystroke sounds. 10ms is a good compromise.
      Tone.context.lookAhead = 0.01;

      // Create a master gain node that all other nodes will connect to.
      // This gives us a single point of control for master volume.
      this.mainGain = new Tone.Gain(0.75).toDestination();

      // Create a reusable synth for keystrokes and connect it to our main gain.
      this.keystrokeSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.005, decay: 0.05, sustain: 0.2, release: 0.045 },
        volume: -12 // A bit quieter in dB
      });
      this.keystrokeSynth.connect(this.mainGain);

      console.log('AudioEngine Initialized.')
    } else {
      console.error('Web Audio API is not supported in this browser.')
    }
  }

  public getLatencyInfo(): LatencyInfo | null {
    if (!this.audioContext) return null
    return {
      baseLatency: this.audioContext.baseLatency,
      outputLatency: this.audioContext.outputLatency,
      sinkId: this.audioContext.sinkId || ''
    }
  }

  /**
   * Plays a note on the dedicated keystroke synth.
   * This is far more efficient than building a graph for each key press.
   * @param frequency The frequency of the note to play.
   */
  public playKeystroke(frequency: number): void {
    if (!this.keystrokeSynth) return;
    // This is a hot path. We call ensureActiveContext without awaiting it.
    // This "fire-and-forget" approach allows the sound to be scheduled immediately
    // with minimal latency. If the context is suspended, Tone.js will queue this
    // event and play it as soon as the context is resumed by Tone.start().
    this.ensureActiveContext();
    this.keystrokeSynth.triggerAttackRelease(frequency, '16n', Tone.now());
  }

  /**
   * Converts a SoundBlueprint into a reusable Tone.PolySynth and caches it.
   * This is the core of our instrument pre-compilation strategy.
   * @param name The name to register the instrument under.
   * @param blueprint The blueprint to build the instrument from.
   */
  public registerInstrument(name: string, blueprint: SoundBlueprint): void {
    if (!this.mainGain) return;

    // The options for the synth voice are derived from the blueprint.
    // We only take the first source for the basic oscillator type.
    const synthOptions: any = {
      oscillator: {
        type: (blueprint.sources[0] as any)?.oscillatorType || 'sine'
      },
      envelope: blueprint.envelope
    };

    const polySynth = new Tone.PolySynth(Tone.Synth, synthOptions);

    // Create the effects chain from the blueprint
    const effects = [];
    if (blueprint.filter && blueprint.filter.type === 'biquad') {
      effects.push(new Tone.Filter(blueprint.filter.frequency, blueprint.filter.filterType));
    }
    if (blueprint.distortion) {
      effects.push(new Tone.Distortion(blueprint.distortion.amount));
    }
    // ... other effects like delay, reverb can be added to the chain

    // Chain the synth through the effects and to the main output.
    polySynth.chain(...effects, this.mainGain);

    this.instruments.set(name, polySynth);
    console.log(`Instrument '${name}' registered.`);
  }

  /**
   * Triggers a pre-registered instrument.
   * @param name The name of the instrument to trigger.
   */
  public triggerInstrument(name: string): void {
    const instrument = this.instruments.get(name);
    if (!instrument) {
      console.warn(`Instrument '${name}' not found.`);
      return;
    }
    // Fire-and-forget to avoid adding latency on a hot path.
    this.ensureActiveContext();
    // For one-shot sounds, we can use a default note and duration.
    instrument.triggerAttackRelease('C4', '8n', Tone.now());
  }

  /**
   * The core method for playing a sound. It dynamically builds an audio graph
   * from a blueprint and plays it.
   * @param blueprint The declarative object describing the sound.
   */
  public async playSoundFromBlueprint(blueprint: SoundBlueprint): Promise<void> {
    if (!this.audioContext || !this.mainGain) return;

    await this.ensureActiveContext();

    const now = Tone.now();

    // This map will hold references to all created Tone.js nodes for modulation.
    const nodes: Record<string, Tone.ToneAudioNode | Tone.ToneAudioNode[]> = {};

    // The main amplitude envelope for the entire sound.
    const ampEnvelope = new Tone.AmplitudeEnvelope(blueprint.envelope).connect(this.mainGain);
    nodes.amplitude = ampEnvelope;

    // Build the effects chain. Tone.js makes this clean.
    const effectsChain: Tone.ToneAudioNode[] = [];

    if (blueprint.distortion) {
      nodes.distortion = new Tone.Distortion(blueprint.distortion.amount);
      effectsChain.push(nodes.distortion);
    }
    // Add a type guard for safer filter creation
    if (blueprint.filter && blueprint.filter.type === 'biquad') {
      nodes.filter = new Tone.Filter(
        blueprint.filter.frequency,
        blueprint.filter.filterType
      );
      (nodes.filter as Tone.Filter).Q.value = blueprint.filter.Q;
      if (blueprint.filter.gain) (nodes.filter as Tone.Filter).gain.value = blueprint.filter.gain;
      effectsChain.push(nodes.filter);
    }
    if (blueprint.panner && blueprint.panner.type === 'stereo') {
      nodes.panner = new Tone.Panner(blueprint.panner.pan);
      effectsChain.push(nodes.panner);
    }
    if (blueprint.compressor) {
      nodes.compressor = new Tone.Compressor(blueprint.compressor);
      effectsChain.push(nodes.compressor);
    }
    
    // Create sources and connect them through the chain to the envelope
    const sources = blueprint.sources.map((sourceBp) => {
      let sourceNode: Tone.Noise | Tone.Oscillator;
      if (sourceBp.type === 'oscillator') {
        sourceNode = new Tone.Oscillator({
          type: sourceBp.oscillatorType,
          frequency: sourceBp.frequency,
          detune: sourceBp.detune ?? 0,
        });
      } else {
        sourceNode = new Tone.Noise(sourceBp.noiseType);
      }
      // Connect source to the start of the chain, and the chain to the envelope
      sourceNode.chain(...effectsChain, ampEnvelope);
      return sourceNode;
    });
    nodes.sources = sources;

    // Handle parallel "send" effects like Reverb and Delay
    if (blueprint.reverb) {
      nodes.reverb = new Tone.Reverb(blueprint.reverb).connect(this.mainGain);
      ampEnvelope.connect(nodes.reverb); // Send from the main envelope output
    }
    if (blueprint.delay) {
      nodes.delay = new Tone.FeedbackDelay(blueprint.delay).connect(this.mainGain);
      ampEnvelope.connect(nodes.delay);
    }

    // Trigger the sound
    sources.forEach((s) => s.start(now).stop(now + blueprint.duration));
    ampEnvelope.triggerAttackRelease(blueprint.duration, now);

    // Handle LFO modulation with Tone.js LFO
    if (blueprint.lfo) {
      const lfo = new Tone.LFO({
        frequency: blueprint.lfo.frequency,
        type: blueprint.lfo.type,
        // The LFO will oscillate between -depth and +depth, which is
        // then added to the target parameter's base value.
        min: -blueprint.lfo.depth,
        max: blueprint.lfo.depth,
      });
      lfo.type = blueprint.lfo.type;
      
      const { target, param } = blueprint.lfo.affects;

      switch (target) {
        case 'source':
          if (param === 'frequency') {
            (nodes.sources as (Tone.Oscillator | Tone.Noise)[]).forEach(s => {
              if (s instanceof Tone.Oscillator) {
                lfo.connect(s.frequency);
              }
            });
          }
          break;
        case 'filter':
          const filterNode = nodes.filter as Tone.Filter;
          if (filterNode && (param === 'frequency' || param === 'Q')) {
            lfo.connect(filterNode[param]);
          }
          break;
        // Other cases for panner, delay, etc. can be added here.
      }
      lfo.start(now).stop(now + blueprint.duration);
    }
  }

  // --- Singleton Access ---
  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine()
    }
    return AudioEngine.instance
  }

  public async ensureActiveContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      // Tone.start() will resume the underlying AudioContext.
      await Tone.start();
    }
  }
}

export const audioEngine = AudioEngine.getInstance()
