import { Injectable , UnauthorizedException } from "@nestjs/common";
import { LoginDto } from "./dto/user.dto.js";
import * as bcrypt from 'bcryptjs';
import { UserRepository } from "./user.repository.js";

@Injectable()
export class AuthService {

    constructor (
        private readonly userRepository : UserRepository, 
    ) {}

    async login(auth : LoginDto) {
        const user = await this.userRepository.checkUser(auth.username);

        if(!user) {
            throw new UnauthorizedException('Invalid username or password')
        }

        const isPasswordValid = await bcrypt.compare(auth.password , user.password);

        if(!isPasswordValid) {
            throw new UnauthorizedException('Invalid username or password')
        }

        return { 
            user : {
                id : user.id,
                username : user.username,
                email : user.email,
            },
        }
    }

}