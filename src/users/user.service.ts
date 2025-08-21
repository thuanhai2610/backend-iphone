import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, PipelineStage, Types } from 'mongoose';
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
 createGoogle(user: Partial<User>){
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

async  updatePassword(email: string, newPassword: string ){
    const updated = await this.model.findOneAndUpdate(   { email },   {
        password: newPassword
    }, {new: true});
    if (!updated) {
        throw new Error('Updated password failed!');
    }
     return updated;
  }

  async updateProfile(userId: string, username: string, fullName: string, city: string, district: string, ward: string, phone: string, address: string, avatarUrl?: string): Promise<User | null>{
    const userObjectId = new Types.ObjectId(userId);

    const update:Partial<User> =  {username,fullName, city, district, ward, phone, address};
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

  async findTop(){
    const pipeline : PipelineStage[] =[ 
      {$lookup : {
        from : 'orders',
        localField: '_id',
        foreignField: 'userOrderId',
        as :'orders'
      }    
    }, 
    {$addFields: {shippedOrder : {
      $filter: {
        input: '$orders',
        as: 'o',cond : {$eq : ['$$o.status' , 'Delivered']}
      }
    }}}, {$addFields: {totalSpend: {$sum : '$shippedOrder.totalPriceInOrder'}}},
    {$project : {
      email: 1,
      avatarUrl: 1,
      orderCounts : {$size: '$orders'},
      totalSpend: 1
    }},
    {$sort: {totalSpend: -1}},
    {$limit: 5}
    ]
    const data = await this.model.aggregate(pipeline).exec();
    return data;
  }
}