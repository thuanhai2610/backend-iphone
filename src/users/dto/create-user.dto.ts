import { IsEmail, IsNotEmpty, IsOptional } from "@nestjs/class-validator";

export class CreateUserDto {
    @IsOptional() username: string;
    @IsOptional() phone: string;
    @IsOptional() address: string;
     @IsOptional() avatarUrl: string;
}