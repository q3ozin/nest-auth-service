import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from "../common/decorators/current-user.decorator.js"
import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiResponseDto } from "../common/dto/api-response.dto.js";
import { Throttle } from "@nestjs/throttler";
import { JwtPayloadResponseDto } from './dto/jwt-payload-response.dto.js';

@Throttle({ default : { ttl : 60000 , limit : 10 } })
@Controller('profile')
@UseGuards(AuthGuard('jwt'))
export class ProfileController {
    @Get()
    getProfile(@CurrentUser() user : JwtPayloadResponseDto) : ApiResponseDto<JwtPayloadResponseDto> {
        return ApiResponseDto.success( 'Profile decoded successfully' , user)
    }
}