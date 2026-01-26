// Re-export generated types
// Note: Run `pnpm codegen` to generate types from GraphQL schema
export * from './generated';

// Common types
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface Edge<T> {
  node: T;
  cursor: string;
}

export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
  totalCount: number;
}

// API Error types
export interface GraphQLError {
  message: string;
  code?: string;
  path?: string[];
}

export interface ApiError {
  message: string;
  errors?: GraphQLError[];
}
