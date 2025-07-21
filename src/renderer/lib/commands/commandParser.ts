type ParsedCommand = {
  variables: Record<string, string>;
  command: string;
  args: string[];
};

export class CommandParser {
  static parse(
    input: string,
    providedVariables: Record<string, string> = {}
  ): ParsedCommand {
    const trimmedInput = input.trim();
    if (!trimmedInput)
      return { variables: {}, command: '', args: [] };

    // Tokenize quoted strings or unquoted words
    const tokens =
      trimmedInput.match(/"([^"\\]*(\\.[^"\\]*)*)"|[^\s"]+/g) || [];

    // Helper to strip surrounding quotes
    const stripQuotes = (str: string) =>
      str.startsWith('"') && str.endsWith('"')
        ? str.slice(1, -1).replace(/\\"/g, '"')
        : str;

    // Merge provided variables (inline will override)
    const mergedVariables: Record<string, string> = { ...providedVariables };
    let i = 0;

    // Parse unquoted variable assignments at the start
    while (
      i < tokens.length &&
      !tokens[i].startsWith('"') && // not a quoted string
      /^[^=\s]+=[\s\S]+$/.test(tokens[i])
      ) {
      const [varName, ...rest] = tokens[i].split('=');
      mergedVariables[varName] = rest.join('=');
      i++;
    }

    // Next token is the command (quoted or unquoted)
    let command = tokens[i] ? stripQuotes(tokens[i]) : '';
    i++;

    // The rest are arguments
    const args = tokens.slice(i).map(stripQuotes);

    // Substitute variables in command and args
    const varPattern = /\$(\w+)|\$\{(\w+)\}/g;
    function substitute(str: string): string {
      return str.replace(varPattern, (_, var1, var2) => {
        const name = var1 || var2;
        return mergedVariables.hasOwnProperty(name) ? mergedVariables[name] : '';
      });
    }

    command = substitute(command);
    const resolvedArgs = args.map(substitute);

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
