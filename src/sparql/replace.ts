import type {
  BgpPattern,
  BindPattern,
  ConstructQuery,
  Expression,
  GroupPattern,
  InsertDeleteOperation,
  OperationExpression,
  Pattern,
  Quads,
  Query,
  SparqlQuery,
  Term,
  Triple,
  Update,
} from 'sparqljs';
import type { QueryVariables } from 'types/client';

const isValueURI = (value: string | Term) => {
  if (typeof value === 'string') {
    return false;
  }

  return value.termType === 'NamedNode';
};

const handleVariableType = (value: string | Term) => {
  if (typeof value !== 'string' && value.termType !== undefined) {
    return value.termType;
  }

  return isValueURI(value) ? 'NamedNode' : 'Literal';
};

const handleVariableValue = (value: string | Term) => {
  if (typeof value === 'string') {
    return value;
  }

  return value.value;
};

const replaceTerm = ({
  term,
  name,
  value,
}: {
  term: { termType?: string; value?: string };
  name: string;
  value: any;
}) => {
  // ignore undefined values
  if (!term) {
    return;
  }
  // console.log('replace', { term, name, value });
  if (term.termType === 'Variable' && term.value === name) {
    term.termType = handleVariableType(value);
    term.value = handleVariableValue(value);
  } else if (term.termType === 'NamedNode' && term.value === `var://${name}`) {
    term.termType = handleVariableType(value);
    term.value = handleVariableValue(value);
  }
};

const replaceExpression = ({
  expression,
  variables,
}: {
  expression: Expression;
  variables: QueryVariables;
}): Expression => {
  // console.log(expression);
  if (Array.isArray((expression as OperationExpression).args)) {
    for (const arg of (expression as OperationExpression).args) {
      if ((arg as Term).termType === 'Variable') {
        for (const variable of Object.keys(variables)) {
          if ((arg as Term).value === variable) {
            const value = variables[variable];
            (arg as Term).termType = handleVariableType(value);
            (arg as Term).value = handleVariableValue(value);
          }
        }
      }
      if (Array.isArray((arg as OperationExpression).args)) {
        replaceExpression({ expression: arg as Expression, variables });
      }
    }
  }
  return expression;
};

const replaceTermWithVariables = ({
  term,
  variables,
}: {
  term: Term;
  variables: QueryVariables;
}): Term => {
  for (const variable of Object.keys(variables)) {
    replaceTerm({
      term,
      name: variable,
      value: variables[variable],
    });
    replaceTerm({
      term,
      name: variable,
      value: variables[variable],
    });
    replaceTerm({
      term,
      name: variable,
      value: variables[variable],
    });
  }
  return term;
};

const replaceWithVariables = ({
  triple,
  variables,
}: {
  triple: Triple;
  variables: QueryVariables;
}): Triple => {
  for (const variable of Object.keys(variables)) {
    replaceTerm({
      term: triple.subject,
      name: variable,
      value: variables[variable],
    });
    replaceTerm({
      term: triple.predicate as Term,
      name: variable,
      value: variables[variable],
    });
    replaceTerm({
      term: triple.object,
      name: variable,
      value: variables[variable],
    });
  }
  return triple;
};

const processPatterns = ({
  pattern,
  variables,
}: {
  pattern: Pattern | Quads;
  variables: QueryVariables;
}): Pattern | Quads => {
  // console.log(pattern);
  if (pattern.type === 'query') {
    sparqlWithSubstitution({
      query: pattern as Query,
      variables,
    });
  }
  if (pattern.type === 'graph') {
    replaceTermWithVariables({ term: pattern.name, variables });
  }
  if ((pattern as BindPattern).expression) {
    // console.log(pattern);
    // replace vars in anything that is not filter
    if (pattern.type !== 'filter') {
      replaceExpression({
        expression: (pattern as BindPattern).expression,
        variables,
      });
    }
  }
  // if pattern has triples - process directly
  if ((pattern as BgpPattern).triples) {
    for (const triple of (pattern as BgpPattern).triples) {
      replaceWithVariables({ triple, variables });
    }
  }
  // if pattern has patterns - process them recursively
  if ((pattern as GroupPattern).patterns) {
    for (const subPattern of (pattern as GroupPattern).patterns) {
      processPatterns({ pattern: subPattern, variables });
    }
  }
  return pattern;
};

export const sparqlWithSubstitution = ({
  query,
  variables = {},
}: {
  query: SparqlQuery;
  variables: QueryVariables;
}): SparqlQuery => {
  // traverse the tree and substitute variables if needed
  if (Object.keys(variables).length > 0) {
    // console.log(query);
    // process construct clause
    if ((query as ConstructQuery).template) {
      for (const pattern of (query as ConstructQuery).template) {
        replaceWithVariables({ triple: pattern, variables });
      }
    }

    // process where clause
    if ((query as Query).where) {
      for (const pattern of (query as Query).where) {
        processPatterns({ pattern, variables });
      }
    }

    // process update clause
    if ((query as Update).updates) {
      for (const updateEntry of (query as Update).updates) {
        // console.log({ updateEntry });
        if ((updateEntry as InsertDeleteOperation).graph !== undefined) {
          replaceTermWithVariables({
            term: ((updateEntry as InsertDeleteOperation).graph as any).name,
            variables,
          });
        }
        if ((updateEntry as InsertDeleteOperation).where) {
          for (const pattern of (updateEntry as InsertDeleteOperation).where) {
            processPatterns({ pattern, variables });
          }
        }
        if ((updateEntry as InsertDeleteOperation).delete) {
          for (const pattern of (updateEntry as InsertDeleteOperation).delete) {
            processPatterns({ pattern, variables });
          }
        }
        if ((updateEntry as InsertDeleteOperation).insert) {
          for (const pattern of (updateEntry as InsertDeleteOperation).insert) {
            processPatterns({ pattern, variables });
          }
        }
      }
    }
  }
  return query;
};
