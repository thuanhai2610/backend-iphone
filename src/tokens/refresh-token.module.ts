// otp.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RefreshToken, RefreshTokenSchema } from './refresh-token.schema';
import { RefreshTokenService } from './refresh-token.service';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
  ],
  providers: [RefreshTokenService],
  exports: [RefreshTokenService], // để AuthModule dùng được
})
export class RefreshModule {}
