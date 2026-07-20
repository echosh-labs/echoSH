/**
 * @file loopEngine.ts
 * @description Continuous, multi-track looping playback on Tone's Transport.
 *
 * The one-shot commands (melody, beat, arp) schedule a fixed run of events and
 * then fall silent. This engine is the opposite: named tracks loop until
 * something stops them, and tracks can be added, replaced, muted, levelled, or
 * dropped *while the music keeps running*. That persistence is what makes live
 * mixing possible — whether the hands on the controls are the user's or the
 * AI's, since each command lands on the next grid step of a groove that never
 * stopped.
 *
 * Every voice here is a pre-built Tone instrument, deliberately not the
 * blueprint path the one-shot commands use. `playSoundFromBlueprint` builds a
 * fresh audio graph per hit and never disposes it — fine for a sixteen-step
 * burst, ruinous for a loop running for minutes.
 */

import * as Tone from 'tone'
import { audioEngine } from './audioEngine'
import { DRUM_CHARS, LoopStep, MAX_TRACKS, MelodicVoice } from './loopPattern'

// --- Voices --------------------------------------------------------------

/** The deeply-partial option bag `Tone.Synth` accepts, as PolySynth's voice. */
type SynthOptions = ConstructorParameters<typeof Tone.Synth>[0]

const VOICE_PRESETS: Record<MelodicVoice, SynthOptions> = {
  bass: {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.005, decay: 0.25, sustain: 0.5, release: 0.15 },
    volume: -6
  },
  lead: {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.2 },
    volume: -16
  },
  pad: {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.4, decay: 0.5, sustain: 0.7, release: 1.2 },
    volume: -16
  },
  pluck: {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.002, decay: 0.15, sustain: 0, release: 0.1 },
    volume: -10
  }
}

/** A drum voice, wrapped so the sequence callback treats every kit piece alike. */
interface DrumVoice {
  trigger(time: number): void
  dispose(): void
}

function createDrum(kind: string, destination: Tone.ToneAudioNode): DrumVoice {
  switch (kind) {
    case 'kick': {
      const synth = new Tone.MembraneSynth({
        pitchDecay: 0.03,
        octaves: 6,
        envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
        volume: -4
      }).connect(destination)
      return {
        trigger: (time) => synth.triggerAttackRelease('C1', '8n', time),
        dispose: () => synth.dispose()
      }
    }
    case 'tom': {
      const synth = new Tone.MembraneSynth({
        pitchDecay: 0.06,
        octaves: 4,
        envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.1 },
        volume: -8
      }).connect(destination)
      return {
        trigger: (time) => synth.triggerAttackRelease('A2', '8n', time),
        dispose: () => synth.dispose()
      }
    }
    case 'snare': {
      const synth = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.16, sustain: 0 },
        volume: -12
      }).connect(destination)
      return {
        trigger: (time) => synth.triggerAttackRelease('16n', time),
        dispose: () => synth.dispose()
      }
    }
    case 'clap': {
      const filter = new Tone.Filter(1600, 'bandpass').connect(destination)
      const synth = new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.002, decay: 0.12, sustain: 0 },
        volume: -8
      }).connect(filter)
      return {
        trigger: (time) => synth.triggerAttackRelease('16n', time),
        dispose: () => {
          synth.dispose()
          filter.dispose()
        }
      }
    }
    // Both hats are the same voice with a different decay, which is roughly
    // what a real hi-hat is: the same cymbal, held open or closed.
    case 'openhat':
    case 'hat':
    default: {
      const open = kind === 'openhat'
      const filter = new Tone.Filter(7000, 'highpass').connect(destination)
      const synth = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: open ? 0.25 : 0.03, sustain: 0 },
        volume: open ? -24 : -20
      }).connect(filter)
      return {
        trigger: (time) => synth.triggerAttackRelease('32n', time),
        dispose: () => {
          synth.dispose()
          filter.dispose()
        }
      }
    }
  }
}

// --- Tracks --------------------------------------------------------------

export interface TrackSpec {
  name: string
  kind: 'drum' | 'note'
  /** The pattern as the user wrote it, kept for `loop list`. */
  pattern: string
  steps: LoopStep[]
  /** Ignored for drum tracks, which always use the kit. */
  voice: MelodicVoice
  /** Tone subdivision per step, e.g. '16n'. */
  subdivision: string
}

export interface TrackInfo extends Omit<TrackSpec, 'steps'> {
  steps: number
  level: number
  muted: boolean
}

interface Track extends TrackSpec {
  level: number
  muted: boolean
  gain: Tone.Gain
  sequence: Tone.Sequence<LoopStep>
  synth: Tone.PolySynth | null
  filter: Tone.Filter | null
  drums: Map<string, DrumVoice>
}

class LoopEngine {
  private tracks = new Map<string, Track>()
  private unsubscribeReset: (() => void) | null = null

  /**
   * Tracks are torn down whenever the audio engine resets (the `stop` command),
   * because their nodes hang off a main gain that reset replaces. Registered
   * lazily so importing this module doesn't force the engine to initialise.
   */
  private ensureReady(): Tone.ToneAudioNode | null {
    audioEngine.initialize()
    const output = audioEngine.getOutputNode()
    if (!output) return null

    if (!this.unsubscribeReset) {
      this.unsubscribeReset = audioEngine.onReset(() => {
        this.disposeAll()
        // The old node graph is gone; re-register against the next one.
        this.unsubscribeReset = null
      })
    }
    return output
  }

