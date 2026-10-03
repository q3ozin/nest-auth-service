import { CurrentUser } from "../common/decorators/current-user.decorator.js"
import { Controller, Get, UseGuards} from "@nestjs/common";
import { ApiResponseDto } from "../common/dto/api-response.dto.js";
import { Throttle } from "@nestjs/throttler";
import { ProfileService } from './profile.service.js';
import { JwtAuthGuard } from '../common/guard/jwt-auth.guard.js';

@Throttle({ default : { ttl : 60000 , limit : 10 } })
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @Get()
    async getProfile(@CurrentUser('userId') userId: number) {
    const profile = await this.profileService.getProfile(userId);
    return ApiResponseDto.success('Profile retrieved successfully', profile);
  }

}