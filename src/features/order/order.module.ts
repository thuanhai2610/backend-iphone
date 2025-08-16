import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schema/order.schema';
import { AuthModule } from 'src/auth/auth.module';
import { ProductModule } from '../product/product.module';
import { CartModule } from '../cart/cart.module';
import { UserModule } from 'src/users/user.module';

@Module({
  imports: [MongooseModule.forFeature([{name: Order.name, schema: OrderSchema}]), AuthModule, ProductModule, CartModule, UserModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [MongooseModule]
})
export class OrderModule {}
