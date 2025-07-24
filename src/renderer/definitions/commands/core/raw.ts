import { CommandDefinition, CommandResult } from "../types";
import { rawPresets } from "../../../lib/audio/raw-presets.ts";
import {
  SoundBlueprint,
  OscillatorType,
  NoiseType,
  BiquadFilterType,
  OverSampleType,
  LfoAffects
} from "../../../lib/audio/audioBlueprints";

/**
 * Help text for the 'raw' command.
 */
const HELP_TEXT = `Usage: raw <keywords...>
Generates a sound on-the-fly from keyword arguments.
Each keyword modifies a part of the sound blueprint, processed in order.

Example: raw osc:sawtooth:220 filter:lowpass:800 dur:0.5

--- KEYWORDS ---

osc:<type>:<freq>:<detune>
  Adds an oscillator source. Clears default source on first use.
  - type: sine, square, sawtooth, triangle (default: sine)
  - freq: frequency in Hz (default: 440)
  - detune: cents (default: 0)
  Example: raw osc:sawtooth:220 osc:sine:440:10

noise:<type>
  Adds a noise source. Clears default source on first use.
  - type: white, brown, pink (default: white)
  Example: raw noise:pink

env:<attack>:<decay>:<sustain>:<release>
  Sets the ADSR envelope. All values in seconds.
  - Defaults: 0.01:0.1:0.1:0.2
  Example: raw env:0.01:0.2:0.5:1

filter:<type>:<freq>:<q>:<gain>
  Sets a biquad filter.
  - type: lowpass, highpass, bandpass, etc. (default: lowpass)
  - freq: frequency in Hz (default: 1000)
  - q: Q-factor (default: 1)
  - gain: for peaking/shelving filters (default: 0)
  Example: raw filter:bandpass:1500:5

set:<path>:<value>
  Sets a single property on the blueprint. Useful for fine-tuning.
  - path: dot-notation path to property (e.g., envelope.attack or sources.0.frequency)
  - value: the new value for the property.
  Example: raw filter:lowpass set:filter.Q:10

preset:<name>
  Loads a sound preset as a base. Other keywords will modify it.
  - name: The name of the preset (e.g., "808 Kick"). Quotes are optional.
  Example: raw preset:"808 Kick" dur:0.5

--- FULL KEYWORD LIST ---
preset, osc, noise, filter, env, reverb, delay, dur, lfo, distort, pan, comp, set

--- EXAMPLES ---

# A simple kick drum
raw osc:sine:150 env:0.01:0.2:0:0.1 dur:0.3 filter:lowpass:400

# A simple hi-hat
raw noise:white env:0.01:0.05:0:0.01 dur:0.1 filter:highpass:7000:5

# Shimmering pad
raw osc:sawtooth:220:5 osc:sawtooth:220:-5 env:1:1:0.5:2 dur:4 filter:lowpass:1000:2 lfo:sine:4:20 reverb:3:0.7`;

/**
 * Default creators for optional blueprint parts.
 * Used by the 'set' keyword to initialize parts on-demand.
 */
const defaultPartCreators: Record<string, () => any> = {
  filter: () => ({ type: "biquad", filterType: "lowpass", frequency: 1000, Q: 1, gain: 0 }),
  reverb: () => ({ decay: 1, mix: 0.5, reverse: false }),
  delay: () => ({ delayTime: 0.3, feedback: 0.4, mix: 0.5 }),
  lfo: () => ({ type: "sine", frequency: 5, depth: 100, affects: "frequency" }),
  distortion: () => ({ amount: 50, oversample: "none" }),
  panner: () => ({ type: "stereo", pan: 0 }),
  compressor: () => ({
    threshold: -24,
    knee: 30,
    ratio: 12,
    attack: 0.003,
    release: 0.25
  })
};

/**
 * A default blueprint to build upon.
 */
const createDefaultBlueprint = (): SoundBlueprint => ({
  sources: [{ type: "oscillator", oscillatorType: "sine", frequency: 440 }],
  envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.2 },
  duration: 0.4
});

type KeywordHandler = (
  parts: string[],
  blueprint: SoundBlueprint,
  report: string[],
  helpers: { clearSourcesIfNeeded: () => void }
) => void;

/**
 * A map of keyword handlers for building the sound blueprint. This data-driven
 * approach replaces a large switch statement, making the command easier to
 * maintain and extend.
 */
