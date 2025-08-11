import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LonggingInterceptor } from './intercepter/logging.interceptor';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}), MongooseModule.forRoot(process.env.MONGODB!), AuthModule],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_INTERCEPTOR,
    useClass: LonggingInterceptor
  }
  ],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    
  }
}
