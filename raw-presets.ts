/**
 * @file src/renderer/lib/audio/presets/raw-presets.ts
 * @description A collection of example commands for the 'raw' sound synthesis tool.
 * This file serves as a creative library to showcase the capabilities of the on-the-fly sound engine.
 */

export interface RawPreset {
  name: string
  category: 'Percussion' | 'Sound Effects' | 'Instruments' | 'Pads & Drones' | 'Abstract'
  description: string
  command: string
}

export const rawPresets: RawPreset[] = [
  // --- PERCUSSION ---
  {
    name: 'Kick Drum (Tight)',
    category: 'Percussion',
    description: 'A short, punchy kick drum sound, good for electronic beats.',
    command: 'raw osc:sine:120 env:0.01:0.15:0:0.01 dur:0.16 filter:lowpass:400:2'
  },
  {
    name: '808 Kick',
    category: 'Percussion',
    description: 'A kick with a characteristic pitch drop, mimicking a classic drum machine.',
    command:
      'raw osc:sine:150 env:0.01:0.3:0:0.05 dur:0.35 lfo:sine:30:-100:frequency filter:lowpass:500'
  },
  {
    name: 'Snare Drum',
    category: 'Percussion',
    description: 'A blend of noise for the "snap" and a sine wave for the "body".',
    command: 'raw noise:white env:0.01:0.1:0:0.05 dur:0.16 filter:bandpass:1500:5 osc:sine:200'
  },
  {
    name: 'Closed Hi-Hat',
    category: 'Percussion',
    description: 'A crisp, closed hi-hat sound using filtered white noise.',
    command: 'raw noise:white env:0.01:0.03:0:0.01 dur:0.05 filter:highpass:8000:6'
  },
  {
    name: 'Open Hi-Hat',
    category: 'Percussion',
    description: 'A sustained, metallic open hi-hat with a slow decay.',
    command:
      'raw noise:white env:0.01:0.3:0.05:0.1 dur:0.4 filter:highpass:7000:5 osc:square:300:10 osc:square:450:-10'
  },
  {
    name: 'Cymbal Crash',
    category: 'Percussion',
    description: 'A complex, noisy crash with multiple oscillators and reverb.',
    command:
      'raw noise:white dur:1.5 env:0.01:1.4:0:0.1 filter:highpass:3000:2 osc:square:900:15 osc:square:1200:-15 osc:square:1500:10 distort:10 reverb:1:0.4'
  },
  {
    name: 'Low Tom',
    category: 'Percussion',
    description: 'A pitched tom drum with a downward pitch envelope.',
    command: 'raw osc:sine:150 env:0.01:0.2:0:0.05 dur:0.25 lfo:sine:20:-50:frequency'
  },

  // --- SOUND EFFECTS ---
  {
    name: 'Laser Blast',
    category: 'Sound Effects',
    description: 'A classic sci-fi laser "pew" with a rapid downward pitch sweep.',
    command: 'raw osc:square:1200 env:0.01:0.15:0:0.01 dur:0.16 lfo:sine:40:-1000:frequency'
  },
  {
    name: 'Power Up',
    category: 'Sound Effects',
    description: 'A video game-style power-up sound with a rising pitch and delay.',
    command:
      'raw osc:sawtooth:440 env:0.05:0.2:0.1:0.1 dur:0.4 lfo:sine:10:800:frequency delay:0.1:0.3:0.3'
  },
  {
    name: 'Coin Collect',
    category: 'Sound Effects',
    description: 'A bright, two-tone sound reminiscent of collecting a coin in a game.',
    command: 'raw osc:square:1046 env:0.01:0.1:0:0.01 dur:0.12 osc:square:1244:5'
  },
  {
    name: 'Explosion',
    category: 'Sound Effects',
    description: 'A rumbling explosion using distorted brown noise and a modulated filter.',
    command:
      'raw noise:brown dur:1 env:0.05:0.9:0:0.1 filter:lowpass:500:5 distort:80 lfo:sine:5:-400:filterCutoff'
  },
  {
    name: 'Alarm Siren',
    category: 'Sound Effects',
    description: 'A piercing alarm sound created by modulating frequency with a square LFO.',
    command: 'raw osc:sine:800 dur:2 lfo:square:4:200:frequency env:0.1:0.1:0.8:1'
  },
  {
    name: 'Sci-Fi Beep',
    category: 'Sound Effects',
    description: 'A simple, clean computer beep for user interfaces.',
    command: 'raw osc:sine:1500 env:0.001:0.05:0:0.01 dur:0.06'
  },
  {
    name: 'Spaceship Hum',
    category: 'Sound Effects',
    description: 'The low, steady hum of a starship engine, with subtle modulation.',
    command:
      'raw osc:sawtooth:80:-10 dur:5 env:1:1:0.8:2 osc:sawtooth:80:10 lfo:sine:0.5:5:frequency filter:lowpass:400:2'
  },
  {
    name: 'Water Drop',
    category: 'Sound Effects',
    description: 'A synthesized water droplet with a pitch drop and resonant filter.',
    command:
      'raw osc:sine:900 env:0.01:0.1:0:0.05 dur:0.16 filter:lowpass:1000:10 lfo:sine:30:-600:frequency reverb:0.5:0.6'
  },

  // --- INSTRUMENTS ---
  {
    name: 'Simple Flute',
    category: 'Instruments',
    description: 'A gentle flute-like sound with vibrato and a touch of reverb.',
    command: 'raw osc:sine:880 dur:1 env:0.1:0.2:0.5:0.2 lfo:sine:6:20:frequency reverb:0.5:0.3'
  },
  {
    name: 'Plucked String',
    category: 'Instruments',
    description: 'A basic plucked string or synth-bass sound.',
    command: 'raw osc:triangle:330 dur:0.8 env:0.005:0.7:0:0.1 filter:lowpass:2000:3'
  },
  {
    name: '8-Bit Jump',
    category: 'Instruments',
    description: 'The sound of a character jumping in a retro video game.',
    command: 'raw osc:square:600 env:0.01:0.1:0.1:0.05 dur:0.2 lfo:sine:15:400:frequency'
  },
  {
    name: 'Church Organ',
    category: 'Instruments',
    description: 'A powerful, multi-oscillator organ sound with heavy reverb.',
    command:
      'raw osc:sawtooth:440 dur:3 env:0.2:0.5:0.7:1 osc:sawtooth:880:5 osc:sawtooth:220:-5 reverb:2:0.5'
  },

  // --- PADS & DRONES ---
  {
    name: 'Dark Drone',
    category: 'Pads & Drones',
    description: 'A low, ominous drone with a slowly sweeping filter.',
    command:
      'raw osc:sawtooth:110 dur:8 env:3:2:0.8:3 filter:lowpass:300:1 lfo:sine:0.2:50:filterCutoff reverb:4:0.6'
  },
  {
    name: 'Crystal Pad',
    category: 'Pads & Drones',
    description: 'A bright, shimmering pad with detuned oscillators and delay.',
    command:
      'raw osc:triangle:880:7 dur:5 env:1.5:1:0.6:2 osc:triangle:1320:-7 delay:0.5:0.4:0.4 reverb:3:0.5 lfo:sine:0.3:20:frequency'
  },
  {
    name: 'Warp Drive',
    category: 'Pads & Drones',
    description: 'A sci-fi engine sound with a swirling, auto-panning filter.',
    command:
      'raw noise:white dur:4 env:1:0.5:0.5:1.5 filter:bandpass:1000:10 lfo:sine:1:800:filterCutoff distort:20 lfo:sine:0.3:1:pan'
  },

  // --- ABSTRACT ---
  {
    name: 'Metallic Clang',
    category: 'Abstract',
    description: 'A harsh, dissonant metallic impact.',
    command:
      'raw osc:square:500:10 dur:1 env:0.005:0.9:0:0.1 osc:square:753:-10 osc:square:1100:5 distort:40 filter:highpass:800:3 reverb:0.8:0.4'
  },
  {
    name: 'Digital Glitch',
    category: 'Abstract',
    description: 'A short, sharp burst of digital noise and distortion.',
    command:
      'raw noise:white dur:0.1 env:0.001:0.05:0:0.01 filter:bandpass:4000:20 lfo:square:80:3000:filterCutoff distort:90'
  },
  {
    name: 'Teleporter',
    category: 'Abstract',
    description: 'The sound of a matter stream being activated, with a rising filter sweep.',
    command:
      'raw noise:pink dur:1.5 env:0.5:0.2:0.1:0.5 filter:bandpass:2000:8 lfo:sine:5:1800:filterCutoff'
  }
]