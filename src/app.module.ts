import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [AuthModule , PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
