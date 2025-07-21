import { CommandDefinition } from "@/renderer/definitions/commands/types.ts";
import { rainbowFlutter } from "@/renderer/lib/audio/sounds/rainbow-flutter.ts";
// import { echoEffect } from "@/renderer/definitions/commands/core/echo.ts";

const validColors: { [key: string]: string } = {
  default: 'text-cyan-400',
  white: 'text-foreground',
  cyan: 'text-cyan-400',
  green: 'text-green-400',
  yellow: 'text-yellow-400',
  red: 'text-red-400' // Using a standard red for better visibility
}

export const colorCommand: CommandDefinition = {
  name: 'color',
  execute: (args: string[], setters) => {
    let output;

    const found = validColors[args[0]];

    if (args.length <= 0 || args[0] === 'list') {
      output = Object.keys(validColors).join(", ")
      return {output}
    }

    if (found) {
      setters.setColor(found);
      output = `Setting color to '${found}'`
    }
    else {
      output = `Error: Invalid color '${args[0]}'. Use 'color:list' to see available colors.`
    }
    return {output}
  },
  // soundBlueprint: echoEffect,
  description: 'Manage the terminal colors.',
  argSet: [
    {
      literal: "list",
      description: "List available colors",
    },
    {
      description: "Set the terminal color.",
      placeholder: "color"
    }
  ],
  soundBlueprint: rainbowFlutter
}
