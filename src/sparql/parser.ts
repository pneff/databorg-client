import type { SparqlQuery } from 'sparqljs';
import { Generator, Parser } from 'sparqljs';

export const sparqlParser = new Parser();
export const sparqlGenerator = new Generator();

export const sparqlQueryToString = (query: SparqlQuery): string => {
  const queryString = sparqlGenerator.stringify(query);
  return queryString;
};
