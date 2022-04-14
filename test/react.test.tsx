/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react-hooks';
import 'isomorphic-unfetch';
import nock from 'nock';
import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { DataborgClient } from '../src/client';
import { DataborgProvider, useQuery, useUpdate } from '../src/react';
import { sparql } from '../src/sparql/tag';
import {
  dbpediaQueryResponseOne,
  dbpediaQueryResponseTwo,
} from './fixtures/dbpedia';

describe('useQuery Hook', () => {
  it('should handle a simple query', async () => {
    const scope = nock('https://dbpedia.org/')
      .post('/sparql')
      .reply(200, dbpediaQueryResponseOne, {
        'Content-Type': 'application/sparql-results+json',
      });
    const query = sparql`SELECT ?s WHERE { ?s ?p ?o }`;
    const client = new DataborgClient({
      queryEndpoint: 'https://dbpedia.org/sparql',
    });

    const wrapper = ({ children }: any) => (
      <DataborgProvider client={client}>{children}</DataborgProvider>
    );

    const { result, waitForNextUpdate } = renderHook(() => useQuery(query), {
      wrapper,
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(undefined);
    await waitForNextUpdate();
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toMatchInlineSnapshot(`
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

  it('should handle a simple update', async () => {
    const scope = nock('https://dbpedia.org/')
      .post('/sparql')
      .reply(200, (_err, body) => {
        expect(body).toMatchInlineSnapshot(
          `"INSERT DATA { <http://example.com/> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.com/Type>. }"`
        );
        return '';
      });
    const query = sparql`INSERT DATA { <http://example.com/> a <http://example.com/Type> }`;
    const client = new DataborgClient({
      queryEndpoint: 'https://dbpedia.org/sparql',
    });

    const wrapper = ({ children }: any) => (
      <DataborgProvider client={client}>{children}</DataborgProvider>
    );

    const { result } = renderHook(() => useUpdate(query), {
      wrapper,
    });
    // make sure initial state is correct
    expect(result.current[1].loading).toBe(false);
    expect(typeof result.current[0]).toBe('function');
    // execute update
    await act(() => result.current[0]());
    // make sure results are correctly written
    expect(result.current[1].loading).toBe(false);

    scope.done();
  });

  it('should throw an error on update failure', async () => {
    const query = `INSERT DATA { <http://example.com/> a broken:prefix }`;
    const client = new DataborgClient({
      queryEndpoint: 'https://dbpedia.org/sparql',
    });

    const wrapper = ({ children }: any) => (
      <DataborgProvider client={client}>{children}</DataborgProvider>
    );

    const { result } = renderHook(() => useUpdate(query), {
      wrapper,
    });
    // make sure initial state is correct
    expect(result.current[1].loading).toBe(false);
    expect(typeof result.current[0]).toBe('function');
    // execute update
    try {
      await act(() => result.current[0]());
    } catch (err) {
      // make sure results are correctly written
      expect(result.current[1].loading).toBe(false);
      expect(result.current[1].error).toMatchInlineSnapshot(
        `[Error: Unknown prefix: broken]`
      );
      expect(err).toMatchInlineSnapshot(`[Error: Unknown prefix: broken]`);
    }
  });

  it('should re-execute query', async () => {
    let reply = 0;
    const replies = [dbpediaQueryResponseOne, dbpediaQueryResponseTwo];
    const scope = nock('https://dbpedia.org/')
      .post('/sparql')
      .twice()
      .reply(() => {
        return [
          200,
          replies[reply++],
          {
            'Content-Type': 'application/sparql-results+json',
          },
        ];
      });
    const query = sparql`SELECT ?s WHERE { ?s ?p ?o }`;
    const client = new DataborgClient({
      queryEndpoint: 'https://dbpedia.org/sparql',
    });

    const wrapper = ({ children }: any) => (
      <DataborgProvider client={client}>{children}</DataborgProvider>
    );

    const { result, waitForNextUpdate } = renderHook(() => useQuery(query), {
      wrapper,
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(undefined);
    await waitForNextUpdate();
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toMatchInlineSnapshot(`
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

    // ask to re-execute query
    await result.current.reexecuteQuery();
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toMatchInlineSnapshot(`
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
});
