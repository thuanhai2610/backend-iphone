import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderModule } from '../order/order.module';
import { CartModule } from '../cart/cart.module';
import { UserModule } from 'src/users/user.module';
import { ProductModule } from '../product/product.module';
import { AuthModule } from 'src/auth/auth.module';
import { Payment, PaymentSchema } from './schema/payment.schema';
import { PaymentRepository } from './payment.repository';

@Module({
  imports: [MongooseModule.forFeature([{name: Payment.name, schema: PaymentSchema}]), OrderModule, CartModule, UserModule, ProductModule, AuthModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentRepository],
})
export class PaymentsModule {}
