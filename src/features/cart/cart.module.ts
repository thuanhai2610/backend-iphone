import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from './schemas/cart.schema';
import { AuthModule } from 'src/auth/auth.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports : [MongooseModule.forFeature([{name: Cart.name, schema: CartSchema}]), AuthModule, ProductModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [MongooseModule]
})
export class CartModule {}
