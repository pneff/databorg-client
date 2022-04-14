import { DataborgExchange } from 'types/exchange';

export const exchangesFrom = (
  ...exchanges: DataborgExchange[]
): DataborgExchange => {
  const result = exchanges.reduce((prev, curr) => prev.concat(curr));
  return result;
};
