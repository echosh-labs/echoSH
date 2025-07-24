import { CommandDefinition } from "@/renderer/definitions/commands/types.ts";

export class CommandPrediction {
  commandList: CommandDefinition[];

  multiPrediction: boolean = false;

  doublePress: number = 0;
  doublePressStartText: string = "";

  constructor(commandList: CommandDefinition[]) {
    this.commandList = commandList;
  }

  predict(input: string): string | string[] {
    if (input.length === 0) return "";

    if (this.doublePressStartText.length > 0) {
      input = this.doublePressStartText;
    }

    const chars = input.split(" ");

    const lastWord = chars[chars.length - 1];

    const found = this.commandList.filter((cmd) =>
      cmd.name.toLowerCase().startsWith(lastWord.toLowerCase())
    );

    // Check if a command is found that is exactly the one entered

    if (found.length === 1) {
      this.multiPrediction = false;
      return chars.slice(0, -1).join(" ") + found[0].name;
    }
    if (found.length === 0) {
      this.multiPrediction = false;
      return input;
    }

    if (this.multiPrediction) {
      this.doublePress = (this.doublePress % found.length) + 1;
      return chars.slice(0, -1).join(" ") + found[this.doublePress - 1].name;
    } else {
      this.doublePressStartText = input;
      this.multiPrediction = true;
      return found.map((cmd) => cmd.name);
    }
  }

  reset() {
    this.multiPrediction = false;
    this.doublePress = 0;
    this.doublePressStartText = "";
  }
}
