import { describe, it, expect } from "vitest";
import { cn, formatFrequency } from "./utils";

describe("Utility Functions", () => {
  describe("cn() Class Merger", () => {
    it("merges standard class names correctly", () => {
      const result = cn("text-white", "bg-black", false && "hidden", "px-4");
      expect(result).toBe("text-white bg-black px-4");
    });

    it("resolves conflicting tailwind classes with last-wins precedence", () => {
      const result = cn("px-2 py-1", "px-4");
      expect(result).toBe("py-1 px-4");
    });
  });

  describe("formatFrequency()", () => {
    it("formats sub-kilohertz frequencies with Hz suffix", () => {
      expect(formatFrequency(141.27)).toBe("141.3 Hz");
      expect(formatFrequency(432)).toBe("432.0 Hz");
      expect(formatFrequency(528)).toBe("528.0 Hz");
    });

    it("formats kilohertz frequencies with kHz suffix", () => {
      expect(formatFrequency(1000)).toBe("1.00 kHz");
      expect(formatFrequency(1500)).toBe("1.50 kHz");
      expect(formatFrequency(12000)).toBe("12.00 kHz");
    });
  });
});