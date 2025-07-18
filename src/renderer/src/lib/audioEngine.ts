// src/renderer/src/lib/audioEngine.ts

/**
 * @file audioEngine.ts
 * @description Core module for generative audio using the Web Audio API.
 * This engine creates sounds from scratch without any pre-recorded assets.
 */

// Define a more specific type for the window object to include both standard and prefixed AudioContext.
interface ExtendedWindow extends Window {
  AudioContext?: typeof AudioContext
  webkitAudioContext?: typeof AudioContext
}

// Extend the base AudioContext to include the experimental sinkId property.
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
  // Use the custom type for the audio context.
  private audioContext: CustomAudioContext | null = null
  private mainGain: GainNode | null = null

  private constructor() {
    // Private constructor to ensure singleton pattern.
  }

  public initialize(): void {
    if (!this.audioContext) {
      // Use the extended window type for type safety.
      const extendedWindow = window as unknown as ExtendedWindow
      const AudioContextClass = extendedWindow.AudioContext || extendedWindow.webkitAudioContext

      if (AudioContextClass) {
        this.audioContext = new AudioContextClass() as CustomAudioContext // Cast to the custom type
        this.mainGain = this.audioContext.createGain()
        this.mainGain.gain.setValueAtTime(0.5, this.audioContext.currentTime)
        this.mainGain.connect(this.audioContext.destination)
        console.log('AudioEngine Initialized.')
      } else {
        console.error('Web Audio API is not supported in this browser.')
      }
    }
  }

  /**
   * Retrieves latency and device information from the AudioContext.
   * @returns An object containing latency info, or null if context is not ready.
   */
  public getLatencyInfo(): LatencyInfo | null {
    if (!this.audioContext) {
      return null
    }
    return {
      baseLatency: this.audioContext.baseLatency,
      outputLatency: this.audioContext.outputLatency,
      // The sinkId is now correctly recognized on our custom type.
      sinkId: this.audioContext.sinkId || ''
    }
  }

  public generateCommandSound(command: string): void {
    if (!this.audioContext || !this.mainGain) {
      console.warn('AudioEngine not initialized. Cannot play sound.')
      return
    }
    const now = this.audioContext.currentTime
    const charCodes = command.split('').map((char) => char.charCodeAt(0))
    const baseFrequency = 200 + (charCodes.reduce((a, b) => a + b, 0) % 300)
    const duration = Math.min(0.1 + command.length * 0.05, 1.5)
    const oscillator = this.audioContext.createOscillator()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(baseFrequency, now)
    const lfo = this.audioContext.createOscillator()
    lfo.type = 'sawtooth'
    lfo.frequency.setValueAtTime(5 + (command.length % 10), now)
    const lfoGain = this.audioContext.createGain()
    lfoGain.gain.setValueAtTime(15, now)
    lfo.connect(lfoGain)
    lfoGain.connect(oscillator.frequency)
    const envelope = this.audioContext.createGain()
    envelope.gain.setValueAtTime(0, now)
    envelope.gain.linearRampToValueAtTime(0.8, now + duration * 0.1)
    envelope.gain.exponentialRampToValueAtTime(0.1, now + duration * 0.7)
    envelope.gain.linearRampToValueAtTime(0, now + duration)
    oscillator.connect(envelope)
    envelope.connect(this.mainGain)
    lfo.start(now)
    oscillator.start(now)
    lfo.stop(now + duration)
    oscillator.stop(now + duration)
  }

  public playKeystrokeSound(key: string): void {
    if (!this.audioContext || !this.mainGain) return
    const now = this.audioContext.currentTime
    const freq = 250 + (key.charCodeAt(0) * 5) % 800
    const osc = this.audioContext.createOscillator()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, now)
    const envelope = this.audioContext.createGain()
    envelope.gain.setValueAtTime(0, now)
    envelope.gain.linearRampToValueAtTime(0.5, now + 0.01)
    envelope.gain.linearRampToValueAtTime(0, now + 0.1)
    osc.connect(envelope)
    envelope.connect(this.mainGain)
    osc.start(now)
    osc.stop(now + 0.1)
  }

  public playErrorSound(): void {
    if (!this.audioContext || !this.mainGain) return
    const now = this.audioContext.currentTime
    const baseFreq = 150
    for (let i = 0; i < 2; i++) {
      const osc = this.audioContext.createOscillator()
      osc.type = 'square'
      osc.frequency.setValueAtTime(baseFreq * Math.pow(1.05946, i * 6), now)
      const envelope = this.audioContext.createGain()
      envelope.gain.setValueAtTime(0, now)
      envelope.gain.linearRampToValueAtTime(0.3, now + 0.02)
      envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.4)
      envelope.gain.linearRampToValueAtTime(0, now + 0.5)
      osc.connect(envelope)
      envelope.connect(this.mainGain)
      osc.start(now)
      osc.stop(now + 0.5)
    }
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine()
    }
    return AudioEngine.instance
  }
}

export const audioEngine = AudioEngine.getInstance()
