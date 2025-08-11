import {  forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtStrategy } from 'src/common/jwt.strategy';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [MongooseModule.forFeature([{name: User.name, schema: UserSchema}]), forwardRef(()=>AuthModule)],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

