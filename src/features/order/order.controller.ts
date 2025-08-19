import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from 'src/common/jwt-auth.guard';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @UseGuards(JwtAuthGuard)

  @Post('create')
  create(@Req() req: any,  @Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(req.user['userId'], createOrderDto);
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: any) {
    return this.orderService.findAll(req.user['userId']);
  }
  @UseGuards(JwtAuthGuard)
  @Get('checkout')
  findOne(@Req() req: any) {
    return this.orderService.findOne(req.user['userId']);
  }

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
async  getDashboard() {
    return this.orderService.dashboard();
  }

 @Get('revenue/:period')
  async getRevenue(@Param('period') period: "day" | "month" | "year",   @Query("startDate") startDate?: string,
  @Query("endDate") endDate?: string) {
    return this.orderService.getRevenue(period, startDate, endDate);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
