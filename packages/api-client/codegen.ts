import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: '../../apps/api/src/schema.gql',
  documents: ['src/operations/**/*.graphql'],
  generates: {
    './src/types/generated.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
      ],
      config: {
        avoidOptionals: false,
        maybeValue: 'T | null | undefined',
        enumsAsTypes: true,
        scalars: {
          DateTime: 'string',
          Date: 'string',
          Decimal: 'string',
        },
      },
    },
    './src/hooks/generated.ts': {
      plugins: [
        {
          add: {
            content: "'use client';\n",
            placement: 'prepend',
          },
        },
        'typescript',
        'typescript-operations',
        'typescript-react-query',
      ],
      config: {
        fetcher: '../client#graphqlFetcher',
        exposeQueryKeys: true,
        exposeFetcher: true,
        addInfiniteQuery: true,
        reactQueryVersion: 5,
        avoidOptionals: false,
        maybeValue: 'T | null | undefined',
        enumsAsTypes: true,
        scalars: {
          DateTime: 'string',
          Date: 'string',
          Decimal: 'string',
        },
      },
    },
  },
};

export default config;
