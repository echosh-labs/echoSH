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

const VALID_THEMES = ['dark', 'light', 'system'] as const;

export const themeCommand: CommandDefinition = {
  name: "theme",
  description: 'Switches between dark/light/system themes, or lists the color palette.',
  execute: (args, contexts) => {
    const arg = args[0]?.toLowerCase();

    if (!arg || arg === 'list') {
      const palette = Object.keys(themeColors).join(', ');
      return {
        output: `Current theme: ${contexts.theme.theme}\nUsage: theme <dark|light|system>\n\nPalette: ${palette}`
      };
    }

    if ((VALID_THEMES as readonly string[]).includes(arg)) {
      contexts.theme.setTheme(arg as (typeof VALID_THEMES)[number]);
      return { output: `Theme set to '${arg}'.` };
    }

    return { output: `Invalid theme '${arg}'. Choose one of: ${VALID_THEMES.join(', ')}.` };
  },
  argSet: [
    { literal: 'dark', description: 'Use the dark theme.' },
    { literal: 'light', description: 'Use the light theme.' },
    { literal: 'system', description: 'Follow the system theme.' },
    { literal: 'list', description: 'List the color palette.' }
  ]
}
