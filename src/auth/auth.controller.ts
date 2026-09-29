import { Body, Controller, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiResponseDto } from "../common/dto/api-response.dto.js";
import { LoginDto , RegisterDto } from "./dto/user.dto.js";
import { AuthService } from "./auth.service.js";

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authservice : AuthService,
    ) {}
    
    @Throttle({ default : { ttl : 60000 , limit : 10 } })
    @Post('login')
    async login(@Body() auth : LoginDto ) {
        const response = await this.authservice.login(auth)
        return ApiResponseDto.success('User logged in successfully', response)
    }

    @Throttle({ default : { ttl : 60000 , limit : 15 } })
    @Post('register')
    async register(@Body() auth : RegisterDto ) {
        const response = await this.authservice.register(auth)
        return ApiResponseDto.success('User registered successfully', response)
    }

}