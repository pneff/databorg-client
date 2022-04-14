import type { SPARQLResults } from 'types/client';
import type {
  DataborgExchange,
  ExchangeRequest,
  ExchangeResult,
} from 'types/exchange';

/**
 * Basic HTTP exchange.
 * Executes SPARQL queries over HTTP.
 */
export class HttpExchange implements DataborgExchange {
  #queryEndpoint: string;
  #updateEndpoint: string;
  #headers: Record<string, string>;
  #nextExchange: DataborgExchange;

  constructor({
    queryEndpoint,
    updateEndpoint,
    headers,
  }: {
    queryEndpoint: string;
    updateEndpoint?: string;
    headers?: Record<string, string>;
  }) {
    this.#queryEndpoint = queryEndpoint;
    this.#updateEndpoint = updateEndpoint ?? queryEndpoint;
    this.#headers = headers ?? {};
  }

  async #executeQuery({ query, endpoint, update = false }): Promise<{
    result: SPARQLResults | string | null;
    headers: Record<string, string>;
  }> {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': update
            ? 'application/sparql-update'
            : 'application/sparql-query',
          ...this.#headers,
        },
        body: query,
      });

      // get headers as object
      const headers = Object.fromEntries(res.headers.entries());
      // if empty response - just return
      if (res.status === 204) {
        return { result: null, headers };
      }

      // if content type is json - return json
      if (headers['content-type']?.includes('json')) {
        const json = await res.json();
        return { result: json as SPARQLResults, headers };
      }

      // otherwise return plain text
      const text = await res.text();
      return { result: text, headers };
    } catch (error) {
      // console.error(error);
      throw error;
    }
  }

  async execute({
    client,
    queryManager,
    query,
    update = false,
    options,
  }: ExchangeRequest): Promise<ExchangeResult> {
    const queryString = queryManager.queryToString(query);

    const { result, headers } = await this.#executeQuery({
      endpoint: update ? this.#updateEndpoint : this.#queryEndpoint,
      query: queryString,
      update,
    });
    // if last exchange - just return results
    if (!this.#nextExchange) {
      return { query, update, response: result, responseHeaders: headers };
    }
    // if there is next exchange - execute it
    return this.#nextExchange.execute({
      client,
      queryManager,
      query,
      update,
      response: result,
      responseHeaders: headers,
      options,
    });
  }

  concat(exchange: DataborgExchange): DataborgExchange {
    this.#nextExchange = exchange;
    return this;
  }
}
