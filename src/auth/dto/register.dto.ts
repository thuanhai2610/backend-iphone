import { IsEmail, IsNotEmpty, IsOptional, IsString } from "@nestjs/class-validator";


export class RegisterDto {
  @IsOptional() username: string;

    @IsNotEmpty() 
    @IsEmail()
    email: string;
    @IsNotEmpty() password: string;
     @IsOptional() phone: string;
    @IsOptional() address: string;
    @IsOptional()
    role: string;
}