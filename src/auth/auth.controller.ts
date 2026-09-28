import { Body, Controller, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiResponseDto } from "@/common/dto/api-response.dto.js";
import { LoginDto , RegisterDto } from "./dto/user.dto.js";
import { AuthService } from "./auth.service.js";

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authservice : AuthService,
    ) {}
    
    @Throttle({ default : { ttl : 60000 , limit : 15 } })
    @Post('login')
    async login(@Body() auth : LoginDto ) {
        const response = await this.authservice.login(auth)
        return ApiResponseDto.success('Login Success', response)
    }

    @Throttle({ default : { ttl : 60000 , limit : 15 } })
    @Post('register')
    async register(@Body() auth : RegisterDto ) {
        const response = await this.authservice.register(auth)
        return ApiResponseDto.success('Register Success', response)
    }

    @Throttle({ default : { ttl : 60000 , limit : 5 } })
    @Post('logout')
    async logout( @Body('id') id : number ) {
        const response = await this.authservice.logout(id)
        return ApiResponseDto.success('Logout Success', response)
    }

    @Throttle({ default : { ttl : 60000 , limit : 15 } })
    @Post('refresh')
    async refresherToken( @Body('token') token : string ) {
        const response = await this.authservice.refreshToken(token)
        return ApiResponseDto.success('RefreshToken Success', response)
    }

}