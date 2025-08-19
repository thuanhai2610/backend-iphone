import {
    BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from 'src/otp/otp.service';
import { RefreshTokenService } from 'src/tokens/refresh-token.service';
import { UserService } from 'src/users/user.service';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;
  constructor(
    private jwtService: JwtService,
    private otpService: OtpService,
    private userService: UserService,
    private refreshTokenService: RefreshTokenService,
  ) { this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);}

  async createUser(email: string, password: string, role: string = 'user') {
    const existedUser = await this.userService.findByEmail(email);
    if (existedUser) {
      if (existedUser.isVerified === true && existedUser) 
        throw new ConflictException('Email has already!');
      const hashed = await bcrypt.hash(password, 10);
      await this.userService.updatePasswordAndResetOTP(
        String(existedUser._id),
        hashed,
      ); try {
      await this.otpService.generateOTP(email);
    } catch (error) {
      console.error('Send OTP failed: ', error);
      throw new InternalServerErrorException('Server dont send OTP.');
    } return {message: 'OTP register successfully'}
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await this.userService.create({
      email,
      password: hashed,
      isVerified: false,
      role,
    });
    try {
      await this.otpService.generateOTP(email);
    } catch (error) {
      console.error('Send OTP failed: ', error);
      throw new InternalServerErrorException('Server dont send OTP.');
    }
    return {message: 'User register successfully!' ,user};
  }

  async verify_otp(email: string, code: string){
    const valid = await this.otpService.verifyOtp(email, code);
    if(!valid) throw new UnauthorizedException('Invalid OTP!');
    const verifyEmail = await this.userService.verifyEmail(email);
    return {message: 'Account activated', verifyEmail}
  }

  async login(email: string, password: string){
    const existedUser = await this.userService.findByEmail(email);
    if (!existedUser || !existedUser.isVerified) 
        throw new BadRequestException('User not found. Or user not verify')
    const match = await bcrypt.compare(password, existedUser.password)
    if (!match) throw new UnauthorizedException('Password not match');

    const access = this.jwtService.sign({userId: existedUser._id, email: existedUser.email, role: existedUser.role}, {expiresIn: '7d'});
    const refresh = this.jwtService.sign({userId: existedUser._id}, {expiresIn: '30d'});
    await this.refreshTokenService.create(String(existedUser._id), refresh);
    return {message: 'Login successfully', access_token: access, refresh_token: refresh};
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string){
    const userObjectId = new Types.ObjectId(userId);
    const user = await this.userService.findById(userObjectId);
    if (!user) {
        throw new BadRequestException('User not found,');
    }
    const match = await bcrypt.compare(oldPassword, user.password)
    if (!match) {
        throw new BadRequestException('New password not match old password!');
    } 
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.userService.updatePassword(userId,hashedNewPassword );
    return {message: 'Change password successfully'}
  }

  async forgotPass(email: string){
    const existedUser = await this.userService.findByEmail(email);
    if (!existedUser) {
        throw new BadRequestException('User not found.');
    }
    try {
        await this.otpService.generateOTP(email)
        return {message: 'OTP sent to email for forgot password'}
    } catch (error) {
        console.error('Sent OTP failed', error)
        throw new InternalServerErrorException('Sever failed. Please try again')
    }
  }

  async resetPassword( email: string, code: string, newPassword: string){
     const existedUser = await this.userService.findByEmail(email);
     if (!existedUser) {
       throw new BadRequestException('User not found')
     }
     const valid = await this.otpService.verifyOtp(email, code);
     if (!valid) {
       throw new UnauthorizedException('Invalid code');
     }
     const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    const resetpass = await this.userService.updatePassword(email, hashedNewPassword)
    return {message : 'Reset pass succesfully', resetpass}
  }

  async googleLogin(user: any) {
    if (!user) {
      throw new UnauthorizedException('Google login failed');
    }
    let existingUser = await this.userService.findByEmail(user.email);

    if (!existingUser) {
      existingUser = await this.userService.createGoogle({
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.picture,
        // provider: 'google',
        role: 'user',
        isVerified: true,
      });
    }
    const payload = { userId: existingUser._id, email: existingUser.email, role: existingUser.role };
    return {
      access_token: this.jwtService.sign({payload}, {expiresIn: "7d" , secret: process.env.JWT_SECRET,}),
      refreshToken: this.jwtService.sign({userId: existingUser._id}, {expiresIn: "7d" , secret: process.env.JWT_SECRET,}),
      user: existingUser,
    };
  }
}
