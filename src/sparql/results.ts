import jsonld from 'jsonld';
import N3 from 'n3';
import type { SPARQLBindings, SPARQLResults } from 'types/client';

const prefixes = {
  'schema:': 'http://schema.org/',
  'rdf:': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  'owl:': 'http://www.w3.org/2002/07/owl#',
  'dbo:': 'http://dbpedia.org/ontology/',
};

const replacePrefixes = (url: string) => {
  for (const prefix in prefixes) {
    const prefixUrl = prefixes[prefix];
    if (url.startsWith(prefixUrl)) {
      return url.replace(prefixUrl, prefix);
    }
  }

  return url;
};

const parseSimple = (results: SPARQLResults) => {
  const head = results.head?.vars;
  // if it's a boolean query with a boolean result
  // return the given boolean result as-is
  if (typeof results.boolean === 'boolean') {
    return results.boolean;
  }
  // otherwise - try to get bindings and process them
  const bindings = results.results?.bindings;
  const body = bindings?.map((binding) => {
    return head.reduce((acc, key) => {
      if (binding[key]) {
        acc[key] = replacePrefixes(binding[key].value);
      }
      return acc;
    }, {} as SPARQLResults);
  });
  return body;
};

const parseProperties = (
  results: SPARQLResults,
  predicates: SPARQLResultsPredicates
) => {
  const bindings = results.results.bindings;
  const resultMap = {};
  bindings.forEach((binding) => {
    const subject = replacePrefixes(binding[predicates.subjectVariable].value);
    const predicate = replacePrefixes(
      binding[predicates.predicateVariable].value
    );
    const object = replacePrefixes(binding[predicates.objectVariable].value);
    resultMap[subject] = resultMap[subject] || {};
    resultMap[subject][predicate] = object;
  });
  return resultMap;
};

const parseCustom = (
  results: SPARQLResults,
  rowProcessor: (row: SPARQLBindings, results: Array<any>) => any
) => {
  const bindings = results.results.bindings;
  const result = [];
  bindings.forEach((binding) => {
    rowProcessor(binding, result);
  });
  return result;
};

interface SPARQLResultsPredicates {
  subjectVariable?: string;
  predicateVariable?: string;
  objectVariable?: string;
}

interface SPARQLResultsParseOptions extends SPARQLResultsPredicates {
  type?: 'simple' | 'properties' | 'custom';
  rowProcessor?: (row: SPARQLBindings, results: Array<any>) => any;
}

export const parseSparqlResults = (
  results: SPARQLResults,
  options: SPARQLResultsParseOptions = {}
): any => {
  if (options.type === 'properties') {
    return parseProperties(results, options);
  }
  if (options.type === 'custom') {
    return parseCustom(results, options.rowProcessor);
  }
  // otherwise - fallback to simple processing
  return parseSimple(results);
};

const turtleToQuads = (turtle: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const parser = new N3.Parser();
    let parsed = [];
    parser.parse(turtle, (error, quad, prefixes) => {
      if (error) {
        reject(error);
        return;
      }
      if (quad) {
        parsed.push(quad);
        return;
      }
      resolve(parsed);
    });
  });
};

const quadsToString = (quads: Array<any>): Promise<string> => {
  return new Promise((resolve, reject) => {
    const writer = new N3.Writer({ format: 'N-Quads' });
    writer.addQuads(quads);
    writer.end((error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);
    });
  });
};

export const parseTextResults = async (
  results: string,
  prefixes: Record<string, string>,
  frame: object
): Promise<any> => {
  const quads = await turtleToQuads(results);
  const quadString = await quadsToString(quads);
  const doc = await jsonld.fromRDF(quadString, {
    format: 'application/n-quads',
  });
  // if user requested framing, apply it
  if (frame) {
    const framed = await jsonld.frame(doc, {
      '@context': prefixes ?? {},
      ...frame,
    });
    return framed;
  }
  return doc;
};
