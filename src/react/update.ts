import { useContext, useState } from 'react';
import type { DataborgQueryResult, QueryVariables } from 'types/client';
import { DataborgContext } from './context';

type UpdateFnOptions = {
  variables?: QueryVariables;
};

type UseUpdateOptions = {};

export const useUpdate = (
  query,
  options?: UseUpdateOptions
): [
  (options?: UpdateFnOptions) => Promise<DataborgQueryResult | void>,
  {
    error: Error | null;
    loading: boolean;
  }
] => {
  const client = useContext(DataborgContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutateFunction = async ({ variables }: UpdateFnOptions = {}) => {
    if (!client) {
      throw new Error('No client provided');
    }

    setLoading(true);
    return client
      .update({ query, variables, options })
      .then((result) => {
        setLoading(false);
        return result;
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
        throw err;
      });
  };

  return [mutateFunction, { loading, error }];
};
