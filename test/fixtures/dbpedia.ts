export const dbpediaQueryResponseOne = {
  head: { link: [], vars: ['s'] },
  results: {
    distinct: false,
    ordered: true,
    bindings: [
      { s: { type: 'uri', value: 'http://dbpedia.org/ontology/deathDate' } },
      { s: { type: 'uri', value: 'http://dbpedia.org/ontology/birthDate' } },
      {
        s: {
          type: 'uri',
          value: 'http://dbpedia.org/ontology/averageAnnualGeneration',
        },
      },
      { s: { type: 'uri', value: 'http://dbpedia.org/ontology/foalDate' } },
      { s: { type: 'uri', value: 'http://dbpedia.org/ontology/torqueOutput' } },
    ],
  },
};

export const dbpediaQueryResponseOneAlt = {
  head: { link: [], vars: ['o'] },
  results: {
    distinct: false,
    ordered: true,
    bindings: [
      { o: { type: 'uri', value: 'http://dbpedia.org/ontology/deathDate' } },
      { o: { type: 'uri', value: 'http://dbpedia.org/ontology/birthDate' } },
      {
        o: {
          type: 'uri',
          value: 'http://dbpedia.org/ontology/averageAnnualGeneration',
        },
      },
      { o: { type: 'uri', value: 'http://dbpedia.org/ontology/foalDate' } },
      { o: { type: 'uri', value: 'http://dbpedia.org/ontology/torqueOutput' } },
    ],
  },
};

export const dbpediaQueryResponseTwo = {
  head: { link: [], vars: ['p', 'o'] },
  results: {
    distinct: false,
    ordered: true,
    bindings: [
      {
        p: {
          type: 'uri',
          value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        },
        o: {
          type: 'uri',
          value: 'http://www.w3.org/2002/07/owl#FunctionalProperty',
        },
      },
      {
        p: {
          type: 'uri',
          value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        },
        o: {
          type: 'uri',
          value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property',
        },
      },
      {
        p: {
          type: 'uri',
          value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        },
        o: {
          type: 'uri',
          value: 'http://www.w3.org/2002/07/owl#DatatypeProperty',
        },
      },
      {
        p: {
          type: 'uri',
          value: 'http://www.w3.org/2002/07/owl#equivalentProperty',
        },
        o: {
          type: 'uri',
          value: 'https://d-nb.info/standards/elementset/gnd#dateOfDeath',
        },
      },
      {
        p: {
          type: 'uri',
          value: 'http://www.w3.org/2002/07/owl#equivalentProperty',
        },
        o: { type: 'uri', value: 'http://schema.org/deathDate' },
      },
    ],
  },
};

export const dbpediaQueryResponseThree = {
  head: { link: [], vars: ['s', 'p', 'o'] },
  results: {
    distinct: false,
    ordered: true,
    bindings: [
      {
        s: { type: 'uri', value: 'http://dbpedia.org/ontology/deathDate' },
        p: {
          type: 'uri',
          value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        },
        o: {
          type: 'uri',
          value: 'http://www.w3.org/2002/07/owl#FunctionalProperty',
        },
      },
      {
        s: { type: 'uri', value: 'http://dbpedia.org/ontology/birthDate' },
        p: {
          type: 'uri',
          value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        },
        o: {
          type: 'uri',
          value: 'http://www.w3.org/2002/07/owl#FunctionalProperty',
        },
      },
      {
        s: {
          type: 'uri',
          value: 'http://dbpedia.org/ontology/averageAnnualGeneration',
        },
        p: {
          type: 'uri',
          value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        },
        o: {
          type: 'uri',
          value: 'http://www.w3.org/2002/07/owl#FunctionalProperty',
        },
      },
      {
        s: { type: 'uri', value: 'http://dbpedia.org/ontology/foalDate' },
        p: {
          type: 'uri',
          value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        },
        o: {
          type: 'uri',
          value: 'http://www.w3.org/2002/07/owl#FunctionalProperty',
        },
      },
      {
        s: { type: 'uri', value: 'http://dbpedia.org/ontology/torqueOutput' },
        p: {
          type: 'uri',
          value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        },
        o: {
          type: 'uri',
          value: 'http://www.w3.org/2002/07/owl#FunctionalProperty',
        },
      },
    ],
  },
};

export const constructQueryResponse = `
<http://example.org/resource> <https://wiki.databorg.ai/direct> "direct property" .
<http://example.org/resource> <http://www.w3.org/2000/01/rdf-schema#label> "Test resource" .
<http://example.org/resource> <https://wiki.databorg.ai/mdx> <https://wiki.databorg.ai/MdxSeq> .
<http://example.org/resource> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://example.org/mdx2> <https://wiki.databorg.ai/more> "some more stuff" .
<http://example.org/mdx2> <https://wiki.databorg.ai/otherIndirect> "other indirect property" .
<http://example.org/mdx2> <https://wiki.databorg.ai/content> "## Another markdown text" .
<http://example.org/mdx2> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://wiki.databorg.ai/Mdx> .
<https://wiki.databorg.ai/MdxSeq> <http://www.w3.org/1999/02/22-rdf-syntax-ns#_2> <http://example.org/mdx2> .
<https://wiki.databorg.ai/MdxSeq> <http://www.w3.org/1999/02/22-rdf-syntax-ns#_1> <http://example.org/mdx1> .
<https://wiki.databorg.ai/MdxSeq> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Seq> .
<http://example.org/mdx1> <https://wiki.databorg.ai/indirect> "indirect property" .
<http://example.org/mdx1> <https://wiki.databorg.ai/content> "# Markdown title" .
<http://example.org/mdx1> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://wiki.databorg.ai/Mdx> .
`;
