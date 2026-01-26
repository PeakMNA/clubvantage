import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('Date', () => Date)
export class DateScalar implements CustomScalar<string, Date> {
  description = 'Date custom scalar type (YYYY-MM-DD)';

  parseValue(value: string): Date {
    return new Date(value);
  }

  serialize(value: Date): string {
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    return new Date(value).toISOString().split('T')[0];
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null as any;
  }
}
