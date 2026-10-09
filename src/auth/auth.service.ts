import { Injectable , ConflictException , UnauthorizedException } from "@nestjs/common";
import { LoginDto , RegisterDto } from "./dto/user.dto.js";
import * as bcrypt from 'bcryptjs';
import { UserRepository } from "./user.repository.js";
import { TokenService } from "./token.service.js";
import { RedisService } from "../redis/redis.service.js";

@Injectable()
export class AuthService {

    constructor (
        private readonly tokenService : TokenService,
        private readonly userRepository : UserRepository, 
        private readonly redisService : RedisService, 
    ) {}

    async logout(userId: number): Promise<{ message: string }> {
        await this.tokenService.revokeRefreshToken(userId);
        return { message: 'Logged out successfully' };
    }

    async refreshToken(token: string) {
        return await this.tokenService.refreshToken(token);
    }

    async login(auth : LoginDto) {
        const user = await this.userRepository.checkUser(auth.username);

        if(!user) {
            throw new UnauthorizedException('Invalid username or password')
        }

        const isPasswordValid = await bcrypt.compare(auth.password , user.password);

        if(!isPasswordValid) {
            throw new UnauthorizedException('Invalid username or password')
        }

        const token = await this.tokenService.generateToken(user.id , user.username);

        const profileData = {
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
        };

        const cacheKey = `user:profile:${user.id}`;
        await this.redisService.set(cacheKey, JSON.stringify(profileData), 600);

        return { 
            user: profileData,
            ...token,
        }
    }

    async register(auth : RegisterDto) {
        
        const check = await this.userRepository.checkUser(auth.username , auth.email)

        if (check) {
            if (check.username === auth.username) {
                throw new ConflictException('Username is already taken');
            }
            if (check.email === auth.email) {
                throw new ConflictException('Email is already registered');
            }
        }

        const passwordHashed = await bcrypt.hash( auth.password , 10);
        const newUser = await this.userRepository.insertUser(auth.username , auth.email , passwordHashed);

        const token = await this.tokenService.generateToken(newUser.id, newUser.username);

        const profileData = {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            createdAt: newUser.createdAt,
        };

        const cacheKey = `user:profile:${newUser.id}`;
        await this.redisService.set(cacheKey, JSON.stringify(profileData), 600);
        
        return { 
            newUser,
            ...token,
        };
    }

}