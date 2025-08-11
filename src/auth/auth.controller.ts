import { Body, Controller, Post, Put, Req, UseGuards } from "@nestjs/common";
import { Roles } from "src/common/role.decorator";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { AuthGuard } from "./auth.guard";
import { ChangePasswordDto } from "./dto/change-pass.dto";
import { ResetPasswordDto } from "./dto/reset-pass.dto";

@Controller('auth') 
export class AuthController{
    constructor(private authService: AuthService){}
    
    @Post('register')
    async register(@Body() dto: RegisterDto){
        return this.authService.createUser(dto.email, dto.password, dto.role ?? 'user');
    }

    @Post('verify_otp')
    async verifyOTP(@Body() body : {email: string, code: string}){
        return this.authService.verify_otp(body.email, body.code)
    }

    @Post('login')
    async login(@Body() body: {email: string, password: string}){
        return this.authService.login(body.email, body.password)
    }
    @UseGuards(AuthGuard)
    @Put('change_password')
    async changepassword(@Req() req: any, @Body() dto: ChangePasswordDto){
        return this.authService.changePassword(req.user['userId'], dto.oldPassword, dto.newPassword)
    }

    @UseGuards(AuthGuard)
    @Post('reset_password')
    async resetpassword(@Body() dto : ResetPasswordDto, @Req() req: any){
        return this.authService.resetPassword(req.user['userId'], dto.email, dto.code, dto.newPassword);
    }

    @Post('forgot_password')
    async forgotPass(@Body('email')  email: string){
        return this.authService.forgotPass(email)
    }
}