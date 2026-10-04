// src/profile/profile.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';

@Injectable()
export class ProfileService {
  
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async getProfile(userId: number) {
    const cacheKey = `user:profile:${userId}`;

    const cachedProfile = await this.redisService.get(cacheKey);
    if (cachedProfile) {
      this.logger.log(`Cache HIT for user profile: ${userId}`);
      return JSON.parse(cachedProfile);
    }

    this.logger.warn(`Cache MISS for user profile: ${userId}. Fetching from DB...`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, createdAt: true },
    });

    if (!user) {
      this.logger.error(`User profile not found in DB: ${userId}`);
      throw new NotFoundException('User not found');
    }

    await this.redisService.set(cacheKey, JSON.stringify(user), 3600);
    return user;
  }
}