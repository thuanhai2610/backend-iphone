import { Body, Controller, Put, Req, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { AuthGuard } from "src/auth/auth.guard";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller('user')
export class UserController{
    constructor(private readonly userService: UserService){}

    @UseGuards(AuthGuard)
    @Put('profile')
    async updateProfile(@Req() req: any, @Body() dto: UpdateUserDto) {
        return this.userService.updateProfile(req.user['userId'], dto.username, dto.phone, dto.address, dto.avatarUrl)
    }
}