import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';
import { Decimal } from '@prisma/client/runtime/library';

@Scalar('Decimal')
export class DecimalScalar implements CustomScalar<string, Decimal> {
  description = 'Decimal custom scalar type for precise numeric values';

  parseValue(value: string | number): Decimal {
    return new Decimal(value);
  }

  serialize(value: Decimal | string | number): string {
    if (value instanceof Decimal) {
      return value.toString();
    }
    return new Decimal(value).toString();
  }

  parseLiteral(ast: ValueNode): Decimal {
    if (ast.kind === Kind.STRING || ast.kind === Kind.FLOAT || ast.kind === Kind.INT) {
      return new Decimal((ast as any).value);
    }
    return new Decimal(0);
  }
}
