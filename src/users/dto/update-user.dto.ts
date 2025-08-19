import { IsEmail, IsNotEmpty, IsOptional } from "@nestjs/class-validator";

export class UpdateUserDto {
    @IsOptional() username: string;
    @IsOptional() fullName: string;
    @IsOptional() city: string;
    @IsOptional() district: string;
    @IsOptional() ward: string;

     @IsOptional() phone: string;
    @IsOptional() address: string;
    @IsOptional() avatarUrl: string;
}