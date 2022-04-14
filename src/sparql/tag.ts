import { sparqlParser } from './parser';

function parseDocument(source: string) {
  const parsed = sparqlParser.parse(source);
  // console.log(parsed);
  if (!parsed) {
    throw new Error('Not a valid SPARQL query.');
  }
  return parsed;
}

function varPrefix() {
  return `PREFIX var: <var://>\n`;
}

export function sparql(
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
  let result = `${varPrefix()}${literals[0]}`;

  // parse all args and join them with rest of literals as a result
  args.forEach((arg, i) => {
    result += arg;
    result += literals[i + 1];
  });

  // console.log({ literals, args, result });
  return parseDocument(result);
}
