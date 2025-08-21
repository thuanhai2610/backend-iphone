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
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Payment.name, schema: PaymentSchema}]), 
    OrderModule, 
    CartModule, 
    UserModule, 
    ProductModule, 
    AuthModule,
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      defaults: {
        from: '"No Reply" <no-reply@yourdomain.com>',
      },
      template: {
        dir: join(__dirname, '..', '..', 'templates'), 
        adapter: new HandlebarsAdapter(),
        options: {
          strict: false, // Change from true to false
          allowProtoPropertiesByDefault: true,
          allowProtoMethodsByDefault: true,
        },
      },
    }),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentRepository],
})
export class PaymentsModule {}