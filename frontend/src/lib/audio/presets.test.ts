import { describe, it, expect } from "vitest";
import {
  audioPresets,
  mercuryFundamentalBell,
  intuitionVioletDrone,
  idealismCyanArpeggio,
  alchemicalTransmutationDrone,
} from "./presets";

describe("Audio Presets and DSP Blueprints", () => {
  it("contains valid audio presets in the master registry", () => {
    expect(audioPresets.length).toBeGreaterThan(0);

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

      // Verify oscillator frequencies
      for (const src of bp.sources) {
        if (src.type === "oscillator") {
          expect(src.frequency).toBeGreaterThan(0);
          expect(["sine", "triangle", "sawtooth", "square"]).toContain(src.oscillatorType);
        }
      }
    }
  });

  describe("Foundations Tripartite Consciousness Harmonic Blueprints", () => {
    it("configures Stage 1: Intuition Violet Drone at 432 Hz harmonic", () => {
      expect(
        intuitionVioletDrone.sources.some(
          (s) => s.type === "oscillator" && s.frequency === 432
        )
      ).toBe(true);
      expect(intuitionVioletDrone.envelope.attack).toBeGreaterThan(0);
      expect(intuitionVioletDrone.duration).toBeGreaterThan(2);
    });

    it("configures Stage 2: Idealism Cyan Solfeggio Ascent at 528 Hz", () => {
      expect(
        idealismCyanArpeggio.sources.some(
          (s) => s.type === "oscillator" && s.frequency === 528
        )
      ).toBe(true);
      expect(idealismCyanArpeggio.filter?.type).toBe("bandpass");
    });

    it("configures Stage 3: Illumination Mercury Orbital Bell at 141.27 Hz", () => {
      const firstSource = mercuryFundamentalBell.sources[0];
      if (firstSource.type === "oscillator") {
        expect(firstSource.frequency).toBe(141.27);
      }
      expect(
        mercuryFundamentalBell.sources.some(
          (s) => s.type === "oscillator" && s.frequency === 565.08
        )
      ).toBe(true);
    });
  });
});