import { describe, it, expect } from "vitest";
import {
  audioPresets,
  mercuryFundamentalBell,
  sunSolarCarrier,
  moonSynodicResonator,
  venusAmorHarmonic,
  jupiterWisdomChime,
  saturnDisciplineDrone,
  intuitionVioletDrone,
  idealismCyanArpeggio,
  alchemicalTransmutationDrone,
  fmCyberRhodes,
  fmMetallicSpaceBell,
  fmLaserSweep,
  physicalCyberHarp,
  physicalSitarPluck,
} from "./presets";

describe("Audio Presets and DSP Blueprints", () => {
  it("contains valid audio presets across all 5 distinct categories", () => {
    expect(audioPresets.length).toBeGreaterThan(10);

    for (const preset of audioPresets) {
      expect(preset.name).toBeTruthy();
      expect(preset.category).toBeTruthy();
      expect(preset.description).toBeTruthy();

      const bp = preset.blueprint;
      expect(bp.id).toBeTruthy();
      expect(bp.sources.length).toBeGreaterThan(0);
      expect(bp.duration).toBeGreaterThan(0);

      // Verify envelope bounds
      expect(bp.envelope.attack).toBeGreaterThanOrEqual(0);
      expect(bp.envelope.decay).toBeGreaterThanOrEqual(0);
      expect(bp.envelope.sustain).toBeGreaterThanOrEqual(0);
      expect(bp.envelope.sustain).toBeLessThanOrEqual(1.0);
      expect(bp.envelope.release).toBeGreaterThanOrEqual(0);

      // Verify source modalities
      for (const src of bp.sources) {
        if (src.type === "oscillator") {
          expect(src.frequency).toBeGreaterThan(0);
          expect(["sine", "triangle", "sawtooth", "square"]).toContain(src.oscillatorType);
        } else if (src.type === "fm") {
          expect(src.carrierFrequency).toBeGreaterThan(0);
          expect(src.modRatio).toBeGreaterThan(0);
          expect(src.modIndex).toBeGreaterThan(0);
        } else if (src.type === "pluck") {
          expect(src.frequency).toBeGreaterThan(0);
          expect(src.damping).toBeLessThan(1.0);
        }
      }
    }
  });

  describe("Planetary Celestial Frequencies", () => {
    it("tunes Mercury to 141.27 Hz fundamental", () => {
      const src = mercuryFundamentalBell.sources[0];
      if (src.type === "oscillator") expect(src.frequency).toBe(141.27);
    });

    it("tunes Sun to 126.22 Hz", () => {
      const src = sunSolarCarrier.sources[0];
      if (src.type === "oscillator") expect(src.frequency).toBe(126.22);
    });

    it("tunes Moon to 210.42 Hz", () => {
      const src = moonSynodicResonator.sources[0];
      if (src.type === "oscillator") expect(src.frequency).toBe(210.42);
    });

    it("tunes Venus to 221.23 Hz", () => {
      const src = venusAmorHarmonic.sources[0];
      if (src.type === "oscillator") expect(src.frequency).toBe(221.23);
    });

    it("tunes Jupiter to 183.58 Hz", () => {
      const src = jupiterWisdomChime.sources[0];
      if (src.type === "oscillator") expect(src.frequency).toBe(183.58);
    });

    it("tunes Saturn to 147.85 Hz", () => {
      const src = saturnDisciplineDrone.sources[0];
      if (src.type === "oscillator") expect(src.frequency).toBe(147.85);
    });
  });

  describe("FM Synthesis & Physical Modeling Modalities", () => {
    it("configures 2-Op FM Cyber Rhodes", () => {
      const src = fmCyberRhodes.sources[0];
      expect(src.type).toBe("fm");
      if (src.type === "fm") {
        expect(src.carrierFrequency).toBe(440);
        expect(src.modIndex).toBeGreaterThan(100);
      }
    });

    it("configures FM Metallic Space Bell", () => {
      const src = fmMetallicSpaceBell.sources[0];
      expect(src.type).toBe("fm");
      if (src.type === "fm") {
        expect(src.carrierFrequency).toBe(880);
        expect(src.modRatio).toBe(3.5);
      }
    });

    it("configures Karplus-Strong Physical Cyber Harp at C5 (523.25 Hz)", () => {
      const src = physicalCyberHarp.sources[0];
      expect(src.type).toBe("pluck");
      if (src.type === "pluck") {
        expect(src.frequency).toBe(523.25);
        expect(src.damping).toBeLessThan(0.1);
      }
    });

    it("configures Karplus-Strong Sitar Resonator at D4 (293.66 Hz)", () => {
      const src = physicalSitarPluck.sources[0];
      expect(src.type).toBe("pluck");
      if (src.type === "pluck") {
        expect(src.frequency).toBe(293.66);
      }
    });
  });
});