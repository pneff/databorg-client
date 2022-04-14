import type {
  DataborgClientOptions,
  QueryOptions,
  UpdateOptions,
} from 'types/client';
import type { DataborgExchange, ExchangeResult } from 'types/exchange';
import { HttpExchange } from './exchanges/http';
import { ParseExchange } from './exchanges/parse';
import { exchangesFrom } from './exchanges/util';
import { QueryManager } from './QueryManager';

export class DataborgClient {
  #queryEndpoint: string;
  #updateEndpoint: string;
  #headers: Record<string, string>;
  #exchange: DataborgExchange;
  #queryManager: QueryManager;

  name: string;
  version: string;
  prefixes: Record<string, string>;

  constructor({
    queryEndpoint,
    updateEndpoint,
    headers,
    prefixes,
    name,
    version,
    exchange,
  }: DataborgClientOptions) {
    this.#queryEndpoint = queryEndpoint;
    this.#updateEndpoint = updateEndpoint ?? queryEndpoint;
    this.#headers = headers ?? {};
    this.prefixes = prefixes ?? {};

    // set public client properties
    this.name = name ?? 'DataborgClient';
    this.version = version ?? '1.0.0';

    // init query manager
    this.#queryManager = new QueryManager({ prefixes: this.prefixes });

    // init exchange
    if (exchange) {
      // use provided exchange if given
      this.#exchange = exchange;
    } else {
      // otherwise use default http exchange with parse exchange in chain
      const httpEx = new HttpExchange({
        queryEndpoint: this.#queryEndpoint,
        updateEndpoint: this.#updateEndpoint,
        headers: this.#headers,
      });
      const parseEx = new ParseExchange();
      this.#exchange = exchangesFrom(httpEx, parseEx);
    }
  }

  async query({
    query,
    variables,
    options = {},
  }: QueryOptions): Promise<ExchangeResult> {
    // transform query, substitute vars, validate, etc
    const queryWithVars = this.#queryManager.transform({ query, variables });
    // execute via exchange
    const results = await this.#exchange.execute({
      client: this,
      queryManager: this.#queryManager,
      query: queryWithVars,
      options,
    });
    return results;
  }

  async update({
    query,
    variables,
    options = {},
  }: UpdateOptions): Promise<ExchangeResult> {
    // transform query, substitute vars, validate, etc
    const updateWithVars = this.#queryManager.transform({
      query,
      variables,
    });
    // execute via exchange
    const results = await this.#exchange.execute({
      client: this,
      queryManager: this.#queryManager,
      query: updateWithVars,
      update: true,
      options,
    });
    return results;
  }
}
