import { IsEmail, IsNotEmpty, MinLength } from "@nestjs/class-validator";

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  newPassword: string;
}
