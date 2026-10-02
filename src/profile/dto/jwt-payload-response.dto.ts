import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class JwtPayloadResponseDto {
  @Expose()
  @IsInt()
  @IsNotEmpty()
  userId!: number;

  @Expose()
  @IsString()
  @IsNotEmpty()
  username!: string;

  @Expose()
  @IsInt()
  @IsOptional()
  expiresInSeconds!: number | null;

  constructor(partial: Partial<JwtPayloadResponseDto>) {
    Object.assign(this, partial);
  }
}