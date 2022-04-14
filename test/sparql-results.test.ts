import { describe, expect, it } from 'vitest';
import { parseSparqlResults } from '../src/sparql/results';
import {
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
