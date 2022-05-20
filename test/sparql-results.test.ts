import { describe, expect, it } from 'vitest';
import { parseSparqlResults, parseTextResults } from '../src/sparql/results';
import {
  constructQueryResponse,
  dbpediaQueryResponseOne,
  dbpediaQueryResponseThree,
  dbpediaQueryResponseTwo,
} from './fixtures/dbpedia';

describe('sparql-results', () => {
  it('parses basic results', () => {
    const result = parseSparqlResults(dbpediaQueryResponseOne);
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "s": "dbo:deathDate",
        },
        {
          "s": "dbo:birthDate",
        },
        {
          "s": "dbo:averageAnnualGeneration",
        },
        {
          "s": "dbo:foalDate",
        },
        {
          "s": "dbo:torqueOutput",
        },
      ]
    `);
  });

  it('parses basic results #2', () => {
    const result = parseSparqlResults(dbpediaQueryResponseTwo);
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "o": "owl:FunctionalProperty",
          "p": "rdf:type",
        },
        {
          "o": "rdf:Property",
          "p": "rdf:type",
        },
        {
          "o": "owl:DatatypeProperty",
          "p": "rdf:type",
        },
        {
          "o": "https://d-nb.info/standards/elementset/gnd#dateOfDeath",
          "p": "owl:equivalentProperty",
        },
        {
          "o": "schema:deathDate",
          "p": "owl:equivalentProperty",
        },
      ]
    `);
  });

  it('parses basic results as property map', () => {
    const result = parseSparqlResults(dbpediaQueryResponseThree, {
      type: 'properties',
      subjectVariable: 's',
      predicateVariable: 'p',
      objectVariable: 'o',
    });
    expect(result).toMatchInlineSnapshot(`
      {
        "dbo:averageAnnualGeneration": {
          "rdf:type": "owl:FunctionalProperty",
        },
        "dbo:birthDate": {
          "rdf:type": "owl:FunctionalProperty",
        },
        "dbo:deathDate": {
          "rdf:type": "owl:FunctionalProperty",
        },
        "dbo:foalDate": {
          "rdf:type": "owl:FunctionalProperty",
        },
        "dbo:torqueOutput": {
          "rdf:type": "owl:FunctionalProperty",
        },
      }
    `);
  });

  it('parses basic results with custom function', () => {
    const rowProcessor = (row, results) => {
      results.push({ s: 'http://test/subj', p: row.p.value, o: row.o.value });
    };
    const result = parseSparqlResults(dbpediaQueryResponseTwo, {
      type: 'custom',
      rowProcessor,
    });
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "o": "http://www.w3.org/2002/07/owl#FunctionalProperty",
          "p": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
          "s": "http://test/subj",
        },
        {
          "o": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property",
          "p": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
          "s": "http://test/subj",
        },
        {
          "o": "http://www.w3.org/2002/07/owl#DatatypeProperty",
          "p": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
          "s": "http://test/subj",
        },
        {
          "o": "https://d-nb.info/standards/elementset/gnd#dateOfDeath",
          "p": "http://www.w3.org/2002/07/owl#equivalentProperty",
          "s": "http://test/subj",
        },
        {
          "o": "http://schema.org/deathDate",
          "p": "http://www.w3.org/2002/07/owl#equivalentProperty",
          "s": "http://test/subj",
        },
      ]
    `);
  });

  it('parses basic results with missing vars', () => {
    const result = parseSparqlResults({
      head: { link: [], vars: ['s', 'p'] },
      results: {
        distinct: false,
        ordered: true,
        bindings: [
          {
            s: { type: 'uri', value: 'http://dbpedia.org/ontology/deathDate' },
          },
          {
            s: { type: 'uri', value: 'http://dbpedia.org/ontology/birthDate' },
          },
          {
            s: {
              type: 'uri',
              value: 'http://dbpedia.org/ontology/averageAnnualGeneration',
            },
          },
          { s: { type: 'uri', value: 'http://dbpedia.org/ontology/foalDate' } },
          {
            s: {
              type: 'uri',
              value: 'http://dbpedia.org/ontology/torqueOutput',
            },
          },
        ],
      },
    });
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "s": "dbo:deathDate",
        },
        {
          "s": "dbo:birthDate",
        },
        {
          "s": "dbo:averageAnnualGeneration",
        },
        {
          "s": "dbo:foalDate",
        },
        {
          "s": "dbo:torqueOutput",
        },
      ]
    `);
  });
});

it('parses basic text results', async () => {
  const result = await parseTextResults(constructQueryResponse);
  expect(result).toMatchInlineSnapshot(`
    [
      {
        "@id": "http://example.org/mdx1",
        "@type": [
          "https://wiki.databorg.ai/Mdx",
        ],
        "https://wiki.databorg.ai/content": [
          {
            "@value": "# Markdown title",
          },
        ],
        "https://wiki.databorg.ai/indirect": [
          {
            "@value": "indirect property",
          },
        ],
      },
      {
        "@id": "http://example.org/mdx2",
        "@type": [
          "https://wiki.databorg.ai/Mdx",
        ],
        "https://wiki.databorg.ai/content": [
          {
            "@value": "## Another markdown text",
          },
        ],
        "https://wiki.databorg.ai/more": [
          {
            "@value": "some more stuff",
          },
        ],
        "https://wiki.databorg.ai/otherIndirect": [
          {
            "@value": "other indirect property",
          },
        ],
      },
      {
        "@id": "http://example.org/resource",
        "@type": [
          "http://www.w3.org/2000/01/rdf-schema#Class",
        ],
        "http://www.w3.org/2000/01/rdf-schema#label": [
          {
            "@value": "Test resource",
          },
        ],
        "https://wiki.databorg.ai/direct": [
          {
            "@value": "direct property",
          },
        ],
        "https://wiki.databorg.ai/mdx": [
          {
            "@id": "https://wiki.databorg.ai/MdxSeq",
          },
        ],
      },
      {
        "@id": "https://wiki.databorg.ai/MdxSeq",
        "@type": [
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#Seq",
        ],
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#_1": [
          {
            "@id": "http://example.org/mdx1",
          },
        ],
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#_2": [
          {
            "@id": "http://example.org/mdx2",
          },
        ],
      },
    ]
  `);
});

it('parses basic text results and applies framing', async () => {
  const result = await parseTextResults(
    constructQueryResponse,
    {
      example: 'http://example.org/',
      borgwiki: 'https://wiki.databorg.ai/',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    },
    {
      '@type': 'http://www.w3.org/2000/01/rdf-schema#Class',
      contains: {
        '@type': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Seq',
        contains: {
          '@type': 'https://wiki.databorg.ai/Content',
        },
      },
    }
  );
  expect(result).toMatchInlineSnapshot(`
    {
      "@context": {
        "borgwiki": "https://wiki.databorg.ai/",
        "example": "http://example.org/",
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
      },
      "@id": "example:resource",
      "@type": "rdfs:Class",
      "borgwiki:direct": "direct property",
      "borgwiki:mdx": {
        "@id": "borgwiki:MdxSeq",
        "@type": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Seq",
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#_1": {
          "@id": "example:mdx1",
          "@type": "borgwiki:Mdx",
          "borgwiki:content": "# Markdown title",
          "borgwiki:indirect": "indirect property",
        },
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#_2": {
          "@id": "example:mdx2",
          "@type": "borgwiki:Mdx",
          "borgwiki:content": "## Another markdown text",
          "borgwiki:more": "some more stuff",
          "borgwiki:otherIndirect": "other indirect property",
        },
      },
      "rdfs:label": "Test resource",
    }
  `);
});