const keywordHandlers: Record<string, KeywordHandler> = {
  osc: (parts, blueprint, report, { clearSourcesIfNeeded }) => {
    clearSourcesIfNeeded();
    blueprint.sources.push({
      type: "oscillator",
      oscillatorType: (parts[1] as OscillatorType) || "sine",
      frequency: parseFloat(parts[2]) || 440,
      detune: parseFloat(parts[3]) || 0
    });
    report.push(`+ Added Oscillator: ${parts.slice(1).join(":")}`);
  },
  noise: (parts, blueprint, report, { clearSourcesIfNeeded }) => {
    clearSourcesIfNeeded();
    blueprint.sources.push({
      type: "noise",
      noiseType: (parts[1] as NoiseType) || "white"
    });
    report.push(`+ Added Noise: ${parts[1] || "white"}`);
  },
  filter: (parts, blueprint, report) => {
    blueprint.filter = {
      type: "biquad",
      filterType: (parts[1] as BiquadFilterType) || "lowpass",
      frequency: parseFloat(parts[2]) || 1000,
      Q: parseFloat(parts[3]) || 1,
      gain: parseFloat(parts[4]) || 0
    };
    report.push(`+ Set Filter: ${parts.slice(1).join(":")}`);
  },
  env: (parts, blueprint, report) => {
    blueprint.envelope = {
      attack: parseFloat(parts[1]) || 0.01,
      decay: parseFloat(parts[2]) || 0.1,
      sustain: parseFloat(parts[3]) || 0.1,
      release: parseFloat(parts[4]) || 0.2
    };
    report.push(`+ Set Envelope: ${parts.slice(1).join(":")}`);
  },
  reverb: (parts, blueprint, report) => {
    blueprint.reverb = {
      decay: parseFloat(parts[1]) || 1,
      mix: parseFloat(parts[2]) || 0.5,
      reverse: parts[3] === "true"
    };
    report.push(`+ Set Reverb: ${parts.slice(1).join(":")}`);
  },
  delay: (parts, blueprint, report) => {
    blueprint.delay = {
      delayTime: parseFloat(parts[1]) || 0.3,
      feedback: parseFloat(parts[2]) || 0.4,
      mix: parseFloat(parts[3]) || 0.5
    };
    report.push(`+ Set Delay: ${parts.slice(1).join(":")}`);
  },
  dur: (parts, blueprint, report) => {
    blueprint.duration = parseFloat(parts[1]) || 0.5;
    report.push(`+ Set Duration: ${parts[1]}`);
  },
  lfo: (parts, blueprint, report) => {
    blueprint.lfo = {
      type: (parts[1] as OscillatorType) || "sine",
      frequency: parseFloat(parts[2]) || 5,
      depth: parseFloat(parts[3]) || 100,
      // @ts-ignore
      affects: (parts[4] as LfoAffects) || "frequency"
    };
    report.push(`+ Set LFO: ${parts.slice(1).join(":")}`);
  },
  distort: (parts, blueprint, report) => {
    blueprint.distortion = {
      amount: parseFloat(parts[1]) || 50,
      oversample: (parts[2] as OverSampleType) || "none"
    };
    report.push(`+ Set Distortion: ${parts.slice(1).join(":")}`);
  },
  pan: (parts, blueprint, report) => {
    blueprint.panner = {
      type: "stereo",
      pan: parseFloat(parts[1]) || 0
    };
    report.push(`+ Set Panner: ${parts[1]}`);
  },
  comp: (parts, blueprint, report) => {
    blueprint.compressor = {
      threshold: parseFloat(parts[1]) || -24,
      knee: parseFloat(parts[2]) || 30,
      ratio: parseFloat(parts[3]) || 12,
      attack: parseFloat(parts[4]) || 0.003,
      release: parseFloat(parts[5]) || 0.25
    };
    report.push(`+ Set Compressor: ${parts.slice(1).join(":")}`);
  }
};

// Add aliases
keywordHandlers.oscillator = keywordHandlers.osc;
keywordHandlers.envelope = keywordHandlers.env;
keywordHandlers.duration = keywordHandlers.dur;
keywordHandlers.distortion = keywordHandlers.distort;
keywordHandlers.panner = keywordHandlers.pan;
keywordHandlers.compressor = keywordHandlers.comp;

const keywordSuggestions = [
  "preset:",
  "osc:",
  "noise:",
  "filter:",
  "env:",
  "reverb:",
  "delay:",
  "dur:",
  "lfo:",
  "distort:",
  "pan:",
  "comp:",
  "set:"
];

/**
 * Parses keywords and builds a SoundBlueprint.
 * Keywords format: <type>:<param1>:<param2>...
 */
