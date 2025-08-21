import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { ProductModule } from '../product/product.module';
import { CartModule } from '../cart/cart.module';
import { UserModule } from 'src/users/user.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [ AuthModule, ProductModule, CartModule, UserModule, OrderModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
