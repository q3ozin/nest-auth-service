import { IsEmail , IsNotEmpty, IsString, Length } from "class-validator";
import { Transform, TransformFnParams } from 'class-transformer';

export class LoginDto {

    @Transform(({ value }: TransformFnParams) =>
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

export class RegisterDto extends LoginDto {

    @Transform(({ value }: TransformFnParams) =>
        typeof value === 'string' ? value.trim().toLowerCase() : value,
    )
    @IsNotEmpty()
    @IsEmail()
    @Length(6, 96)
    email! : string

}