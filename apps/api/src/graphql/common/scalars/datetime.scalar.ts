import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('DateTime', () => Date)
export class DateTimeScalar implements CustomScalar<string, Date> {
  description = 'DateTime custom scalar type (ISO 8601)';

  parseValue(value: string): Date {
    return new Date(value);
  }

  serialize(value: Date): string {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return new Date(value).toISOString();
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null as any;
  }
}
