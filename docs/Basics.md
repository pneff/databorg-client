# Basics

`@databorg/client` is a highly versatile SPARQL client for modern age. It's built to be both easy to use for newcomers to SPARQL, and extensible, to grow to support large-scale applications and highly customized SPARQL infrastructure.

## Setting up the Client

The `@databorg/client` and package exports a method called `createClient` which we can use to create the SPARQL client. This central Client manages all of our GraphQL requests and results.

```js
import { DataborgClient } from '@databorg/client';

// create new client
const client = new DataborgClient({
  queryEndpoint: 'https://dbpedia.org/sparql',
  updateEndpoint: 'https://dbpedia.org/update', // optional, uses queryEndpoint by default
  headers: {
    Authorization: 'Bearer TOKEN',
  },
  prefixes: {
    foaf: 'http://xmlns.com/foaf/0.1/',
  },
});
```

At the bare minimum we'll need to pass an endpoint URL when we create a client to get started.

Another common options include `headers` and `prefixes`.
Header option allows us to customize the request headers for all requests, while prefixes option allows us to define custom prefixes used within all queries.

## Queries and Updates

When you're using `@databorg/client` to send queries or updates - the `client.query` and `client.update` methods allow you to do just that.

```js
// execute a query
const result = await client.query({
  query: `SELECT ?p WHERE { ?uri ?p ?label } LIMIT 5`,
  variables: {
    uri: url`http://dbpedia.org/ontology/deathDate`,
    label: 'Hello world!',
  },
});

// execute an update
const result = await client.update({
  query: sparql`INSERT DATA { var:uri a dbpedia:Resource . }`,
  variables: { uri: url`http://dbpedia.org/Test` },
});
```

## SPARQL and URL Tags

A notable utility functions are the `sparql` and `url` tagged template literal function.

Wherever `@databorg/client` accepts a query document, we can either pass a string or a `SparqlQuery` document.
`sparql` is a utility that allows a `SparqlQuery` to be created directly.

In most examples we may have passed a string to define a query document, like so:

```js
const basicQuery = `
  SELECT ?s ?p ?o WHERE {
    ?s ?p ?o .
  }
`;
```

We may also use the `sparql` tag function to create a `SparqlQuery` directly:

```js
import { sparql } from '@databorg/client';

const basicQuery = sparql`
  SELECT ?s ?p ?o WHERE {
    ?s ?p ?o .
  }
`;
```

The `url` is an utility that allows us to convert a string into a `NamedNode` used in query (i.e. when you want to use value as URI, not as a literal).

```js
import { url } from '@databorg/client';

// execute an update
const result = await client.update({
  query: `INSERT DATA { var:uri a dbpedia:Resource . }`,
  variables: {
    // using url tagged template literal will ensure that the value is a NamedNode
    // and is used and an URI, not a literal
    uri: url`http://dbpedia.org/Test`,
  },
});
```

## React

This section covers how to install and setup `@databorg/client`, as well as query and update data, with React.

First, setup the client as described [above](#setting-up-the-client).
Once the client is created, you will need to provide it to your React app via the Context API.
This may be done with the help of the `DataborgProvider` export.

```js
import { DataborgProvider } from '@databorg/client';

// wrap your app in a provider
// this will pass the client to all components
const App = ({ children }) => (
  <DataborgProvider client={client}>{children}</DataborgProvider>
);
```

### Queries

Here we have implemented our first SPARQL query to fetch all triples for `http://example.com` resource.
We see that useQuery accepts query and options, and returns an object with results.
The object we then get in return contains a result object, an error object, loading state indicator and a re-execute function.

