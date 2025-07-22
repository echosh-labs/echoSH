import { CommandDefinition } from "@/renderer/definitions/commands/types.ts";

const themeColors: { [key: string]: string } = {
  background: 'bg-background',
  foreground: 'bg-foreground',
  card: 'bg-card',
  'card-foreground': 'bg-card-foreground',
  popover: 'bg-popover',
  'popover-foreground': 'bg-popover-foreground',
  primary: 'bg-primary',
  'primary-foreground': 'bg-primary-foreground',
  secondary: 'bg-secondary',
  'secondary-foreground': 'bg-secondary-foreground',
  muted: 'bg-muted',
  'muted-foreground': 'bg-muted-foreground',
  accent: 'bg-accent',
  'accent-foreground': 'bg-accent-foreground',
  destructive: 'bg-destructive',
  'destructive-foreground': 'bg-destructive-foreground',
  border: 'bg-border',
  input: 'bg-input',
  ring: 'bg-ring'
}

export const themeCommand: CommandDefinition = {
  name: "theme",
  description: 'Displays the application color palette.',
  execute: (args) => {

    let output = 'Unrecognized parameter';
    if (args.length === 0 || args[0] === 'list') {
      output = Object.entries(themeColors).map(tc => tc[0]).join(', ');
    }

    return {
      output
    }
  },
  argSet: []
}
