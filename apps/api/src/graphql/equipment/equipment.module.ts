import { Module } from '@nestjs/common';
import { EquipmentResolver } from './equipment.resolver';
import { EquipmentModule as EquipmentServiceModule } from '@/modules/equipment/equipment.module';

@Module({
  imports: [EquipmentServiceModule],
  providers: [EquipmentResolver],
  exports: [EquipmentResolver],
})
export class EquipmentGraphQLModule {}
