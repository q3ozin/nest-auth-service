import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { AuthController } from "./auth.controller.js";
import { UserRepository } from "./user.repository.js";
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenService } from './token.service.js';
import { RedisService } from '../redis/redis.service.js';

@Module({
    imports : [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const secret = configService.get<string>('JWT_ACCESS_SECRET');
                const expiresIn = configService.get<string>('JWT_ACCESS_EXPIRATION');

                if (!secret || !expiresIn) {
                    throw new Error('JWT environment variables (JWT_ACCESS_SECRET / JWT_ACCESS_EXPIRATION) are missing!');
                }

                return {
                    secret,
                    signOptions: {
                        expiresIn: expiresIn as any,
                    },
                };

            },
        }),
    ],
    providers : [UserRepository , TokenService , RedisService , AuthService],
    controllers : [AuthController],
})
export class AuthModule {};
