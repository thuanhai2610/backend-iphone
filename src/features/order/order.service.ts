import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './schema/order.schema';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../product/schemas/product.schema';
import { Cart } from '../cart/schemas/cart.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

async  findAll(userId: string) {
    const userOrderId = new Types.ObjectId(userId);
    const result = await this.orderModel.find({ userOrderId: userOrderId }).lean().exec();
    
    return result;
  }
  async findOne(userId: string) {
    const userObjectId = new Types.ObjectId(userId);

    const result = await this.orderModel.aggregate([
      { $match: { userOrderId: userObjectId } },
      { $sort: { createdAt: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'orderId',
          as: 'payments',
        },
      },
    ]);
    return result[0];
  }
  async  totalProduct(){
    const totalStock = await this.productModel.aggregate([
      {$group : {
        _id: null,
        totalStock : {$sum : '$stock'}
      }}
    ]);
    return totalStock[0].totalStock || 0;
    }


}
