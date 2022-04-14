import type { SparqlQuery } from 'sparqljs';
import type { QueryOptions } from 'types/client';
import { sparqlQueryToString } from './sparql/parser';
import { sparqlWithSubstitution } from './sparql/replace';
import { sparql } from './sparql/tag';

export class QueryManager {
  #prefixes: Record<string, string>;

  constructor({ prefixes }) {
    this.#prefixes = prefixes;
  }

  #getPrefixes(): string {
    return Object.entries(this.#prefixes)
      .map(([prefix, uri]) => `PREFIX ${prefix}: <${uri}>`)
      .join('\n');
  }

  transform({ query, variables = {} }: QueryOptions): SparqlQuery {
    let queryObject;
    // parse query string if needed
    if (typeof query === 'string') {
      queryObject = sparql(`${this.#getPrefixes()}\n${query}`);
    } else {
      queryObject = query;
    }
    // apply substitutions
    const queryWithVars = sparqlWithSubstitution({
      query: queryObject,
      variables,
    });
    return queryWithVars;
  }

  queryToString(query: SparqlQuery): string {
    const queryString = sparqlQueryToString(query);
    return queryString;
  }
}