```js
// execute a query
const MyQueryComponent = () => {
  const { data, error, loading, reexecuteQuery } = useQuery(
    `SELECT ?p ?o WHERE { ?uri ?p ?o }`,
    {
      variables: { uri: url`http://example.com` },
    }
  );

  // reexecute the query when needed
  useEffect(() => reexecuteQuery(), [someCondition]);

  if (error) return <div>Error: {error.message}</div>;
  if (loading) return <div>Loading...</div>;

  return <div>{JSON.stringify(data)}</div>;
};
```

### Updates

`@databorg/client` offers a `useUpdate` hook to execute update queries.

Contrary to the `useQuery` output, `useUpdate` returns an tuple.
The first item in the tuple again contains an update function, while second - loading state and error.

Unlike the `useQuery` hook, the `useUpdate` hook doesn't execute automatically.
To execute our update we _have_ to call the execute function — `updateResource` in our example — which is the first item in the tuple.

```js
// execute an update
const MyUpdateComponent = () => {
  const [updateResource, { loading, error }] = useUpdate(
    `INSERT DATA { var:uri a dbpedia:Resource . }`
  );

  const runUpdate = () =>
    updateResource({
      variables: { uri: url`http://dbpedia.org/Test` },
    });

  if (error) return <div>Error: {error.message}</div>;
  if (loading) return <div>Loading...</div>;

  return <button onClick={runUpdate}>Click to update!</button>;
};
```

## Templating

`@databorg/client` comes with powerful query template engine.
It allows us to define a query template and pass it variables, building new queries on-demand.
There are two ways to defined templated variables - one for queries and one for updates.

In queries, we can simply use SPARQL variables, like so:

```js
const result = await client.query({
  query: `SELECT ?p WHERE { ?uri ?p ?label } LIMIT 5`,
  variables: {
    uri: url`http://dbpedia.org/ontology/deathDate`,
    label: 'Hello world!',
  },
});
```

This will result in the following final query:

```
SELECT ?p WHERE { <http://dbpedia.org/ontology/deathDate> ?p "Hello world!" } LIMIT 5
```

Since one cannot use SPARQL variables in updates, `@databorg/client` introduces a special `var:` prefix for variables in update queries, e.g.:

```js
const result = await client.update({
  query: `INSERT DATA { var:uri a dbpedia:Resource . }`,
  variables: { uri: url`http://dbpedia.org/Test` },
});
```

This will result in the following final query:

```
INSERT DATA { <http://dbpedia.org/Test> a dbpedia:Resource . }
```

## Results parsing

By default, `@databorg/client` can parse two different types of results:

- SPARQL JSON results
- CONSTRUCT query results

Type of response is detected automatically based on response headers.

Client also provides a way to switch between three different kinds of parsing for SPARQL JSON results:

1. Simple parsing (used by default) - parses SPARQL JSON response and converts each row into an object with properties mapped to variable names, e.g.:

   ```js
   const result = await client.update({
     query: `SELECT ?p ?o WHERE { ?s ?p ?o }`,
   });
   // will result in following
   const result = [
     {
       o: 'owl:FunctionalProperty',
       p: 'rdf:type',
     },
   ];
   ```

2. Property parsing - parses SPARQL JSON response and converts all results into an object with properties nested based on provided structure, e.g.:
   ```js
   const result = await client.update({
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
   // will result in following
   const result = {
     'dbo:averageAnnualGeneration': {
       'rdf:type': 'owl:FunctionalProperty',
     },
     'dbo:birthDate': {
       'rdf:type': 'owl:FunctionalProperty',
     },
   };
   ```
3. Custom row-based parsing - parses SPARQL JSON response using provided parsing function, e.g.:
   ```js
   const result = await client.update({
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
   // will result in following
   const result = [
     [
       'http://dbpedia.org/ontology/deathDate',
       'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
       'http://www.w3.org/2002/07/owl#FunctionalProperty',
     ],
     [
       'http://dbpedia.org/ontology/birthDate',
       'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
       'http://www.w3.org/2002/07/owl#FunctionalProperty',
     ],
   ];
   ```

## Exchanges

The client itself doesn't actually know what to do with any of the operations (be in `query` or `update`).
Instead, it sends them through "exchanges".
Exchanges are akin to [middleware in Redux](https://redux.js.org/advanced/middleware) and have access to all operations and all results.
Multiple exchanges are chained to process our operations and to execute logic on them, one of them being the httpExchange, which as the name implies sends our requests to our HTTP API.

The default set of exchanges that `@databorg/client` contains and applies to a client are:

- HttpExchange: Sends an operation to the HTTP API using fetch and adds results to the output stream
- ParseExchange: Parses the response from the SPARQL server and adds it to the output stream

When we don't pass the `exchanges` option manually to our client then these are the ones that will be applied.

Exchanged determine a lot of the logic of the client, taking care of things like sending requests to our API, parsing, deduplication, caching, etc.
