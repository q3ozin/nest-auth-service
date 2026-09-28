import { IsNotEmpty, IsString, Length } from "class-validator";
import { Transform } from 'class-transformer';

export class LoginDto {

    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim().toLowerCase() : value,
    )
    @IsNotEmpty()
    @IsString()
    @Length(3, 48)
    username! : string

    @IsNotEmpty()
    @IsString()
    @Length(8, 96)
    password! : string
    
}