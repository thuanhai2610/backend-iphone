// src/auth/dto/change-password.dto.ts
import { IsNotEmpty, IsOptional } from "@nestjs/class-validator";

export class ChangePasswordDto {


  @IsNotEmpty()
  oldPassword: string;

  @IsNotEmpty()
  newPassword: string;
}
