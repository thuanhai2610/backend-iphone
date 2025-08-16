import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly model: Model<UserDocument>,
  ) {} 

  verifyEmail(email: string){
    return this.model.findOneAndUpdate({email} , {
       isVerified: true,
    })
  }

  create(user: Partial<User>){
    return this.model.create(user)
  }

   findByEmail(email: string){
    return this.model.findOne({email}).exec();
  }

  updatePasswordAndResetOTP(userId: string, newPassword: string){
    return this.model.updateOne({_id: userId}, {
        $set: {
            password: newPassword,
            isVerified: false,
        }
    })
  }

  findById(userObjectId: Types.ObjectId){
    return this.model.findById(userObjectId).exec();
  }

async  updatePassword(userId: string, newPassword: string ){
    const userObjectId = new Types.ObjectId(userId);
    const updated = await this.model.findByIdAndUpdate(userObjectId, {
        password: newPassword
    }, {new: true});
    if (!updated) {
        throw new Error('Updated password failed!');
    }
     return updated;
  }

  async updateProfile(userId: string, username: string, phone: string, address: string, avatarUrl?: string): Promise<User | null>{
    const userObjectId = new Types.ObjectId(userId);

    const update:Partial<User> =  {username, phone, address};
    if (avatarUrl) {
      update.avatarUrl = avatarUrl;
    }
    return this.model.findByIdAndUpdate(userObjectId, update, {new: true}).exec();
  }

  async profile(userId: string) {
    const userObjectId = new Types.ObjectId(userId)
    const user = await this.model.findById(userObjectId).lean();
    return user;
  }
}