import { Injectable , ConflictException, UnauthorizedException } from "@nestjs/common";

import { LoginDto, RegisterDto } from "./dto/user.dto.js";

// import { TokenService } from "./token.service.js";
// import { UserRepository } from "./user.repository.js";

@Injectable()
export class AuthService {

    constructor (
        private readonly tokenService : TokenService,
        private readonly userRepository : UserRepository, 
    ) {}

    async logout(id: number) {
        return await this.tokenService.revokeToken(id);
    }

    async refreshToken(token: string) {
        return await this.tokenService.refreshToken(token);
    }

    async login(auth : LoginDto) {
        const user = await this.userRepository.checkUser(auth.username);

        if(!user) {
            throw new UnauthorizedException('یوزرنیم یا پسورد اشتباه است')
        }

        const isPasswordValid = 's'; // . . .
        if(!isPasswordValid) {
            throw new UnauthorizedException('یوزرنیم یا پسورد اشتباه است')
        }

        const token = await this.tokenService.generateToken(user.id , user.username);

        return { 
            user : {
                id : user.id,
                username : user.username,
                email : user.email,
        },
            ...token,
        }
    }

    async register(auth : RegisterDto) {
        
        const check = await this.userRepository.checkUser(auth.username , auth.email)

        if (check) {
            if (check.username === auth.username) {
                throw new ConflictException('نام کاربری قبلاً انتخاب شده است');
            }
            if (check.email === auth.email) {
                throw new ConflictException('این ایمیل قبلاً ثبت شده است');
            }
        }

        const passwordHashed = 'ss'; // . . .
        const user = await this.userRepository.insertUser(auth.username , auth.email , passwordHashed);
        const token = await this.tokenService.generateToken(user.id, user.username);

        return { 
            user,
            ...token,
        };
    }

}