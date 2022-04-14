import { SparqlQuery } from 'sparqljs';
import type { QueryManager } from '../src/QueryManager';
import type { DataborgQueryResult } from './client';

export interface DataborgExchange {
  execute(req: ExchangeRequest): Promise<ExchangeResult>;

  concat(link: DataborgExchange): DataborgExchange;
}

export type ExchangeResult = {
  query: SparqlQuery;
  update?: boolean;
  response?: DataborgQueryResult;
  responseHeaders?: Record<string, string>;
};

export type ExchangeRequest = {
  client: DataborgClient;
  queryManager: QueryManager;
  query: SparqlQuery;
  update?: boolean;
  response?: any;
  responseHeaders?: Record<string, string>;
  options?: ExchangeExecuteOptions;
};

export type ExchangeExecuteOptions = Record<string, any>;
