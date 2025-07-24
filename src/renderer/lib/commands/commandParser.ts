import CommandProcessor from "@/renderer/lib/commands/commandProcessor.ts";

type ParsedCommand = {
  variables: Record<string, string>;
  command: string;
  args: string[];
};

// MAX_DEPTH prevents infinite recursion on nested $()
const MAX_DEPTH = 10;

export class CommandParser {
  static parse(
    input: string,
    providedVariables: Record<string, string> = {},
    processor: CommandProcessor,
    depth: number = 0 // Used for recursion guard
  ): ParsedCommand {
    if (depth > MAX_DEPTH) {
      throw new Error("Too many levels of command substitution");
    }
    const trimmedInput = input.trim();
    if (!trimmedInput) return { variables: {}, command: "", args: [] };

    // Tokenize quoted strings or unquoted words
    const tokens = trimmedInput.match(/"([^"\\]*(\\.[^"\\]*)*)"|[^\s"]+/g) || [];

    // Helper to strip surrounding quotes
    const stripQuotes = (str: string) =>
      str.startsWith('"') && str.endsWith('"') ? str.slice(1, -1).replace(/\\"/g, '"') : str;

    // Merge provided variables (inline will override)
    const mergedVariables: Record<string, string> = { ...providedVariables };
    let i = 0;

    // Parse unquoted variable assignments at the start
    while (
      i < tokens.length &&
      !tokens[i].startsWith('"') && // not a quoted string
      /^[^=\s]+=[\s\S]+$/.test(tokens[i])
    ) {
      const [varName, ...rest] = tokens[i].split("=");
      mergedVariables[varName] = rest.join("=");
      i++;
    }

    // The next token is the command (quoted or unquoted)
    let command = tokens[i] ? stripQuotes(tokens[i]) : "";
    i++;

    // The rest are arguments
    const args = tokens.slice(i).map(stripQuotes);

    function substituteCommands(str: string): string {
      let result = "";
      let i = 0;
      while (i < str.length) {
        if (str[i] === "$" && str[i + 1] === "(") {
          let depth = 1;
          let start = i + 2;
          let j = start;
          while (j < str.length && depth > 0) {
            if (str[j] === "$" && str[j + 1] === "(") {
              depth++;
              j++;
            } else if (str[j] === ")") depth--;
            j++;
          }
          if (depth === 0) {
            const inner = str.slice(start, j - 1);
            let subResult = "";
            if (processor) {
              // Actually process the inner command!
              const processed = processor.process(inner, mergedVariables, depth + 1);
              subResult = processed.output;
            } else {
              // Fallback: just parse
              const parsed = CommandParser.parse(inner, providedVariables, processor);
              subResult = [parsed.command, ...parsed.args].join(" ").trim();
            }
            result += subResult;
            i = j;
            continue;
          }
        }
        result += str[i];
        i++;
      }
      return result;
    }

    // Substitute variables in command and args
    const varPattern = /\$(\w+)|\$\{(\w+)}/g;
    function substituteVars(str: string): string {
      return str.replace(varPattern, (_, var1, var2) => {
        const name = var1 || var2;
        return mergedVariables.hasOwnProperty(name) ? mergedVariables[name] : "";
      });
    }

    function fullySubstituteCommands(str: string, maxDepth = 10): string {
      let prev: string;
      let curr = str;
      let count = 0;
      do {
        prev = curr;
        curr = substituteCommands(prev);
        count++;
      } while (curr !== prev && count < maxDepth);
      return curr;
    }

    command = substituteVars(fullySubstituteCommands(command));
    const resolvedArgs = args.map((arg) => substituteVars(fullySubstituteCommands(arg)));

    return { variables: mergedVariables, command, args: resolvedArgs };
  }
}

/*
// --- TEST CASES ---
console.log(CommandParser.parse('echo "user=test"'));
// { variables: {}, command: 'echo', args: ['user=test'] }

console.log(CommandParser.parse('USER=josh echo $USER', {}));
// { variables: { USER: 'josh' }, command: 'echo', args: ['josh'] }

console.log(CommandParser.parse('echo $USER', { USER: 'alice' }));
// { variables: { USER: 'alice' }, command: 'echo', args: ['alice'] }

console.log(CommandParser.parse('echo "hello world" $USER', { USER: 'bob' }));
// { variables: { USER: 'bob' }, command: 'echo', args: ['hello world', 'bob'] }
*/
