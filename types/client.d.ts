import type { SparqlQuery } from 'sparqljs';
import type { DataborgExchange } from './exchange';

export type DataborgClientOptions = {
  queryEndpoint?: string;
  updateEndpoint?: string;
  headers?: Record<string, string>;
  prefixes?: Record<string, string>;
  // cache: DataborgCache;
  // defaultOptions?: DefaultOptions;
  name?: string;
  version?: string;
  exchange?: DataborgExchange;
};

export type QueryVariables = Record<string, any>;

export type QueryOptions = {
  key?: string;
  query: SparqlQuery | string;
  variables?: QueryVariables;
  options?: Record<string, any>;
};

export type UpdateOptions = {
  query: SparqlQuery | string;
  variables?: QueryVariables;
  options?: Record<string, any>;
};

export type DataborgQueryResult =
  | string
  | {
      [key: string]: any;
    };

export interface SPARQLBindings {
  [key: string]: {
    type: string;
    value: string;
  };
}

export interface SPARQLResults {
  head: {
    link: string[];
    vars: string[];
  };
  boolean?: boolean;
  results?: {
    bindings: SPARQLBindings[];
    distinct: boolean;
    ordered: boolean;
  };
}

export interface DataborgClientPlugin {
  name: string;
  version: string;
  init(client: DataborgClient): void;
}
