import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule,
    ServeStaticModule.forRoot(
    {
      rootPath: join(process.cwd(), 'public/html'),
      serveRoot: '/'
    },
    {
      rootPath: join(process.cwd(), 'public/style'),
      serveRoot: '/'
    },
    {
      rootPath: join(process.cwd(), 'public/script'),
      serveRoot: '/'
    },
    {
      rootPath: join(process.cwd(), 'public/asset'),
      serveRoot: '/'
    })
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
