import { JwtService } from "@nestjs/jwt";
import { RedisService } from "../redis/redis.service.js"
import { Injectable , UnauthorizedException } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: number;
  username: string;
}

@Injectable()
export class TokenService {
    constructor (
        private readonly jwtservice : JwtService,
        private readonly redisservice : RedisService,
        private readonly configService: ConfigService,
    ) {}

    async revokeRefreshToken(userId: number): Promise<void> {
        const redisKey = `refresh_token:${userId}`;
        await this.redisservice.del(redisKey);
    }

    async generateToken(id : number , username : string) {

        const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
        const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

        if (!accessSecret || !refreshSecret) {
            throw new Error('JWT Secret keys are not defined in environment variables');
        }

        const payload = {sub : id , username}

        const [accessToken , refreshToken] = await Promise.all([

            this.jwtservice.signAsync(payload , {
                secret : accessSecret,
                expiresIn: '15m',
            }),

            this.jwtservice.signAsync(payload , {
                secret : refreshSecret,
                expiresIn: '7d',
            }),

        ])

        const redisKey = `refresh_token:${id}`;

        await this.redisservice.set(redisKey , refreshToken , 604800);

        return {
            accessToken,
            refreshToken
        }

    }

    async refreshToken( token : string) {

        const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
        const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

        if (!accessSecret || !refreshSecret) {
            throw new Error('JWT Secret keys are not defined in environment variables');
        }

        let payload: JwtPayload;
        try {
            payload = await this.jwtservice.verifyAsync<JwtPayload>(token , {
                secret : refreshSecret
            })
        } catch {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        const redisKey = `refresh_token:${payload.sub}`;

        const storedToken = await this.redisservice.get(redisKey)
        if(!storedToken || storedToken !== token) {
            throw new UnauthorizedException('Refresh token is invalid or revoked');
        }

        const accessToken = await this.jwtservice.signAsync(
            { sub: payload.sub , username: payload.username }, 
            {
                secret: accessSecret,
                expiresIn: '15m',
            }
        );

        return {
            accessToken
        }

    }

    async verifyAccessToken(token: string): Promise<JwtPayload> {
        const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');

        if (!accessSecret) {
            throw new Error('JWT Secret key is not defined in environment variables');
        }

        try {
            return await this.jwtservice.verifyAsync<JwtPayload>(token, {
                secret: accessSecret,
            });
        } catch {
            throw new UnauthorizedException('Access token is invalid or expired');
        }
    }

}