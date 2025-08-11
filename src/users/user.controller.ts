import { Body, Controller, Put, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
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
        return this.userService.updateProfile(req.user['userId'], dto.username, dto.phone, dto.address, avatarField?.path)
    }
}