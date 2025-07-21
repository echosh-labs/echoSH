import { clearCommand } from './clear'
import { helpCommand } from './help'
import { testErrorCommand } from './testError'
import { toggleLatencyCommand } from './toggleLatency'
import { CommandDefinition } from '../types'
import { testCommand } from './test'
import { playSeagullCommand } from './playSeagul'
import { echoCommand } from "@/renderer/definitions/commands/core/echo.ts";

export const coreCommands: CommandDefinition[] = [
  clearCommand,
  helpCommand,
  testErrorCommand,
  toggleLatencyCommand,
  testCommand,
  playSeagullCommand,
  echoCommand
]
