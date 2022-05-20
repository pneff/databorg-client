import { url } from '@databorg/client';
import { describe, expect, it } from 'vitest';

describe('url', () => {
  it('parses string to NamedNode', () => {
    const urlResult = url`http://test.graph`;
    expect(urlResult).toMatchInlineSnapshot(`
      {
        "equals": [Function],
        "termType": "NamedNode",
        "value": "http://test.graph",
      }
    `);
  });
});
