import { Injectable , ConflictException , Logger , UnauthorizedException } from "@nestjs/common";
import { LoginDto , RegisterDto } from "./dto/user.dto.js";
import * as bcrypt from 'bcryptjs';
import { UserRepository } from "./user.repository.js";
import { TokenService } from "./token.service.js";
import { RedisService } from "../redis/redis.service.js";

@Injectable()
export class AuthService {

    private readonly logger = new Logger(AuthService.name);

    constructor (
        private readonly tokenService : TokenService,
        private readonly userRepository : UserRepository, 
        private readonly redisService : RedisService, 
    ) {}

    async logout(userId: number): Promise<{ message: string }> {
        await this.tokenService.revokeRefreshToken(userId);
        this.logger.log(`User logged out and refresh token revoked for userId: ${userId}`);
        return { message: 'Logged out successfully' };
    }

    async refreshToken(token: string) {
        return await this.tokenService.refreshToken(token);
    }

    async login(auth : LoginDto) {
        const user = await this.userRepository.checkUser(auth.username);

        if(!user) {
            this.logger.warn(`Failed login attempt for non-existing username: ${auth.username}`);
            throw new UnauthorizedException('Invalid username or password')
        }

        const isPasswordValid = await bcrypt.compare(auth.password , user.password);

        if(!isPasswordValid) {
            this.logger.warn(`Failed login attempt (invalid password) for userId: ${user.id}`);
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
        this.logger.log(`Cache WARM-UP successful for userId: ${user.id}`);

        return { 
            user: profileData,
            ...token,
        }
    }

    async register(auth : RegisterDto) {
        
        const check = await this.userRepository.checkUser(auth.username , auth.email)

        if (check) {
            this.logger.warn(`Registration conflict for username: ${auth.username} or email: ${auth.email}`);
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
        this.logger.log(`New user registered & profile cache warmed up for userId: ${newUser.id}`);
        
        return { 
            newUser,
            ...token,
        };
    }

}