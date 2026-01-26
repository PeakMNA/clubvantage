import { Field, ObjectType, Int, ArgsType, InputType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';
import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';

@ObjectType()
export class PageInfo {
  @Field(() => Boolean)
  hasNextPage: boolean;

  @Field(() => Boolean)
  hasPreviousPage: boolean;

  @Field(() => String, { nullable: true })
  startCursor: string | null;

  @Field(() => String, { nullable: true })
  endCursor: string | null;
}

export interface IEdge<T> {
  node: T;
  cursor: string;
}

export interface IConnection<T> {
  edges: IEdge<T>[];
  pageInfo: PageInfo;
  totalCount: number;
}

export function Paginated<T>(classRef: Type<T>): Type<IConnection<T>> {
  @ObjectType(`${classRef.name}Edge`)
  abstract class EdgeType implements IEdge<T> {
    @Field(() => classRef)
    node: T;

    @Field(() => String)
    cursor: string;
  }

  @ObjectType({ isAbstract: true })
  abstract class PaginatedType implements IConnection<T> {
    @Field(() => [EdgeType])
    edges: EdgeType[];

    @Field(() => PageInfo)
    pageInfo: PageInfo;

    @Field(() => Int)
    totalCount: number;
  }

  return PaginatedType as Type<IConnection<T>>;
}

@ArgsType()
export class PaginationArgs {
  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  first?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  after?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  skip?: number;
}

@InputType()
export class PaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  first?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  after?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  skip?: number;
}

// Helper to encode/decode cursors
export function encodeCursor(id: string): string {
  return Buffer.from(id).toString('base64');
}

export function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, 'base64').toString('utf8');
}
