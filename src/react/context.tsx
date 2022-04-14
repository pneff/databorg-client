import * as React from 'react';
import { createContext } from 'react';
import type { DataborgClient } from '../client';

export const DataborgContext = createContext<DataborgClient | undefined>(
  undefined
);

export const DataborgProvider = ({
  children,
  client,
}: {
  children: React.ReactElement<any, any>;
  client: DataborgClient;
}) => {
  return (
    <DataborgContext.Provider value={client}>
      {children}
    </DataborgContext.Provider>
  );
};

export const useClient = (): DataborgClient => {
  const client = React.useContext(DataborgContext);
  return client;
};
