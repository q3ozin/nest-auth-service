import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ConfigModule } from '@nestjs/config';
import { ProfileModule } from './profile/profile.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ProfileModule,
    AuthModule,
    PrismaModule,
    ],
  controllers: [],
  providers: [],
})
export class AppModule {}
