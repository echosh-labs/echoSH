/**
 * @file audioEngine.ts
 * @description Core module for generative audio using the Web Audio API.
 * This engine creates sounds from scratch based on declarative blueprints.
 */

import {
  SoundBlueprint,
  SoundSourceBlueprint,
  OscillatorBlueprint,
  NoiseBlueprint,
  FilterBlueprint,
  DistortionBlueprint,
  DelayBlueprint,
  ReverbBlueprint,
  PannerBlueprint,
  CompressorBlueprint
} from './audioBlueprints'

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
    if (this.audioContext) return
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

  public getLatencyInfo(): LatencyInfo | null {
    if (!this.audioContext) return null
    return {
      baseLatency: this.audioContext.baseLatency,
      outputLatency: this.audioContext.outputLatency,
      sinkId: this.audioContext.sinkId || ''
    }
  }

  /**
   * The core method for playing a sound. It dynamically builds an audio graph
   * from a blueprint and plays it.
   * @param blueprint The declarative object describing the sound.
   */
  public async playSoundFromBlueprint(blueprint: SoundBlueprint): Promise<void> {
    if (!this.audioContext || !this.mainGain) return

    await this.ensureActiveContext();

    const now = this.audioContext.currentTime;
    const { duration, envelope } = blueprint;

    // This map will hold references to all created nodes for easy access.
    const nodes: Record<string, AudioNode | AudioNode[]> = {};

    // 1. Create the final output gain stage, controlled by the main envelope
    const ampEnvelope = this.audioContext.createGain();
    nodes.ampEnvelope = ampEnvelope;
    ampEnvelope.gain.setValueAtTime(0, now);
    ampEnvelope.gain.linearRampToValueAtTime(1, now + envelope.attack);
    ampEnvelope.gain.linearRampToValueAtTime(
      envelope.sustain,
      now + envelope.attack + envelope.decay
    );
    ampEnvelope.gain.setValueAtTime(envelope.sustain, now + duration - envelope.release);
    ampEnvelope.gain.linearRampToValueAtTime(0, now + duration);

    // This will be the entry point for our main signal chain.
    let previousNode: AudioNode = ampEnvelope;

    // 2. Build the effects chain, connecting each new node to the previous one.
    if (blueprint.compressor) {
      nodes.compressor = this.createCompressorNode(blueprint.compressor);
      nodes.compressor.connect(previousNode);
      previousNode = nodes.compressor;
    }
    if (blueprint.panner) {
      nodes.panner = this.createPannerNode(blueprint.panner);
      nodes.panner.connect(previousNode);
      previousNode = nodes.panner;
    }
    if (blueprint.distortion) {
      nodes.distortion = this.createDistortionNode(blueprint.distortion);
      nodes.distortion.connect(previousNode);
      previousNode = nodes.distortion;
    }
    if (blueprint.filter) {
      nodes.filter = this.createFilterNode(blueprint.filter);
      nodes.filter.connect(previousNode);
      previousNode = nodes.filter;
    }

    const chainStartNode = previousNode;

    // 3. Create and connect the sound sources to the start of the chain
    const sourceNodes = blueprint.sources.map((sourceBp) => this.createSourceNode(sourceBp));
    nodes.sources = sourceNodes;
    sourceNodes.forEach((sourceNode) => {
      sourceNode.connect(chainStartNode);
      sourceNode.start(now);
      sourceNode.stop(now + duration);
    });

    // 4. Handle parallel effects (Delay and Reverb) using sends
    if (blueprint.delay) {
      this.createDelaySend(ampEnvelope, blueprint.delay)
    }
    if (blueprint.reverb) {
      this.createReverbSend(ampEnvelope, blueprint.reverb)
    }

    // 5. Connect the amplitude envelope to the main output
    ampEnvelope.connect(this.mainGain)

    // 6. Handle LFO modulation
    if (blueprint.lfo) {
      const lfo = this.audioContext.createOscillator();
      lfo.type = blueprint.lfo.type;
      lfo.frequency.value = blueprint.lfo.frequency;

      const lfoGain = this.audioContext.createGain();
      lfoGain.gain.value = blueprint.lfo.depth;

      lfo.connect(lfoGain);

      let targetParam: AudioParam | undefined;

      switch (blueprint.lfo.affects) {
        case 'frequency':
          // Special case: connect LFO to all oscillator sources
          sourceNodes.forEach((source) => {
            if (source instanceof OscillatorNode) {
              lfoGain.connect(source.frequency);
            }
          });
          break; // Exit switch early as we've handled the connection
        case 'amplitude':
          targetParam = (nodes.ampEnvelope as GainNode)?.gain;
          break;
        case 'filterCutoff':
          // Assumes the filter is a BiquadFilterNode for this to work
          targetParam = (nodes.filter as BiquadFilterNode)?.frequency;
          break;
        case 'pan':
          // Assumes the panner is a StereoPannerNode
          targetParam = (nodes.panner as StereoPannerNode)?.pan;
          break;
      }

      if (targetParam) {
        lfoGain.connect(targetParam);
      }

      lfo.start(now);
      lfo.stop(now + duration);
    }
  }

  // --- Node Creation Helpers ---

  private createSourceNode(blueprint: SoundSourceBlueprint): AudioScheduledSourceNode {
    if (!this.audioContext) throw new Error('AudioContext not initialized.')

    switch (blueprint.type) {
      case 'oscillator': {
        const osc = this.audioContext.createOscillator()
        osc.type = (blueprint as OscillatorBlueprint).oscillatorType
        osc.frequency.value = (blueprint as OscillatorBlueprint).frequency
        if (blueprint.detune) osc.detune.value = blueprint.detune
        return osc
      }
      case 'noise':
        return this.createNoiseBufferSource(blueprint as NoiseBlueprint)
    }
  }

  private createFilterNode(blueprint: FilterBlueprint): AudioNode {
    if (!this.audioContext) throw new Error('AudioContext not initialized.')
    switch (blueprint.type) {
      case 'biquad': {
        const bq = this.audioContext.createBiquadFilter()
        bq.type = blueprint.filterType
        bq.frequency.value = blueprint.frequency
        bq.Q.value = blueprint.Q
        if (blueprint.gain) bq.gain.value = blueprint.gain
        return bq
      }
      case 'iir':
        return this.audioContext.createIIRFilter(blueprint.feedforward, blueprint.feedback)
    }
  }

  private createDistortionNode(blueprint: DistortionBlueprint): WaveShaperNode {
    if (!this.audioContext) throw new Error('AudioContext not initialized.')
    const dist = this.audioContext.createWaveShaper()
    dist.curve = this.createDistortionCurve(blueprint.amount)
    dist.oversample = blueprint.oversample
    return dist
  }

  private createPannerNode(blueprint: PannerBlueprint): AudioNode {
    if (!this.audioContext) throw new Error('AudioContext not initialized.')
    switch (blueprint.type) {
      case 'stereo': {
        const panner = this.audioContext.createStereoPanner()
        panner.pan.value = blueprint.pan
        return panner
      }
      case 'positional': {
        // Positional panner is more complex and would be implemented here
        // For now, we'll return a simple stereo panner as a placeholder
        const placeholderPanner = this.audioContext.createStereoPanner()
        placeholderPanner.pan.value = 0
        return placeholderPanner
      }
    }
  }

  private createCompressorNode(blueprint: CompressorBlueprint): DynamicsCompressorNode {
    if (!this.audioContext) throw new Error('AudioContext not initialized.')
    const comp = this.audioContext.createDynamicsCompressor()
    comp.threshold.value = blueprint.threshold
    comp.knee.value = blueprint.knee
    comp.ratio.value = blueprint.ratio
    comp.attack.value = blueprint.attack
    comp.release.value = blueprint.release
    return comp
  }

  // --- Effects (Sends) ---

  private createDelaySend(inputNode: AudioNode, blueprint: DelayBlueprint): void {
    if (!this.audioContext || !this.mainGain) return
    const delay = this.audioContext.createDelay(blueprint.delayTime + 1) // Max delay time
    delay.delayTime.value = blueprint.delayTime

    const feedback = this.audioContext.createGain()
    feedback.gain.value = blueprint.feedback
    delay.connect(feedback)
    feedback.connect(delay)

    const mix = blueprint.mix ?? 0.5
    const wetGain = this.audioContext.createGain()
    wetGain.gain.value = mix

    inputNode.connect(delay)
    delay.connect(wetGain)
    wetGain.connect(this.mainGain)
  }

  private createReverbSend(inputNode: AudioNode, blueprint: ReverbBlueprint): void {
    if (!this.audioContext || !this.mainGain) return

    const impulseBuffer = this.createSyntheticImpulseResponse(
      blueprint.decay,
      blueprint.reverse ?? false
    )
    const convolver = this.audioContext.createConvolver()
    convolver.buffer = impulseBuffer

    const mix = blueprint.mix ?? 0.5
    const wetGain = this.audioContext.createGain()
    wetGain.gain.value = mix

    inputNode.connect(convolver)
    convolver.connect(wetGain)
    wetGain.connect(this.mainGain)
  }

  // --- Utility Helpers ---

  /**
   * Generates a synthetic impulse response for the convolver node,
   * creating a reverb effect without external audio files.
   * @param duration The length of the reverb tail in seconds.
   * @param reverse Whether to reverse the impulse, creating a "swell" effect.
   * @returns An AudioBuffer containing the generated impulse response.
   */
  private createSyntheticImpulseResponse(duration: number, reverse: boolean): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized.')

    const sampleRate = this.audioContext.sampleRate
    const length = sampleRate * duration
    const impulse = this.audioContext.createBuffer(2, length, sampleRate) // Stereo

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel)
      for (let i = 0; i < length; i++) {
        // Generate white noise and apply an exponential decay
        const noise = Math.random() * 2 - 1
        const envelope = Math.pow(1 - i / length, 2.5) // The exponent shapes the decay curve
        channelData[i] = noise * envelope
      }
    }

    if (reverse) {
      impulse.getChannelData(0).reverse()
      impulse.getChannelData(1).reverse()
    }

    return impulse
  }

  private createDistortionCurve(amount: number): Float32Array {
    const k = typeof amount === 'number' ? amount : 50
    const n_samples = 44100
    const curve = new Float32Array(n_samples)
    const deg = Math.PI / 180
    let i = 0
    let x
    for (; i < n_samples; ++i) {
      x = (i * 2) / n_samples - 1
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x))
    }
    return curve
  }

  private createNoiseBufferSource(blueprint: NoiseBlueprint): AudioBufferSourceNode {
    if (!this.audioContext) throw new Error('AudioContext not initialized.')
    const bufferSize = this.audioContext.sampleRate * 2 // 2 seconds of noise
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
    const output = buffer.getChannelData(0)

    switch (blueprint.noiseType) {
      case 'white':
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1
        }
        break
      case 'pink': {
        let b0 = 0,
          b1 = 0,
          b2 = 0,
          b3 = 0,
          b4 = 0,
          b5 = 0,
          b6 = 0
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1
          b0 = 0.99886 * b0 + white * 0.0555179
          b1 = 0.99332 * b1 + white * 0.0750759
          b2 = 0.969 * b2 + white * 0.153852
          b3 = 0.8665 * b3 + white * 0.3104856
          b4 = 0.55 * b4 + white * 0.5329522
          b5 = -0.7616 * b5 - white * 0.016898
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
          output[i] *= 0.11 // (roughly) compensate for gain
          b6 = white * 0.115926
        }
        break
      }
      case 'brown': {
        let lastOut = 0.0
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1
          lastOut = (lastOut + 0.02 * white) / 1.02
          output[i] = lastOut
          output[i] *= 3.5 // (roughly) compensate for gain
        }
        break
      }
    }

    const noiseNode = this.audioContext.createBufferSource()
    noiseNode.buffer = buffer
    noiseNode.loop = true
    return noiseNode
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
      await this.audioContext.resume();
    }
  }
}

export const audioEngine = AudioEngine.getInstance()
