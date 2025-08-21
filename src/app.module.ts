import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LonggingInterceptor } from './intercepter/logging.interceptor';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './features/product/product.module';
import { CartModule } from './features/cart/cart.module';
import { OrderModule } from './features/order/order.module';
import { PaymentsModule } from './features/payments/payments.module';
import { AdminModule } from './features/admin/admin.module';
// import { RedisCacheInterceptor } from './intercepter/cache.interceptor';
// import { RedisModule } from './redis/redis.module';
@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}), MongooseModule.forRoot(process.env.MONGODB!), AuthModule, ProductModule, CartModule, OrderModule, PaymentsModule, AdminModule
    // RedisModule
  ],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_INTERCEPTOR,
    useClass: LonggingInterceptor
  },
  // {
  //   provide: APP_INTERCEPTOR,
  //   useClass: RedisCacheInterceptor
  // }
  ],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    
  }
}
