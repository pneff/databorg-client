import { useContext, useEffect, useState } from 'react';
import type { DataborgQueryResult, QueryVariables } from 'types/client';
import type { ExchangeExecuteOptions } from 'types/exchange';
import { DataborgContext } from './context';
import { useRequest } from './util';

type UseQueryOptions = {
  variables: QueryVariables;
  skip?: boolean;
  options: ExchangeExecuteOptions;
};

export const useQuery = (query, options?: UseQueryOptions) => {
  const client = useContext(DataborgContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState<DataborgQueryResult | undefined>();
  const request = useRequest({ query, ...options });

  const executeQuery = async () => {
    setLoading(true);
    try {
      const { response } = await client.query(request);
      setData(response);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  // reset state on new query
  useEffect(() => {
    setError(null);
    setData(undefined);
  }, [request]);

  useEffect(() => {
    if (!client) {
      return;
    }
    // do not continue execution if error or loading
    if (error || loading) {
      return;
    }
    // do not continue execution if user provided skip
    if (options?.skip) {
      return;
    }

    executeQuery();
  }, [request]);

  return { error, data, loading, reexecuteQuery: executeQuery };
};
