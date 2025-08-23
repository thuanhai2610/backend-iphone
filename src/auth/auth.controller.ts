import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from './auth.guard';
import { ChangePasswordDto } from './dto/change-pass.dto';
import { ResetPasswordDto } from './dto/reset-pass.dto';
import { GoogleAuthGuard } from './goggle/google-auth';
import { Response } from 'express';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.createUser(
      dto.email,
      dto.password,
      dto.role ?? 'user',
    );
  }

  @Post('verify_otp')
  async verifyOTP(@Body() body: { email: string; code: string }) {
    return this.authService.verify_otp(body.email, body.code);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }, @Res({ passthrough: true }) res: Response,) {
    const { message, access_token, refresh_token } = await this.authService.login(body.email, body.password);
 res.cookie('access_token',  access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 15 * 60 * 1000, 
  });

  res.cookie('refresh_token', refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000, 
  });
    return {message, access_token, refresh_token}
  }
  @UseGuards(AuthGuard)
  @Put('change_password')
  async changepassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(
      req.user['userId'],
      dto.oldPassword,
      dto.newPassword,
    );
  }

  @Post('reset_password')
  async resetpassword(@Body() dto: ResetPasswordDto, @Req() req: any) {
    return this.authService.resetPassword(dto.email, dto.code, dto.newPassword);
  }

  @Post('forgot_password')
  async forgotPass(@Body('email') email: string) {
    return this.authService.forgotPass(email);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res) {
    const user = req.user;
    const data = await this.authService.googleLogin(user);
    const access_token = data.access_token;
    const redirectUrl = `${process.env.FE}/?token=${access_token}`;
    return res.redirect(redirectUrl);
  }

  @Post('refresh_token')
  async newAccessToken(@Body('refresh_token') refresh_token: string,  @Res({ passthrough: true }) res: Response){
    const {access_token} = await this.authService.refresh_token(refresh_token);
    res.cookie('access_token',  access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 15 * 60 * 1000, 
  });
  }
}
