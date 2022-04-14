import 'isomorphic-unfetch';
import nock from 'nock';
import { describe, expect, it } from 'vitest';
import { DataborgClient, url } from '../src';
import {
  constructQueryResponse,
  dbpediaQueryResponseOne,
  dbpediaQueryResponseOneAlt,
  dbpediaQueryResponseThree,
  dbpediaQueryResponseTwo,
} from './fixtures/dbpedia';

const client = new DataborgClient({
  queryEndpoint: 'https://dbpedia.org/sparql',
  updateEndpoint: 'https://dbpedia.org/update',
  prefixes: {
    dbpedia: 'http://dbpedia.org/resource/',
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    borgwiki: 'https://wiki.databorg.ai/',
  },
  // cache: new InMemoryCache(),
});

describe('client', () => {
  it('executes basic select query', async () => {
    const scope = nock('https://dbpedia.org/')
      .post('/sparql')
      .reply(200, dbpediaQueryResponseOne, {
        'Content-Type': 'application/sparql-results+json',
      });

    const query = `SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 5`;
    const result = await client.query({ query });
    expect(result.response).toMatchInlineSnapshot(`
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

    scope.done();
  });

  it('executes basic select query with raw results', async () => {
    const scope = nock('https://dbpedia.org/')
      .post('/sparql')
      .reply(200, dbpediaQueryResponseOne, {
        'Content-Type': 'application/sparql-results+json',
      });

    const query = `SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 5`;
    const result = await client.query({ query, options: { rawResults: true } });
    expect(result.response).toMatchInlineSnapshot(`
      {
        "head": {
          "link": [],
          "vars": [
            "s",
          ],
        },
        "results": {
          "bindings": [
            {
              "s": {
                "type": "uri",
                "value": "http://dbpedia.org/ontology/deathDate",
              },
            },
            {
              "s": {
                "type": "uri",
                "value": "http://dbpedia.org/ontology/birthDate",
              },
            },
            {
              "s": {
                "type": "uri",
                "value": "http://dbpedia.org/ontology/averageAnnualGeneration",
              },
            },
            {
              "s": {
                "type": "uri",
                "value": "http://dbpedia.org/ontology/foalDate",
              },
            },
            {
              "s": {
                "type": "uri",
                "value": "http://dbpedia.org/ontology/torqueOutput",
              },
            },
          ],
          "distinct": false,
          "ordered": true,
        },
      }
    `);

    scope.done();
  });

  it('executes basic select query with variable substitution', async () => {
    const scope = nock('https://dbpedia.org/')
      .post('/sparql')
      .reply(200, dbpediaQueryResponseTwo, {
        'Content-Type': 'application/sparql-results+json',
      });

    const result = await client.query({
      query: `SELECT ?p ?o WHERE { ?uri ?p ?o } LIMIT 5`,
      variables: { uri: url`http://dbpedia.org/ontology/deathDate` },
    });
    expect(result.response).toMatchInlineSnapshot(`
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

    scope.done();
  });

  it('executes basic select query with prefix insertion', async () => {
    const scope = nock('https://dbpedia.org/')
      .post('/sparql')
      .reply(200, dbpediaQueryResponseOneAlt, {
        'Content-Type': 'application/sparql-results+json',
      });

    const result = await client.query({
      query: `SELECT ?o WHERE { ?uri dbpedia:test ?o } LIMIT 5`,
      variables: { uri: url`http://dbpedia.org/ontology/deathDate` },
    });
    expect(result.response).toMatchInlineSnapshot(`
      [
        {
          "o": "dbo:deathDate",
        },
        {
          "o": "dbo:birthDate",
        },
        {
          "o": "dbo:averageAnnualGeneration",
        },
        {
          "o": "dbo:foalDate",
        },
        {
          "o": "dbo:torqueOutput",
        },
      ]
    `);

    scope.done();
  });

  it('executes basic insert query with variable substitution', async () => {
    const scope = nock('https://dbpedia.org/').post('/update').reply(204, '');

    const result = await client.update({
      query: `INSERT DATA { var:uri a dbpedia:Resource . }`,
      variables: { uri: 'http://dbpedia.org/Test' },
    });
    expect(result.response).toMatchInlineSnapshot(`null`);

    scope.done();
  });

  it('executes complex insert query with variables substitution', async () => {
    const scope = nock('https://dbpedia.org/')
      .post('/update')
      .reply(204, (err, result) => {
        expect(result).toMatchInlineSnapshot(`
"PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX schema: <http://schema.org/>
INSERT DATA {
  GRAPH <http://example.org/Graph> {
    <borgwiki:User/748cdaf4-2546-47dc-a5a1-71c2343f7f56> rdf:type schema:Person.
    <borgwiki:User/748cdaf4-2546-47dc-a5a1-71c2343f7f56> schema:id \\"748cdaf4-2546-47dc-a5a1-71c2343f7f56\\".
    <borgwiki:User/748cdaf4-2546-47dc-a5a1-71c2343f7f56> schema:name \\"Tim Ermilov\\".
    <borgwiki:User/748cdaf4-2546-47dc-a5a1-71c2343f7f56> schema:image <https://avatars.githubusercontent.com/u/365944?v=4>.
    <borgwiki:User/748cdaf4-2546-47dc-a5a1-71c2343f7f56> schema:email \\"yamalight@outlook.com\\".
    <borgwiki:User/748cdaf4-2546-47dc-a5a1-71c2343f7f56> schema:validFrom \\"-1\\".
    <borgwiki:User/748cdaf4-2546-47dc-a5a1-71c2343f7f56> schema:dateCreated \\"2022-01-17T16:30:58.852Z\\".
    <borgwiki:User/748cdaf4-2546-47dc-a5a1-71c2343f7f56> schema:dateModified \\"2022-01-17T16:30:58.852Z\\".
  }
}"
`);
        return '';
      });

    const result = await client.update({
      query: `
      PREFIX schema: <http://schema.org/>

      INSERT DATA {
        GRAPH <http://example.org/Graph> {
          var:user a schema:Person ;
            schema:id var:id ;
            schema:name var:name ;
            schema:image var:image ;
            schema:email var:email ;
            schema:validFrom var:emailVerified ;
            schema:dateCreated var:createdAt ;
            schema:dateModified var:updatedAt .
        }
      }
      `,
      variables: {
        id: '748cdaf4-2546-47dc-a5a1-71c2343f7f56',
        user: url`borgwiki:User/748cdaf4-2546-47dc-a5a1-71c2343f7f56`,
        createdAt: '2022-01-17T16:30:58.852Z',
        updatedAt: '2022-01-17T16:30:58.852Z',
        name: 'Tim Ermilov',
        email: 'yamalight@outlook.com',
        image: url`https://avatars.githubusercontent.com/u/365944?v=4`,
        emailVerified: '-1',
      },
    });
    expect(result.response).toMatchInlineSnapshot(`null`);

    scope.done();
  });

  it('executes insert query with zero-length variable substitution', async () => {
    const scope = nock('https://dbpedia.org/')
      .post('/update')
      .reply(204, (err, result) => {
        expect(result).toMatchInlineSnapshot(`
"PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX schema: <http://schema.org/>
INSERT DATA {
  GRAPH <http://example.org/Graph> {
    <borgwiki:User/748cdaf4-2546-47dc-a5a1-71c2343f7f56> rdf:type schema:Person.
    <borgwiki:User/748cdaf4-2546-47dc-a5a1-71c2343f7f56> schema:name \\"Tim Ermilov\\".
    <borgwiki:User/748cdaf4-2546-47dc-a5a1-71c2343f7f56> schema:image \\"\\".
  }
}"
`);
        return '';
      });

    const result = await client.update({
      query: `
      PREFIX schema: <http://schema.org/>
      INSERT DATA {
        GRAPH <http://example.org/Graph> {
          var:user a schema:Person ;
            schema:name var:name ;
            schema:image var:image ;
        }
      }
      `,
      variables: {
        user: url`borgwiki:User/748cdaf4-2546-47dc-a5a1-71c2343f7f56`,
        name: 'Tim Ermilov',
        image: '',
      },
    });
    expect(result.response).toMatchInlineSnapshot(`null`);

    scope.done();
  });

  it('throws error on error from server', async () => {
    const scope = nock('https://dbpedia.org/')
      .post('/update')
      .reply(204, (_err, _result, cb) => {
        cb(Error('Error from server'), null);
      });

    try {
      await client.update({
        query: `
      PREFIX schema: <http://schema.org/>
      INSERT DATA {
        GRAPH <http://example.org/Graph> {
          var:user a schema:Person ;
            schema:name var:name ;
            schema:image var:image ;
        }
      }
      `,
        variables: {
          name: 'Tim Ermilov',
        },
      });
    } catch (err) {
      expect(err).toMatchInlineSnapshot(
        `[FetchError: request to https://dbpedia.org/update failed, reason: Error from server]`
      );
    }

    scope.done();
  });

  it('executes basic construct query with prefix insertion', async () => {
    const scope = nock('https://dbpedia.org/')
      .post('/sparql')
      .reply(200, constructQueryResponse, {
        'Content-Type': 'application/n-triples',
      });

    const result = await client.query({
      query: `CONSTRUCT { ?s ?p ?o } WHERE { SELECT ?o WHERE { ?s ?p ?o } }`,
    });
    expect(result.response).toMatchInlineSnapshot(`
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

    scope.done();
  });

  it('executes basic construct query and frames the result', async () => {
    const scope = nock('https://dbpedia.org/')
      .post('/sparql')
      .reply(200, constructQueryResponse, {
        'Content-Type': 'application/n-triples',
      });

    const result = await client.query({
      query: `CONSTRUCT { ?s ?p ?o } WHERE { SELECT ?o WHERE { ?s ?p ?o } }`,
      options: {
        frame: {
          '@type': 'http://www.w3.org/2000/01/rdf-schema#Class',
          contains: {
            '@type': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Seq',
            contains: {
              '@type': 'https://wiki.databorg.ai/Mdx',
            },
          },
        },
      },
    });
    expect(result.response).toMatchInlineSnapshot(`
      {
        "@context": {
          "borgwiki": "https://wiki.databorg.ai/",
          "dbpedia": "http://dbpedia.org/resource/",
          "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
          "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
        },
        "@id": "http://example.org/resource",
        "@type": "rdfs:Class",
        "borgwiki:direct": "direct property",
        "borgwiki:mdx": {
          "@id": "borgwiki:MdxSeq",
          "@type": "rdf:Seq",
          "rdf:_1": {
            "@id": "http://example.org/mdx1",
            "@type": "borgwiki:Mdx",
            "borgwiki:content": "# Markdown title",
            "borgwiki:indirect": "indirect property",
          },
          "rdf:_2": {
            "@id": "http://example.org/mdx2",
            "@type": "borgwiki:Mdx",
            "borgwiki:content": "## Another markdown text",
            "borgwiki:more": "some more stuff",
            "borgwiki:otherIndirect": "other indirect property",
          },
        },
        "rdfs:label": "Test resource",
      }
    `);

    scope.done();
  });

  it('throws error on malformed reply from the server', async () => {
    const scope = nock('https://dbpedia.org/')
      .post('/sparql')
      .reply(200, `<!-- MALFORMED REPLY HERE -->`);

    await expect(() =>
      client.query({
        query: `SELECT ?s ?p ?o WHERE { ?s ?p ?o }`,
      })
    ).rejects.toThrow('Unexpected "<!--" on line 1');

    scope.done();
  });

  it('executes basic select query with property parsing', async () => {
    const scope = nock('https://dbpedia.org/')
      .post('/sparql')
      .reply(200, dbpediaQueryResponseThree, {
        'Content-Type': 'application/sparql-results+json',
      });

    const result = await client.query({
      query: `SELECT ?s ?p ?o WHERE { ?s ?p ?o }`,
      options: {
        parsing: {
          type: 'properties',
          subjectVariable: 's',
          predicateVariable: 'p',
          objectVariable: 'o',
        },
      },
    });
    expect(result.response).toMatchInlineSnapshot(`
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

    scope.done();
  });

  it('executes basic select query with custom parsing', async () => {
    const scope = nock('https://dbpedia.org/')
      .post('/sparql')
      .reply(200, dbpediaQueryResponseThree, {
        'Content-Type': 'application/sparql-results+json',
      });

    const result = await client.query({
      query: `SELECT ?s ?p ?o WHERE { ?s ?p ?o }`,
      options: {
        parsing: {
          type: 'custom',
          rowProcessor: (row, result) => {
            const subject = row.s.value;
            const predicate = row.p.value;
            const object = row.o.value;
            result.push([subject, predicate, object]);
          },
        },
      },
    });
    expect(result.response).toMatchInlineSnapshot(`
      [
        [
          "http://dbpedia.org/ontology/deathDate",
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
          "http://www.w3.org/2002/07/owl#FunctionalProperty",
        ],
        [
          "http://dbpedia.org/ontology/birthDate",
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
          "http://www.w3.org/2002/07/owl#FunctionalProperty",
        ],
        [
          "http://dbpedia.org/ontology/averageAnnualGeneration",
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
          "http://www.w3.org/2002/07/owl#FunctionalProperty",
        ],
        [
          "http://dbpedia.org/ontology/foalDate",
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
          "http://www.w3.org/2002/07/owl#FunctionalProperty",
        ],
        [
          "http://dbpedia.org/ontology/torqueOutput",
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
          "http://www.w3.org/2002/07/owl#FunctionalProperty",
        ],
      ]
    `);

    scope.done();
  });
});
