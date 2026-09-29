import { Injectable , ConflictException , UnauthorizedException } from "@nestjs/common";
import { LoginDto , RegisterDto } from "./dto/user.dto.js";
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

    async register(auth : RegisterDto) {
        
        const check = await this.userRepository.checkUser(auth.username , auth.email)

        if (check) {
            if (check.username === auth.username) {
                throw new ConflictException('Username is already taken');
            }
            if (check.email === auth.email) {
                throw new ConflictException('Email is already registered');
            }
        }

        const passwordHashed = await bcrypt.hash( auth.password , 10);
        const user = await this.userRepository.insertUser(auth.username , auth.email , passwordHashed);

        return { 
            user
        };
    }

}