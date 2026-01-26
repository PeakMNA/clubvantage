import { Module } from '@nestjs/common';
import { MembersResolver } from './members.resolver';
import { MembersModule } from '@/modules/members/members.module';

@Module({
  imports: [MembersModule],
  providers: [MembersResolver],
})
export class MembersGraphqlModule {}
