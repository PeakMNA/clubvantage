import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';
import { Prisma } from '@prisma/client';

type Decimal = Prisma.Decimal;

@Scalar('Decimal')
export class DecimalScalar implements CustomScalar<string, Decimal> {
  description = 'Decimal custom scalar type for precise numeric values';

  parseValue(value: string | number): Decimal {
    return new Prisma.Decimal(value);
  }

  serialize(value: Decimal | string | number): string {
    if (typeof value === 'object' && value !== null && 'toString' in value) {
      return value.toString();
    }
    return new Prisma.Decimal(value as string | number).toString();
  }

  parseLiteral(ast: ValueNode): Decimal {
    if (ast.kind === Kind.STRING || ast.kind === Kind.FLOAT || ast.kind === Kind.INT) {
      return new Prisma.Decimal((ast as any).value);
    }
    return new Prisma.Decimal(0);
  }
}