  private disposeTrack(track: Track): void {
    track.sequence.dispose()
    track.synth?.dispose()
    track.filter?.dispose()
    track.drums.forEach((drum) => drum.dispose())
    track.drums.clear()
    track.gain.dispose()
  }

  private disposeAll(): void {
    this.tracks.forEach((track) => this.disposeTrack(track))
    this.tracks.clear()
    Tone.getTransport().stop()
    Tone.getTransport().position = 0
  }

  /**
   * Adds a track, or replaces the pattern of an existing one. Replacing keeps
   * the track's level and mute state — when you're mixing, changing what a part
   * plays shouldn't silently undo where you set it.
   */
  public async setTrack(spec: TrackSpec): Promise<TrackInfo | null> {
    const output = this.ensureReady()
    if (!output) return null
    await audioEngine.ensureActiveContext()

    const existing = this.tracks.get(spec.name)
    if (!existing && this.tracks.size >= MAX_TRACKS) return null

    const level = existing?.level ?? 1
    const muted = existing?.muted ?? false
    if (existing) {
      this.disposeTrack(existing)
      this.tracks.delete(spec.name)
    }

    const gain = new Tone.Gain(muted ? 0 : level).connect(output)

    let synth: Tone.PolySynth | null = null
    let filter: Tone.Filter | null = null
    const drums = new Map<string, DrumVoice>()

    if (spec.kind === 'note') {
      // The lowpass tames the sawtooth lead and keeps stacked tracks from
      // turning into a wall of upper harmonics.
      filter = new Tone.Filter(4200, 'lowpass').connect(gain)
      synth = new Tone.PolySynth(Tone.Synth, VOICE_PRESETS[spec.voice]).connect(filter)
    } else {
      // Build only the kit pieces this pattern actually uses.
      for (const step of spec.steps) {
        if (typeof step !== 'string') continue
        const kind = DRUM_CHARS[step]
        if (kind && !drums.has(kind)) drums.set(kind, createDrum(kind, gain))
      }
    }

    const sequence = new Tone.Sequence<LoopStep>(
      (time, step) => {
        if (step == null) return
        if (spec.kind === 'note') {
          if (Array.isArray(step) && step.length) {
            // Resolved per hit rather than once at build time, so a live
            // `tempo` change shortens the notes along with the grid instead of
            // leaving them ringing over the next step. The 0.9 keeps repeated
            // notes articulate rather than slurred.
            const length = Tone.Time(spec.subdivision).toSeconds() * 0.9
            synth?.triggerAttackRelease(step, length, time)
          }
          return
        }
        if (typeof step === 'string') drums.get(DRUM_CHARS[step])?.trigger(time)
      },
      spec.steps,
      spec.subdivision
    )

    // Starting at transport position 0 rather than "now" phase-locks every
    // track to the same grid, so a loop added mid-groove lands on the beat
    // instead of wherever the user happened to hit enter.
    sequence.start(0)

    this.tracks.set(spec.name, {
      ...spec,
      level,
      muted,
      gain,
      sequence,
      synth,
      filter,
      drums
    })

    this.start()
    return this.info(spec.name)
  }

  public drop(name: string): boolean {
    const track = this.tracks.get(name)
    if (!track) return false
    this.disposeTrack(track)
    this.tracks.delete(name)
    if (!this.tracks.size) this.stop()
    return true
  }

  public clear(): number {
    const count = this.tracks.size
    this.disposeAll()
    return count
  }

  public setMuted(name: string, muted: boolean): boolean {
    const track = this.tracks.get(name)
    if (!track) return false
    track.muted = muted
    track.gain.gain.rampTo(muted ? 0 : track.level, 0.03)
    return true
  }

  /** Mutes every track but this one. Returns false if the name is unknown. */
  public solo(name: string): boolean {
    if (!this.tracks.has(name)) return false
    this.tracks.forEach((track) => this.setMuted(track.name, track.name !== name))
    return true
  }

  public setLevel(name: string, level: number): boolean {
    const track = this.tracks.get(name)
    if (!track) return false
    track.level = Math.max(0, Math.min(1, level))
    // A level change on a muted track is stored but stays silent until unmuted.
    if (!track.muted) track.gain.gain.rampTo(track.level, 0.05)
    return true
  }

  public has(name: string): boolean {
    return this.tracks.has(name)
  }

  public info(name: string): TrackInfo | null {
    const track = this.tracks.get(name)
    if (!track) return null
    const { gain: _gain, sequence: _sequence, synth: _synth, filter: _filter, drums: _drums, steps, ...rest } = track
    return { ...rest, steps: steps.length }
  }

  public list(): TrackInfo[] {
    return [...this.tracks.keys()].map((name) => this.info(name)!).filter(Boolean)
  }

  public start(): void {
    const transport = Tone.getTransport()
    transport.bpm.value = audioEngine.getBpm()
    if (transport.state !== 'started') transport.start()
  }

  /** Pauses playback without discarding the tracks, so `start` resumes the mix. */
  public stop(): void {
    Tone.getTransport().stop()
    Tone.getTransport().position = 0
  }

  public isPlaying(): boolean {
    return Tone.getTransport().state === 'started' && this.tracks.size > 0
  }
}

export const loopEngine = new LoopEngine()
