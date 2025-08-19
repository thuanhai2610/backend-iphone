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
  async create(userId: string, createOrderDto: CreateOrderDto) {}

  findAll(userId: string) {
    const userOrderId = new Types.ObjectId(userId);
    return this.orderModel.find({ userOrderId: userOrderId }).lean().exec();
  }
  async getRevenue(
    period: 'day' | 'month' | 'year',
    startDate?: string,
    endDate?: string,
  ) {
    const groupId = this.getGroupId(period);
    const match: any = { status: 'Delivered' };
    if (startDate && endDate) {
      dayjs.extend(customParseFormat);
      const start = dayjs(startDate, 'DD-MM-YYYY').startOf('day').toDate();
      const end = dayjs(endDate, 'DD-MM-YYYY').endOf('day').toDate();
      match.createdAt = {
        $gte: start,
        $lte: end,
      };
    }
    const result = await this.orderModel.aggregate([
      { $match: match },
      { $unwind: '$items' },
      {
        $facet: {
          revenue: [
            {
              $group: {
                _id: groupId,
                totalRevenue: { $sum: '$totalPriceInOrder' },
                totalOrders: { $sum: 1 },
              }, 
            }, 
                 { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },

          ],
          product: [
            { $unwind: '$items' },
            {
              $group: {
                _id: '$items.product',
                totalProductSold: { $sum: '$items.variant.quantity' },
              },
            },
            { $sort: { totalProductSold: -1 } },
            {
              $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'product',
              },
            },
            { $unwind: '$product' },
            {
              $project: {
                _id: 0,
                productId: '$_id',
                name: '$product.name',
                totalProductSold: 1,
                storage: '$product.storage',
              },
            },
          ],
        },
      },

    ]);
    const totalRevenueDashboard = result[0].revenue.reduce((sum, i) => sum + i.totalRevenue, 0)
    return { totalRevenueDashboard,result};
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

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  private getGroupId(period: 'day' | 'month' | 'year') {
    switch (period) {
      case 'day':
        return {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        };
      case 'month':
        return {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        };
      case 'year':
        return {
          year: { $year: '$createdAt' },
        };
      default:
        throw new BadRequestException(
          "Invalid period. Must be 'day', 'month', 'year'",
        );
    }
  }

  private totalUser(){
    return this.userModel.countDocuments().lean().exec();
  }
  private totalOrder(){
    return this.orderModel.countDocuments().lean().exec();
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

  async dashboard(){
  const [resultRevenue, totalUser, totalOrder, totalProduct] =await Promise.all([
    this.getRevenue('day'),
    this.totalUser(),
    this.totalOrder(),
    this.totalProduct(),
  ]);
   return {revenue : resultRevenue,totalUser:  totalUser,totalOrder: totalOrder, totalProduct: totalProduct}
  }
}
