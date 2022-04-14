<div align="center">
  <h1>@databorg/client</h1>

  <br />

  <strong>
    Highly versatile SPARQL client for modern age
  </strong>
</div>

## Features

- **One package** to get a working SPARQL client in javascript or React
- Powerful **templating** for queries [via placeholder variables](./docs/Basics.md#templating)
- Client-level [prefix management](./docs/Basics.md#setting-up-the-client)
- Automated [results parsing](./docs/Basics.md#results-parsing)
- Query validation out-of-the-box
- Fully **customisable** behaviour [via "exchanges"](./docs/Basics.md#exchanges)

While SPARQL is an great language, client libraries today typically come with a limited set of features and offload the additional work to developers who are using them.  
We aim to create a more powerful and developer-friendly out-of-the-box experience instead.

## Installation

```sh
npm install @databorg/client
```

## Basic usage

```js
import { DataborgClient, url } from '@databorg/client';

// create new client
const client = new DataborgClient({
  queryEndpoint: 'https://dbpedia.org/sparql',
});

// execute a query
const result = await client.query({
  query: `SELECT ?p ?o WHERE { ?uri ?p ?label } LIMIT 5`,
  variables: {
    uri: url`http://dbpedia.org/ontology/deathDate`,
    label: 'Hello world!',
  },
});

// execute an update
const result = await client.update({
  query: `INSERT DATA { var:uri a dbpedia:Resource . }`,
  variables: { uri: url`http://dbpedia.org/Test` },
});
```

## Documentation

The documentation contains everything you need to know about `@databorg/client`:

- **[Basics](./docs/Basics.md)** — contains the "Getting Started" guide and all you need to know when first using `@databorg/client`.

## License

Licensed under MIT.
