import { clearCommand } from './clear'
import { helpCommand } from './help'
import { testErrorCommand } from './testError'
import { toggleLatencyCommand } from './toggleLatency'
import { CommandDefinition } from '../types'
import { testCommand } from './test'
import { playSeagullCommand } from './playSeagul'

export const coreCommands: CommandDefinition[] = [
  clearCommand,
  helpCommand,
  testErrorCommand,
  toggleLatencyCommand,
  testCommand,
  playSeagullCommand
]
