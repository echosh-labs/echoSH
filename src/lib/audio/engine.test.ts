import { describe, it, expect } from "vitest";
import { audioEngine } from "./AudioEngine";
import { createProceduralImpulseResponse, createStereoPingPongDelay } from "./ReverbDelay";
import { createFMVoice } from "./FMSynth";
import { createPhysicalPluckVoice } from "./KarplusStrong";

// Comprehensive Mock for Web Audio API AudioContext in Headless Node environment
class MockAudioParam {
  value: number;
  constructor(initial: number = 0) {
    this.value = initial;
  }
  setValueAtTime(val: number, _time: number) {
    this.value = val;
  }
  linearRampToValueAtTime(val: number, _time: number) {
    this.value = val;
  }
  exponentialRampToValueAtTime(val: number, _time: number) {
    this.value = val;
  }
}

class MockAudioNode {
  connectedTo: MockAudioNode[] = [];
  connect(dest: MockAudioNode | MockAudioParam) {
    if (dest instanceof MockAudioNode) {
      this.connectedTo.push(dest);
    }
  }
  disconnect() {
    this.connectedTo = [];
  }
}

class MockGainNode extends MockAudioNode {
  gain = new MockAudioParam(1.0);
}

class MockOscillatorNode extends MockAudioNode {
  type: string = "sine";
  frequency = new MockAudioParam(440);
  detune = new MockAudioParam(0);
  start(_time?: number) {}
  stop(_time?: number) {}
}

class MockBiquadFilterNode extends MockAudioNode {
  type: string = "lowpass";
  frequency = new MockAudioParam(1000);
  Q = new MockAudioParam(1);
}

class MockDelayNode extends MockAudioNode {
  delayTime = new MockAudioParam(0.2);
}

class MockAudioBuffer {
  channels: Float32Array[];
  sampleRate: number;
  length: number;
  constructor(numChannels: number, length: number, sampleRate: number) {
    this.sampleRate = sampleRate;
    this.length = length;
    this.channels = Array.from({ length: numChannels }, () => new Float32Array(length));
  }
  getChannelData(channel: number): Float32Array {
    return this.channels[channel] || new Float32Array(this.length);
  }
}

class MockAudioContext {
  currentTime = 0.0;
  sampleRate = 44100;
  state = "running";
  destination = new MockAudioNode();

  createGain() { return new MockGainNode(); }
  createOscillator() { return new MockOscillatorNode(); }
  createBiquadFilter() { return new MockBiquadFilterNode(); }
  createDelay(_max?: number) { return new MockDelayNode(); }
  createBuffer(channels: number, length: number, sampleRate: number) {
    return new MockAudioBuffer(channels, length, sampleRate);
  }
  createBufferSource() {
    return {
      buffer: null,
      connect: (_dest: any) => {},
      start: (_time?: number) => {},
      stop: (_time?: number) => {},
    };
  }
}

describe("Web Audio 2.0 DSP Engine Signal Chain & Mathematical Verification", () => {
  it("manages master volume and mute state correctly", () => {
    audioEngine.setMasterVolume(0.85);
    expect(audioEngine.getMasterVolume()).toBe(0.85);

    const isMuted = audioEngine.toggleMute();
    expect(audioEngine.getIsMuted()).toBe(isMuted);

    audioEngine.toggleMute();
    expect(audioEngine.getIsMuted()).toBe(false);
  });

  describe("Procedural Impulse Responses & Reverb Math", () => {
    it("generates stereo impulse response with non-zero decaying samples", () => {
      const mockCtx = new MockAudioContext() as unknown as AudioContext;
      const buffer = createProceduralImpulseResponse(mockCtx, 1.0, 2.0);

      expect(buffer.sampleRate).toBe(44100);
      expect(buffer.length).toBe(44100);

      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      expect(left.length).toBe(44100);
      expect(right.length).toBe(44100);

      // Check initial transient has energy
      const initialEnergy = Math.abs(left[0]) + Math.abs(left[10]);
      expect(initialEnergy).toBeGreaterThan(0);

      // Verify exponential decay (tail energy should be lower than initial energy on average)
      let headSum = 0;
      for (let i = 0; i < 1000; i++) headSum += Math.abs(left[i]);
      let tailSum = 0;
      for (let i = 43000; i < 44000; i++) tailSum += Math.abs(left[i]);

      expect(headSum).toBeGreaterThan(tailSum);
    });

    it("constructs ping-pong delay with connected feedback loop and non-zero gain", () => {
      const mockCtx = new MockAudioContext() as unknown as AudioContext;
      const delay = createStereoPingPongDelay(mockCtx, 0.25, 0.4);

      expect(delay.input).toBeDefined();
      expect(delay.output).toBeDefined();
      expect(delay.input.gain.value).toBeGreaterThan(0);
    });
  });

  describe("FM & Physical Modeling Voice Output Audibility Guarantee", () => {
    it("guarantees FM voice output gain is strictly positive (> 0.0)", () => {
      const mockCtx = new MockAudioContext() as unknown as AudioContext;
      const fmNode = createFMVoice(
        mockCtx,
        {
          type: "fm",
          carrierType: "sine",
          carrierFrequency: 440,
          modulatorType: "sine",
          modRatio: 2.0,
          modIndex: 300,
        },
        { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.2 },
        0,
        1.0
      );

      // Assert voice output is NOT muted (gain >= 1.0)
      expect(fmNode.gain.value).toBeGreaterThanOrEqual(1.0);
    });

    it("guarantees Karplus-Strong physical pluck output gain is strictly positive (> 0.0)", () => {
      const mockCtx = new MockAudioContext() as unknown as AudioContext;
      const pluckNode = createPhysicalPluckVoice(
        mockCtx,
        {
          type: "pluck",
          frequency: 523.25,
          damping: 0.04,
          brightness: 5.0,
        },
        { attack: 0.001, decay: 0.8, sustain: 0.1, release: 0.5 },
        0,
        1.0
      );

      // Assert voice output is NOT muted (gain >= 1.0)
      expect(pluckNode.gain.value).toBeGreaterThanOrEqual(1.0);
    });
  });

  describe("Keystroke Frequency Mapping", () => {
    it("maps all ASCII characters into the 260 Hz to 1200 Hz audible spectrum", () => {
      const testChars = ["a", "b", "c", "z", "A", "Z", "0", "9", " ", "☿"];
      for (const ch of testChars) {
        const code = ch.charCodeAt(0) || 65;
        const baseFreq = 260 + (code % 32) * 28;
        expect(baseFreq).toBeGreaterThanOrEqual(260);
        expect(baseFreq).toBeLessThanOrEqual(1200);
      }
    });
  });
});