export function buildBlueprintFromKeywords(keywords: string[]): {
  blueprint: SoundBlueprint;
  report: string[];
} {
  let processingKeywords = [...keywords];
  const report: string[] = [];

  const presetIndex = processingKeywords.findIndex((k) => k.toLowerCase().startsWith("preset:"));

  if (presetIndex > -1) {
    const presetKeyword = processingKeywords.splice(presetIndex, 1)[0];
    const presetName = presetKeyword.split(":").slice(1).join(":").replace(/"/g, "").trim();
    const preset = rawPresets.find((p) => p.name.toLowerCase() === presetName.toLowerCase());

    if (preset) {
      report.push(`+ Loaded preset: ${preset.name}`);
      const presetKeywords = preset.command.split(" ").slice(1);
      processingKeywords.unshift(...presetKeywords);
    } else {
      report.push(`! Preset not found: ${presetName}`);
    }
  }

  const blueprint = createDefaultBlueprint();
  let sourcesCleared = false;

  const clearSourcesIfNeeded = () => {
    if (!sourcesCleared) {
      blueprint.sources = [];
      sourcesCleared = true;
    }
  };

  for (const keyword of processingKeywords) {
    const parts = keyword.toLowerCase().split(":");
    const key = parts[0];

    const handler = keywordHandlers[key];

    try {
      if (handler) {
        handler(parts, blueprint, report, { clearSourcesIfNeeded });
      } else if (key === "set") {
        // 'set' is handled separately due to its unique logic with defaultPartCreators
        // and dynamic path traversal, which doesn't fit the standard handler signature cleanly.
        {
          const path = parts[1];
          const valueStr = parts[2];
          if (!path || valueStr === undefined) {
            report.push(`! Invalid 'set' usage. Format: set:path:value`);
            break;
          }

          const keys = path.split(".");
          let current: any = blueprint;

          // Traverse the path to find the target object
          for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (current[key] === undefined || current[key] === null) {
              // If a top-level optional part doesn't exist, create it.
              if (i === 0 && defaultPartCreators[key]) {
                current[key] = defaultPartCreators[key]();
                report.push(`i Initialized default ${key}`);
              } else {
                report.push(`! Path not found: '${path}'. Parent '${key}' does not exist.`);
                current = null;
                break;
              }
            }
            current = current[key];
          }

          if (current) {
            const finalKey = keys[keys.length - 1];
            if (typeof current !== "object") {
              report.push(`! Cannot set property on non-object at path: ${path}`);
            } else {
              const num = parseFloat(valueStr);
              const parsedValue = !isNaN(num)
                ? num
                : valueStr === "true"
                  ? true
                  : valueStr === "false"
                    ? false
                    : (valueStr as any); // Let it be a string
              current[finalKey] = parsedValue;
              report.push(`+ Set ${path} = ${valueStr}`);
            }
          }
          break;
        }
      } else {
        report.push(`! Unknown keyword: ${keyword}`);
      }
    } catch (e) {
      report.push(`! Error parsing keyword: ${keyword} - ${(e as Error).message}`);
    }
  }

  // Recalculate duration if envelope is set and duration is not explicitly set
  if (keywords.some((k) => k.startsWith("env")) && !keywords.some((k) => k.startsWith("dur"))) {
    const { attack, decay, release } = blueprint.envelope;
    blueprint.duration = attack + decay + release + 0.1; // Add a little buffer
    report.push(`i Auto-calculated duration: ${blueprint.duration.toFixed(2)}s`);
  }

  return { blueprint, report };
}

export const rawCommand: CommandDefinition = {
  name: "raw",
  description: "Generates a sound on-the-fly from keyword arguments.",
  execute: (args = []): CommandResult => {
    if (args.length === 0) {
      return { output: HELP_TEXT };
    }

    const { blueprint, report } = buildBlueprintFromKeywords(args);

    return {
      output: `Generating sound with blueprint:\n${report.join("\n")}`,
      soundBlueprint: blueprint
    };
  },
  argSet: [
    {
      placeholder: "keywords...",
      description:
        'A space-separated list of sound-building keywords (e.g., osc:sine:440, preset:"808 Kick").',
      getSuggestions: (currentArg: string) => {
        // Suggesting presets for the 'preset' keyword
        if (currentArg.startsWith("preset:")) {
          const search = currentArg.substring("preset:".length).replace(/"/g, "").toLowerCase();
          return rawPresets
            .filter((p) => p.name.toLowerCase().includes(search))
            .map((p) => `preset:"${p.name}"`);
        }

        // Suggesting top-level keywords if the user is typing a new one
        if (!currentArg.includes(":")) {
          return keywordSuggestions.filter((k) => k.startsWith(currentArg));
        }

        // Return no suggestions for other keyword parameters for now
        return [];
      }
    }
  ]
};
