import type { Term } from 'sparqljs';

function parseDocument(source: string): Term {
  return {
    termType: 'NamedNode',
    value: source,
    equals: (other) => other.value === source,
  };
}

export function url(
  literals: string | readonly string[],
  ...args: readonly any[]
) {
  // if input is one string - convert it to array
  // for further processing
  if (typeof literals === 'string') {
    literals = [literals];
  }

  // set first part of input as variable prefix
  // and initial input result
  let result = literals[0];

  // parse all args and join them with rest of literals as a result
  args.forEach((arg, i) => {
    result += arg;
    result += literals[i + 1];
  });

  // console.log({ literals, args, result });
  return parseDocument(result);
}
