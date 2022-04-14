import sha256 from 'hash.js/lib/hash/sha/256';
import * as React from 'react';
import type { QueryOptions } from 'types/client';

const createRequest = ({
  query,
  options,
  variables,
}: QueryOptions): QueryOptions => {
  if (!variables) variables = {};
  return {
    key: sha256()
      .update(`${JSON.stringify(query)}||${JSON.stringify(variables)}`)
      .digest('hex'),
    query,
    variables,
    options,
  };
};

export const useRequest = ({
  query,
  variables,
  options,
}: QueryOptions): QueryOptions => {
  const prev = React.useRef(undefined);

  return React.useMemo(() => {
    const request = createRequest({ query, variables, options });
    // We manually ensure reference equality if the key hasn't changed
    if (prev.current !== undefined && prev.current.key === request.key) {
      return prev.current;
    } else {
      prev.current = request;
      return request;
    }
  }, [query, variables]);
};
