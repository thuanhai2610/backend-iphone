// otp.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OtpService } from './otp.service';
import { Otp, OtpSchema } from './otp.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Otp.name, schema: OtpSchema },
    ]),
  ],
  providers: [OtpService],
  exports: [OtpService], // để AuthModule dùng được
})
export class OtpModule {}
