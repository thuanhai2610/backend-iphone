import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  UseInterceptors,
  UploadedFiles,
  Put,
} from '@nestjs/common';

import { RoleGuard } from 'src/common/roles.guard';
import { Roles } from 'src/common/role.decorator';
import { JwtAuthGuard } from 'src/common/jwt-auth.guard';
import { AdminService } from './admin.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import storage from 'src/stores/cloudinary-store';
import { CreateProductDto } from '../product/dto/create-product.dto';
import { UpdateProductDto } from '../product/dto/update-product.dto';
@Controller('admin')
@UseGuards(JwtAuthGuard, RoleGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Roles('admin')
  @Get('dashboard')
  async getDashboard() {
    return this.adminService.dashboard();
  }
  @Roles('admin')
  @Get('revenue/:period')
  async getRevenue(
    @Param('period') period: 'day' | 'month' | 'year',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getRevenue(period, startDate, endDate);
  }
  @Roles('admin')
  @UseInterceptors(FilesInterceptor('files', 4, { storage }))
  @Post('product')
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.adminService.create(createProductDto, files);
  }
  @Roles('admin')
  @Delete('product/:id')
  remove(@Param('id') id: string) {
    return this.adminService.remove(id);
  }

  @Roles('admin')
  @Get('order')
  findAll(@Query('page') page: number, @Query('limit') limit: number) {
    return this.adminService.findAllOrders(page, limit);
  }

  @Roles('admin')
  @Get('customers')
  findAllCustomers() {
    return this.adminService.findAllCustomers();
  }

  @Roles('admin')
  @Delete('user/:id')
  removeUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }
  @Roles('admin')
  @Put('product/:id')
  update(@Param('id') id: string, @Body() body: { dto: UpdateProductDto }) {
    return this.adminService.updateProduct(id, body.dto);
  }

   @Roles('admin')
  @Post('updateOrder')
  updateOrder() {
    return this.adminService.updateOrder();
  }
}
