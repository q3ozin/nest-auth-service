import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  public client!: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    
    const host = this.configService.get<string>('REDIS_HOST');
    const portEnv = this.configService.get<string | number>('REDIS_PORT');

    if (!host || !portEnv) {
      throw new Error('Missing required Redis environment variables (REDIS_HOST or REDIS_PORT).');
    }

    const port = Number(portEnv);

    this.client = new Redis({
      host,
      port,
      lazyConnect: false,
    });

    this.client.on('connect', () => {
      this.logger.log(`Redis Client Connected Successfully to ${host}:${port}`);
    });

    this.client.on('error', (err: Error) => {
      this.logger.error('Redis Client Error:', err.stack || err.message);
    });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis Client Disconnected Gracefully.');
    }
  }

  async set(key: string, value: string | number | Buffer, ttlSeconds?: number): Promise<'OK'> {
    if (ttlSeconds) {
      return this.client.set(key, value, 'EX', ttlSeconds);
    }
    return this.client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }
}