import type {
  DataborgExchange,
  ExchangeRequest,
  ExchangeResult,
} from 'types/exchange';
import { parseSparqlResults, parseTextResults } from '../sparql/results';

/**
 * Result parse exchange.
 * Parses results of SPARQL queries.
 * Understands SPARQL JSON as well as graph (CONSTRUCT) query results.
 * On parsing failure, returns original results.
 */
export class ParseExchange implements DataborgExchange {
  #nextExchange: DataborgExchange;

  async execute({
    client,
    queryManager,
    query,
    update,
    response,
    responseHeaders,
    options,
  }: ExchangeRequest): Promise<ExchangeResult> {
    if (!response) {
      return { query, update, response, responseHeaders };
    }
    // if result is empty - just return
    if (typeof response !== 'string' && Object.keys(response).length === 0) {
      return { query, update, response, responseHeaders };
    }
    // if user requested raw results - return them
    if (options.rawResults) {
      return { query, update, response, responseHeaders };
    }

    let results;

    // parse as string
    try {
      if (typeof response === 'string') {
        // console.log('resp is string', response);
        results = await parseTextResults(
          response,
          client.prefixes,
          options.frame
        );
      } else {
        // otherwise - apply post-processing
        results = parseSparqlResults(response, options.parsing);
        // append original response as `_raw` property
        if (typeof results === 'object' && options.includeRawResults) {
          results._raw = response;
        }
      }
    } catch (error) {
      // append raw response to error
      error.response = response;
      throw error;
    }

    if (!this.#nextExchange) {
      return { query, update, response: results, responseHeaders };
    }

    return this.#nextExchange.execute({
      client,
      queryManager,
      query,
      update,
      response: results,
      responseHeaders,
      options,
    });
  }

  concat(exchange: DataborgExchange): DataborgExchange {
    this.#nextExchange = exchange;
    return this;
  }
}
