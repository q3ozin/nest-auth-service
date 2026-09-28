import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { AuthController } from "./auth.controller.js";
import { UserRepository } from "./user.repository.js";

@Module({
    imports : [],
    providers : [UserRepository , AuthService],
    controllers : [AuthController],
})
export class AuthModule {};
