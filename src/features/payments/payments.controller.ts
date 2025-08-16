import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Req() req : any, @Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(req.user['userId'], createPaymentDto);
  }

   @Get('vnpay/return')
  async handleVnpayReturn(@Query() query: any) {
    const result = await this.paymentsService.handleVnpayReturn(query);
    if (result.status === 'Completed') {
      return { message: 'Payment successful', paymentId: result.paymentId,  totalAmount: result.totalAmount, };
    } else {
      return { message: 'Payment failed', code: result.message };
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(+id, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(+id);
  }
}
