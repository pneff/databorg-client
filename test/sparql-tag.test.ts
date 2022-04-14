import { describe, expect, it } from 'vitest';
import { sparql } from '../src/sparql/tag';

describe('sparql', () => {
  it('parses queries', () => {
    const query = sparql`SELECT ?s ?p ?o WHERE { ?s ?p ?o }`;
    expect(query).toMatchInlineSnapshot(`
      {
        "prefixes": {
          "var": "var://",
        },
        "queryType": "SELECT",
        "type": "query",
        "variables": [
          Variable {
            "termType": "Variable",
            "value": "s",
          },
          Variable {
            "termType": "Variable",
            "value": "p",
          },
          Variable {
            "termType": "Variable",
            "value": "o",
          },
        ],
        "where": [
          {
            "triples": [
              {
                "object": Variable {
                  "termType": "Variable",
                  "value": "o",
                },
                "predicate": Variable {
                  "termType": "Variable",
                  "value": "p",
                },
                "subject": Variable {
                  "termType": "Variable",
                  "value": "s",
                },
              },
            ],
            "type": "bgp",
          },
        ],
      }
    `);
  });

  it('throws an error on malformed query', () => {
    expect(() => {
      sparql`SELECT ?s ?p ?o WHERE ?s ?p ?o`;
    }).toThrowErrorMatchingSnapshot();
  });

  it('parses queries when called as a function', () => {
    expect(sparql('SELECT ?s WHERE { ?s ?p ?p }')).toMatchInlineSnapshot(`
      {
        "prefixes": {
          "var": "var://",
        },
        "queryType": "SELECT",
        "type": "query",
        "variables": [
          Variable {
            "termType": "Variable",
            "value": "s",
          },
        ],
        "where": [
          {
            "triples": [
              {
                "object": Variable {
                  "termType": "Variable",
                  "value": "p",
                },
                "predicate": Variable {
                  "termType": "Variable",
                  "value": "p",
                },
                "subject": Variable {
                  "termType": "Variable",
                  "value": "s",
                },
              },
            ],
            "type": "bgp",
          },
        ],
      }
    `);
  });

  it('parses queries with weird substitutions', () => {
    const obj = Object.create(null);
    expect(sparql`SELECT ?s WHERE { ?s ?p "${obj.missing}" }`)
      .toMatchInlineSnapshot(`
        {
          "prefixes": {
            "var": "var://",
          },
          "queryType": "SELECT",
          "type": "query",
          "variables": [
            Variable {
              "termType": "Variable",
              "value": "s",
            },
          ],
          "where": [
            {
              "triples": [
                {
                  "object": Literal {
                    "datatype": NamedNode {
                      "termType": "NamedNode",
                      "value": "http://www.w3.org/2001/XMLSchema#string",
                    },
                    "language": "",
                    "termType": "Literal",
                    "value": "undefined",
                  },
                  "predicate": Variable {
                    "termType": "Variable",
                    "value": "p",
                  },
                  "subject": Variable {
                    "termType": "Variable",
                    "value": "s",
                  },
                },
              ],
              "type": "bgp",
            },
          ],
        }
      `);
    expect(sparql`SELECT ?s WHERE { ?s ?p "${null}" }`).toMatchInlineSnapshot(`
      {
        "prefixes": {
          "var": "var://",
        },
        "queryType": "SELECT",
        "type": "query",
        "variables": [
          Variable {
            "termType": "Variable",
            "value": "s",
          },
        ],
        "where": [
          {
            "triples": [
              {
                "object": Literal {
                  "datatype": NamedNode {
                    "termType": "NamedNode",
                    "value": "http://www.w3.org/2001/XMLSchema#string",
                  },
                  "language": "",
                  "termType": "Literal",
                  "value": "null",
                },
                "predicate": Variable {
                  "termType": "Variable",
                  "value": "p",
                },
                "subject": Variable {
                  "termType": "Variable",
                  "value": "s",
                },
              },
            ],
            "type": "bgp",
          },
        ],
      }
    `);
    expect(sparql`SELECT ?s WHERE { ?s ?p "${0}" }`).toMatchInlineSnapshot(`
      {
        "prefixes": {
          "var": "var://",
        },
        "queryType": "SELECT",
        "type": "query",
        "variables": [
          Variable {
            "termType": "Variable",
            "value": "s",
          },
        ],
        "where": [
          {
            "triples": [
              {
                "object": Literal {
                  "datatype": NamedNode {
                    "termType": "NamedNode",
                    "value": "http://www.w3.org/2001/XMLSchema#string",
                  },
                  "language": "",
                  "termType": "Literal",
                  "value": "0",
                },
                "predicate": Variable {
                  "termType": "Variable",
                  "value": "p",
                },
                "subject": Variable {
                  "termType": "Variable",
                  "value": "s",
                },
              },
            ],
            "type": "bgp",
          },
        ],
      }
    `);
  });

  it('returns the same object for the same query, even with whitespace differences', () => {
    expect(sparql`SELECT ?s WHERE { ?s ?p ?o }`).toEqual(
      sparql`SELECT ?s WHERE { ?s ?p ?o }`
    );
  });
});
