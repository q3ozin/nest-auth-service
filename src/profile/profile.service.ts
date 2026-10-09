// src/profile/profile.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';

@Injectable()
export class ProfileService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async getProfile(userId: number) {
    const cacheKey = `user:profile:${userId}`;

    const cachedProfile = await this.redisService.get(cacheKey);
    if (cachedProfile) {
      return JSON.parse(cachedProfile);
    }


    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, createdAt: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.redisService.set(cacheKey, JSON.stringify(user), 3600);
    return user;
  }
}