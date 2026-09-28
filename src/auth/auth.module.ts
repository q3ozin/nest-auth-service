import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { AuthController } from "./auth.controller.js";

// TODO: Integrate TokenService, JwtModule, RedisModule, and UserRepository in future iterations

@Module({
  imports: [],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}