import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './schema/order.schema';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../product/schemas/product.schema';
import { Cart } from '../cart/schemas/cart.schema';
import { StatusOrder } from './enums/status-order.enum';
import { PaymentMethod } from './enums/payment.enum';
import { User, UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel:Model<OrderDocument>,
    @InjectModel(Product.name) private readonly productModel:Model<ProductDocument>,
    @InjectModel(Cart.name) private readonly cartModel:Model<Cart>,
    @InjectModel(User.name) private readonly userModel:Model<UserDocument>

){}
 async create(userId: string, createOrderDto: CreateOrderDto) {

}


  findAll(userId: string) {
    const userOrderId = new Types.ObjectId(userId)
    return this.orderModel.find({userOrderId: userOrderId}).sort({createdAt: -1}).lean().exec();
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
