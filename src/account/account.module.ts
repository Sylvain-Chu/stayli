import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [AccountController],
})
export class AccountModule {}
