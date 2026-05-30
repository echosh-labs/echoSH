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

import { backspaceSwoosh } from "@/renderer/lib/audio/keys/backspace.ts";


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

/**
 * A single scheduled event in a sequence. Either a musical note (played on the
 * melody synth via `frequency`) or a full generative `blueprint` (e.g. a drum
 * hit). `time` is an offset in seconds from when the sequence starts.
 */
export interface SequenceEvent {
  frequency?: number
  blueprint?: SoundBlueprint
  time: number
  duration: number
}

class AudioEngine {
  private static instance: AudioEngine
  private audioContext: CustomAudioContext | null = null
  private mainGain: Tone.Gain | null = null;
  private keystrokeSynth: Tone.PolySynth | null = null;
  private melodySynth: Tone.PolySynth | null = null;
  private instruments: Map<string, Tone.PolySynth> = new Map();

  // Master volume / mute state. `mainGain` is the single point of volume control.
  private masterVolume = 0.75;
  private muted = false;

  // Shared playback tempo (beats per minute) used by the sequencer-driven
  // commands (melody, scale, arp, beat). Adjusted via the `tempo` command.
  private bpm = 120;

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
      this.mainGain = new Tone.Gain(this.muted ? 0 : this.masterVolume).toDestination();

      // Create a reusable synth for keystrokes and connect it to our main gain.
      this.keystrokeSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.005, decay: 0.05, sustain: 0.2, release: 0.045 },
        volume: -12 // A bit quieter in dB
      });
      this.keystrokeSynth.connect(this.mainGain);

      // A dedicated, slightly warmer synth used by the musical commands
      // (note/chord/scale/melody/arp) so sequenced notes have their own voice.
      this.melodySynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.01, decay: 0.15, sustain: 0.3, release: 0.3 },
        volume: -8
      });
      this.melodySynth.connect(this.mainGain);

      this.registerInstrument('backspace', backspaceSwoosh);

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
  public async playSoundFromBlueprint(blueprint: SoundBlueprint, startTime?: number): Promise<void> {
    if (!this.audioContext || !this.mainGain) return;

    await this.ensureActiveContext();

    // Allow callers (e.g. the step sequencer) to schedule a sound at a precise
    // future time. Defaults to "now" for the normal one-shot case.
    const now = startTime ?? Tone.now();

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

  /**
   * Schedules a sequence of notes and/or blueprints relative to the current
   * time. Used by the musical commands (melody, scale, arp, beat).
   * @param events The events to schedule, each with a `time` offset in seconds.
   */
  public async playSequence(events: SequenceEvent[]): Promise<void> {
    if (!this.melodySynth) return;
    await this.ensureActiveContext();

    const start = Tone.now();
    for (const event of events) {
      const when = start + event.time;
      if (event.blueprint) {
        // Fire-and-forget: each blueprint schedules itself at the given time.
        this.playSoundFromBlueprint(event.blueprint, when);
      } else if (event.frequency != null) {
        this.melodySynth.triggerAttackRelease(event.frequency, event.duration, when);
      }
    }
  }

  /** Sets the master output volume. `level` is clamped to the range 0..1. */
  public setMasterVolume(level: number): void {
    this.masterVolume = Math.max(0, Math.min(1, level));
    if (this.mainGain && !this.muted) {
      this.mainGain.gain.rampTo(this.masterVolume, 0.02);
    }
  }

  /** Returns the current master volume (0..1), ignoring mute state. */
  public getMasterVolume(): number {
    return this.masterVolume;
  }

  /** Mutes or unmutes the master output without losing the chosen volume. */
  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.mainGain) {
      this.mainGain.gain.rampTo(muted ? 0 : this.masterVolume, 0.02);
    }
  }

  /** Toggles mute and returns the new muted state. */
  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  /** Returns the shared playback tempo in beats per minute. */
  public getBpm(): number {
    return this.bpm;
  }

  /** Sets the shared playback tempo. `bpm` is clamped to a sane 20..400 range. */
  public setBpm(bpm: number): void {
    this.bpm = Math.max(20, Math.min(400, bpm));
  }

  // --- Singleton Access ---
  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine()
    }
    return AudioEngine.instance
  }

  public reset() {
    // 1. Stop all synths/instruments and disconnect
    this.instruments.forEach(synth => {
      synth.releaseAll();
      synth.disconnect();
    });
    this.instruments.clear();

    // 2. Stop and disconnect keystroke + melody synths
    if (this.keystrokeSynth) {
      this.keystrokeSynth.releaseAll();
      this.keystrokeSynth.disconnect();
      this.keystrokeSynth = null;
    }
    if (this.melodySynth) {
      this.melodySynth.releaseAll();
      this.melodySynth.disconnect();
      this.melodySynth = null;
    }

    // 3. Disconnect and null main gain
    if (this.mainGain) {
      this.mainGain.disconnect();
      this.mainGain = null;
    }

    // 4. Close AudioContext and null it out
    if (this.audioContext) {
      const closing = this.audioContext;
      this.audioContext = null;
      // Re-initialize whether or not close() succeeds, and swallow rejections
      // so a failed close never leaves the engine dead or surfaces an
      // unhandled promise rejection.
      closing.close()
        .catch((err) => console.error('Failed to close AudioContext:', err))
        .finally(() => this.initialize());
    }
    return true;
  }

  public async ensureActiveContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      // Tone.start() will resume the underlying AudioContext.

      this.audioContext?.resume();

      await Tone.start();
    }
  }


}

export const audioEngine = AudioEngine.getInstance()
