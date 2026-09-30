import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.useStaticAssets(join(process.cwd(), 'public/html'), { prefix: '/' });
    app.useStaticAssets(join(process.cwd(), 'public/style'), { prefix: '/' });
    app.useStaticAssets(join(process.cwd(), 'public/script'), { prefix: '/' });
    app.useStaticAssets(join(process.cwd(), 'public/asset'), { prefix: '/' });

    app.useGlobalPipes(
    new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
        enableImplicitConversion: true,
    },
    }));

    app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 80);
}

bootstrap();
