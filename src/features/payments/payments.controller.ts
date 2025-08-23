import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Req() req : any, @Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.createRfa(req.user['userId'], createPaymentDto);
  }

   @Get('vnpay/return')
  async handleVnpayReturn(@Query() query: any, @Res() res: Response) {
    const result = await this.paymentsService.handleVnpayReturn(query);

    if (result.status === 'Completed') {
      const redirectUrl = `${process.env.FE}/checkout`;
       return res.redirect(redirectUrl);
    } else {
      const redirectUrl = `${process.env.FE}/checkout`;
       return res.redirect(redirectUrl);
    }
  }

}
