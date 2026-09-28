import { Module } from "@nestjs/common";

// import { JwtStrategy } from "@/common/strategy/jwt.strategy.js";
import { AuthService } from "./auth.service.js";
import { AuthController } from "./auth.controller.js";

// import { TokenService } from "./token.service.js";
// import { JwtModule } from "@nestjs/jwt";
// import { RedisModule } from "@/redis/redis.module.js";
// import { UserRepository } from "./user.repository.js";

@Module({
    // imports : [JwtModule.register({}) , RedisModule],
    // providers : [TokenService , UserRepository , AuthService , JwtStrategy],
    providers : [AuthService],
    controllers : [AuthController],
    // exports : [TokenService]
})
export class AuthModule {};
