import fs from 'fs';
import { readFile } from 'fs/promises';
import { describe, expect, it } from 'vitest';
import { sparqlQueryToString } from '../src/sparql/parser';
import { sparqlWithSubstitution } from '../src/sparql/replace';
import { sparql } from '../src/sparql/tag';
import { url } from '../src/util/url-tag';

const baseDir = './test/fixtures/queries';

const folders = fs.readdirSync(baseDir);
const files = folders
  .map((folder) => {
    const folderPath = `${baseDir}/${folder}`;
    return fs.readdirSync(folderPath).map((f) => `${folderPath}/${f}`);
  })
  .flat();

describe('sparql-replace', () => {
  for (const file of files) {
    it(`should substitute ${file}`, async () => {
      const contents = (await readFile(file, 'utf8')).toString();
      if (contents.includes('###variables:')) {
        const [query, variablesString] = contents.split('###variables:');
        // convert variables with <> to urls
        const values = Object.entries(JSON.parse(variablesString)).map(
          ([key, value]: [string, any]) => {
            if (value.startsWith('<') && value.endsWith('>')) {
              return [key, url`${value.slice(1, -1)}`];
            }
            return [key, value];
          }
        );
        const variables = Object.fromEntries(values);
        const result = sparqlWithSubstitution({
          query: sparql(query),
          variables,
        });
        const resultString = sparqlQueryToString(result);
        expect(resultString).toMatchSnapshot();
      }
    });
  }

  it(`should substitute variables in graphs`, async () => {
    const query = `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    CREATE GRAPH var:uri;
    INSERT DATA {
      GRAPH var:uri {
        var:uri rdfs:label var:label .
      }
    }`;
    const result = sparqlWithSubstitution({
      query: sparql(query),
      variables: { uri: url`http://test.graph`, label: 'test' },
    });
    const resultString = sparqlQueryToString(result);
    expect(resultString).toMatchInlineSnapshot(`
"PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
CREATE GRAPH <http://test.graph>;
INSERT DATA { GRAPH <http://test.graph> { <http://test.graph> rdfs:label \\"test\\". } }"
`);
  });
});
