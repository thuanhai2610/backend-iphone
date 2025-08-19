import { Body, Controller, Get, Put, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { AuthGuard } from "src/auth/auth.guard";
import { UpdateUserDto } from "./dto/update-user.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import storage from "src/stores/cloudinary-store";

@Controller('user')
export class UserController{
    constructor(private readonly userService: UserService){}

    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('avatar' , {storage}))
    @Put('profile')
    async updateProfile(@Req() req: any, @Body() dto: UpdateUserDto, @UploadedFile() avatarField? : Express.Multer.File) {
        return this.userService.updateProfile(req.user['userId'], dto.username, dto.fullName, dto.city, dto.district, dto.ward, dto.phone, dto.address, avatarField?.path)
    }

    @UseGuards(AuthGuard)
    @Get('me')
    async profile(@Req() req:any){
        return this.userService.profile(req.user['userId'])
    }

    @Get('top')
    async top(){
        return this.userService.findTop()
    }
}