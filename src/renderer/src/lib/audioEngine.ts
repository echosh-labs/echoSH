// src/renderer/src/lib/audioEngine.ts

import { SoundBlueprint } from './audioBlueprints'

/**
 * @file audioEngine.ts
 * @description Core module for generative audio using the Web Audio API.
 * This engine creates sounds from scratch without any pre-recorded assets.
 */

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
  private mainGain: GainNode | null = null

  // Private constructor is intentional for the singleton pattern.
  private constructor() {
    /* linter-disable-line no-empty-function */
  }

  public initialize(): void {
    if (!this.audioContext) {
      const extendedWindow = window as unknown as ExtendedWindow
      const AudioContextClass = extendedWindow.AudioContext || extendedWindow.webkitAudioContext

      if (AudioContextClass) {
        this.audioContext = new AudioContextClass() as CustomAudioContext
        this.mainGain = this.audioContext.createGain()
        this.mainGain.gain.setValueAtTime(0.5, this.audioContext.currentTime)
        this.mainGain.connect(this.audioContext.destination)
        console.log('AudioEngine Initialized.')
      } else {
        console.error('Web Audio API is not supported in this browser.')
      }
    }
  }

  public getLatencyInfo(): LatencyInfo | null {
    if (!this.audioContext) {
      return null
    }
    return {
      baseLatency: this.audioContext.baseLatency,
      outputLatency: this.audioContext.outputLatency,
      sinkId: this.audioContext.sinkId || ''
    }
  }

  public playSoundFromBlueprint(blueprint: SoundBlueprint): void {
    if (!this.audioContext || !this.mainGain) return

    const now = this.audioContext.currentTime
    const { oscillators, envelope, lfo, duration } = blueprint

    const ampEnvelope = this.audioContext.createGain()
    ampEnvelope.gain.setValueAtTime(0, now)
    ampEnvelope.gain.linearRampToValueAtTime(1, now + envelope.attack)
    ampEnvelope.gain.linearRampToValueAtTime(envelope.sustain, now + envelope.attack + envelope.decay)
    ampEnvelope.gain.setValueAtTime(envelope.sustain, now + duration - envelope.release)
    ampEnvelope.gain.linearRampToValueAtTime(0, now + duration)
    ampEnvelope.connect(this.mainGain)

    oscillators.forEach((oscBlueprint) => {
      if (!this.audioContext) return // Type guard for safety

      const osc = this.audioContext.createOscillator()
      osc.type = oscBlueprint.type
      osc.frequency.setValueAtTime(oscBlueprint.frequency, now)
      if (oscBlueprint.detune) {
        osc.detune.setValueAtTime(oscBlueprint.detune, now)
      }

      osc.connect(ampEnvelope)

      if (lfo && this.audioContext) {
        // Additional guard for context within this block
        const lfoNode = this.audioContext.createOscillator()
        lfoNode.type = lfo.type
        lfoNode.frequency.setValueAtTime(lfo.frequency, now)

        const lfoGain = this.audioContext.createGain()
        lfoGain.gain.setValueAtTime(lfo.depth, now)

        lfoNode.connect(lfoGain)
        if (lfo.affects === 'frequency') {
          lfoGain.connect(osc.frequency)
        }
      }

      osc.start(now)
      osc.stop(now + duration)
    })
  }

  public generateCommandSound(command: string): void {
    const charCodes = command.split('').map((char) => char.charCodeAt(0))
    const sumOfCharCodes = charCodes.reduce((a, b) => a + b, 0)

    const commandBlueprint: SoundBlueprint = {
      oscillators: [{ type: 'sine', frequency: 200 + (sumOfCharCodes % 300) }],
      envelope: {
        attack: 0.05,
        decay: 0.1,
        sustain: 0.8,
        release: Math.min(0.1 + command.length * 0.05, 1.0)
      },
      lfo: {
        type: 'sawtooth',
        frequency: 5 + (command.length % 10),
        affects: 'frequency',
        depth: 15
      },
      duration: Math.min(0.2 + command.length * 0.05, 1.5)
    }

    this.playSoundFromBlueprint(commandBlueprint)
  }

  public playKeystrokeSound(key: string): void {
    const keystrokeBlueprint: SoundBlueprint = {
      oscillators: [{ type: 'triangle', frequency: 250 + (key.charCodeAt(0) * 5) % 800 }],
      envelope: {
        attack: 0.005,
        decay: 0.05,
        sustain: 0.2,
        release: 0.045
      },
      duration: 0.1
    }
    this.playSoundFromBlueprint(keystrokeBlueprint)
  }

  public playErrorSound(): void {
    const errorBlueprint: SoundBlueprint = {
      oscillators: [
        { type: 'square', frequency: 150 },
        { type: 'square', frequency: 150 * Math.pow(1.05946, 6), detune: 10 }
      ],
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.1,
        release: 0.2
      },
      duration: 0.5
    }
    this.playSoundFromBlueprint(errorBlueprint)
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine()
    }
    return AudioEngine.instance
  }
}

export const audioEngine = AudioEngine.getInstance()