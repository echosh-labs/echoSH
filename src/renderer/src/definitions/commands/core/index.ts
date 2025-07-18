import { clearCommand } from './clear'
import { helpCommand } from './help'
import { testErrorCommand } from './testError'
import { toggleLatencyCommand } from './toggleLatency'
import { CommandDefinition } from '../types'

export const coreCommands: CommandDefinition[] = [
  clearCommand,
  helpCommand,
  testErrorCommand,
  toggleLatencyCommand
]
