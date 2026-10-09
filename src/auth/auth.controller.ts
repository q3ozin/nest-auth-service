import { Body, Controller, Post, HttpCode, Logger , HttpStatus, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiResponseDto } from "../common/dto/api-response.dto.js";
import { LoginDto , RegisterDto } from "./dto/user.dto.js";
import { AuthService } from "./auth.service.js";
import { CurrentUser } from "../common/decorators/current-user.decorator.js";
import { JwtAuthGuard } from "../common/guard/jwt-auth.guard.js";

@Controller('auth')
export class AuthController {

    private readonly logger = new Logger(AuthController.name);

    constructor(
        private readonly authservice : AuthService,
    ) {}
    
    @Throttle({ default : { ttl : 60000 , limit : 10 } })
    @Post('login')
    async login(@Body() auth : LoginDto ) {
        const response = await this.authservice.login(auth)
        this.logger.log(`Attempting login for username: ${auth.username}`);
        return ApiResponseDto.success('User logged in successfully', response)
    }

    @Throttle({ default : { ttl : 60000 , limit : 15 } })
    @Post('register')
    async register(@Body() auth : RegisterDto ) {
        const response = await this.authservice.register(auth)
        this.logger.log(`User logged in successfully: ${auth.username}`);
        return ApiResponseDto.success('User registered successfully', response)
    }

    @Throttle({ default : { ttl : 60000 , limit : 15 } })
    @Post('refresh')
    async refresherToken( @Body('token') token : string ) {
        const response = await this.authservice.refreshToken(token)
        return ApiResponseDto.success('Token refreshed successfully', response);
    }

    @Throttle({ default: { ttl: 60000, limit: 20 } })
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('logout')
    async logout(@CurrentUser('userId') userId: number) {
        await this.authservice.logout(userId);
        return ApiResponseDto.success('User logged out successfully');
    }

}