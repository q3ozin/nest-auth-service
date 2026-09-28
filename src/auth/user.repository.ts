import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class UserRepository {
    
    constructor(
        private readonly prisma : PrismaService,
    ) {}

    async checkUser(username? : string , email? : string) {

        const conditions: Array<{ username?: string; email?: string }> = [];

        if (email) {
            conditions.push({ email });
        }
        if (username) {
            conditions.push({ username })
        };

        if (conditions.length === 0) {
            return null
        };

        return this.prisma.user.findFirst({
            where : {
                OR : conditions,
            },
            select : {
                id : true,
                username : true,
                email : true,
                password : true
            }
        })

    }

}