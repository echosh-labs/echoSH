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

export const coreCommands: CommandDefinition[] = [
  clearCommand,
  helpCommand,
  testErrorCommand,
  toggleLatencyCommand,
  testCommand,
  playSeagullCommand,
  echoCommand,
  colorCommand,
  rawCommand
]
