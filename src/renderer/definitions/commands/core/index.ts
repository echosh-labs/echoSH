import { clearCommand } from './clear'
import { helpCommand } from './help'
import { testErrorCommand } from './testError'
import { toggleLatencyCommand } from './toggleLatency'
import { CommandDefinition } from '../types'
import { testCommand } from './test'
import { playSeagullCommand } from './play'
import { echoCommand } from "@/renderer/definitions/commands/core/echo.ts";
import { colorCommand } from "@/renderer/definitions/commands/core/color.ts";
import { rawCommand } from "@/renderer/definitions/commands/core/raw.ts";
import { presetsCommand } from "@/renderer/definitions/commands/core/presets.ts";
import { stopCommand } from "@/renderer/definitions/commands/core/stop.ts";
import { themeCommand } from "@/renderer/definitions/commands/core/theme.ts";
// Music / instrument suite
import { noteCommand } from "@/renderer/definitions/commands/core/note.ts";
import { chordCommand } from "@/renderer/definitions/commands/core/chord.ts";
import { scaleCommand } from "@/renderer/definitions/commands/core/scale.ts";
import { melodyCommand } from "@/renderer/definitions/commands/core/melody.ts";
import { arpCommand } from "@/renderer/definitions/commands/core/arp.ts";
import { beatCommand } from "@/renderer/definitions/commands/core/beat.ts";
import { tempoCommand } from "@/renderer/definitions/commands/core/tempo.ts";
// Shell utilities
import { historyCommand } from "@/renderer/definitions/commands/core/history.ts";
import { dateCommand } from "@/renderer/definitions/commands/core/date.ts";
import { whoamiCommand } from "@/renderer/definitions/commands/core/whoami.ts";
// Fun / easter eggs
import { randomCommand } from "@/renderer/definitions/commands/core/random.ts";
import { fortuneCommand } from "@/renderer/definitions/commands/core/fortune.ts";
import { cowsayCommand } from "@/renderer/definitions/commands/core/cowsay.ts";
import { rollCommand } from "@/renderer/definitions/commands/core/roll.ts";
import { claudeCommand } from "@/renderer/definitions/commands/core/claude.ts";
// Audio engine controls
import { volumeCommand } from "@/renderer/definitions/commands/core/volume.ts";
import { muteCommand } from "@/renderer/definitions/commands/core/mute.ts";
import { latencyCommand } from "@/renderer/definitions/commands/core/latency.ts";
import { saveCommand } from "@/renderer/definitions/commands/core/save.ts";

export const coreCommands: CommandDefinition[] = [
  clearCommand,
  helpCommand,
  testErrorCommand,
  toggleLatencyCommand,
  testCommand,
  playSeagullCommand,
  echoCommand,
  colorCommand,
  rawCommand,
  presetsCommand,
  stopCommand,
  themeCommand,
  // Music / instrument suite
  noteCommand,
  chordCommand,
  scaleCommand,
  melodyCommand,
  arpCommand,
  beatCommand,
  tempoCommand,
  // Shell utilities
  historyCommand,
  dateCommand,
  whoamiCommand,
  // Fun / easter eggs
  randomCommand,
  fortuneCommand,
  cowsayCommand,
  rollCommand,
  claudeCommand,
  // Audio engine controls
  volumeCommand,
  muteCommand,
  latencyCommand,
  saveCommand
]
