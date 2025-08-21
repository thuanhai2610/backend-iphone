import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { Product, ProductDocument } from '../product/schemas/product.schema';
import { Cart } from '../cart/schemas/cart.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import { Order, OrderDocument } from '../order/schema/order.schema';
import { CreateProductDto } from '../product/dto/create-product.dto';
import { UpdateProductDto } from '../product/dto/update-product.dto';
import { StatusOrder } from '../order/enums/status-order.enum';
@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async getRevenue(
    period: 'day' | 'month' | 'year',
    startDate?: string,
    endDate?: string,
  ) {
    const groupId = this.getGroupId(period);
    const match: any = { status: 'Delivered' };
   
    if (startDate || endDate) {
  match.createdAt = {};
  if (startDate) match.createdAt.$gte = new Date(startDate);
  if (endDate) match.createdAt.$lte = new Date(endDate);
}
    
    const result = await this.orderModel.aggregate([
      { $match: match },
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
    const totalRevenueDashboard = result[0].revenue.reduce(
      (sum, i) => sum + i.totalRevenue,
      0,
    );
    
    return { totalRevenueDashboard, result };
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

  private totalUser() {
    return this.userModel.countDocuments().lean().exec();
  }
  private totalOrder() {
    return this.orderModel.countDocuments().lean().exec();
  }
  async totalProduct() {
    const totalStock = await this.productModel.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: '$stock' },
        },
      },
    ]);
    return totalStock[0].totalStock || 0;
  }

  async dashboard() {
    const [resultRevenue, totalUser, totalOrder, totalProduct] =
      await Promise.all([
        this.getRevenue('day'),
        this.totalUser(),
        this.totalOrder(),
        this.totalProduct(),
      ]);
    return {
      revenue: resultRevenue,
      totalUser: totalUser,
      totalOrder: totalOrder,
      totalProduct: totalProduct,
    };
  }

  async create(
    createProductDto: CreateProductDto,
    files: Express.Multer.File[],
  ) {
    let varian;
    try {
      const varianData = createProductDto.varian as any;

      if (typeof varianData === 'string') {
        let cleanedJson = varianData
          .trim()
          .replace(/,(\s*[}\]])/g, '$1')
          .replace(/,\s*$/, '');
        varian = JSON.parse(cleanedJson);
      } else {
        varian = varianData;
      }
    } catch (error) {
      console.error('JSON parse error for varian:', error.message);
      console.error('Error stack:', error.stack);

      try {
        const varianString = createProductDto.varian as any;
        let manualClean = varianString
          .replace(/\s+/g, ' ')
          .replace(/,\s*]/g, ']')
          .replace(/,\s*}/g, '}')
          .trim();

        varian = JSON.parse(manualClean);
      } catch (manualError) {
        console.error('Manual parse also failed:', manualError.message);
        throw new BadRequestException(
          `Invalid varian format. JSON error: ${error.message}`,
        );
      }
    }
    let fileIndex = 0;
    const mappedVarian = varian.map((v) => {
      let imageUrl = '';
      if (files[fileIndex]) {
        imageUrl = files[fileIndex].path;
      }
      for (let i = 0; i < (v.imagesCount || 1); i++) {
        fileIndex++;
      }

      return {
        ...v,
        images: imageUrl,
      };
    });
    const totalProduct = varian.reduce((sum, v) => sum + v.quantity, 0);

    if (totalProduct > createProductDto.stock) {
      throw new BadRequestException('Sản phẩm bạn thêm lớn hơn tổng sản phẩm.');
    }
    let specs;
    try {
      if (typeof createProductDto.specs === 'string') {
        specs = JSON.parse(createProductDto.specs);
      } else {
        specs = createProductDto.specs;
      }
    } catch (error) {
      console.error('JSON parse error for specs:', error.message);
      throw new BadRequestException(
        'Invalid specs format. Please check your JSON data.',
      );
    }

    const productData = {
      ...createProductDto,
      varian: mappedVarian,
      stock: totalProduct,
      specs: specs,
    };

    return this.productModel.create(productData);
  }

  async remove(id: string) {
    const _id = new Types.ObjectId(id);
    const productDel = await this.productModel.findOneAndDelete({ _id }).lean();
    return { message: 'Delete product successfully ', productDel };
  }

  async findAllOrders(page: number, limit: number) {
    page = Number(page) || 1;
    limit = Number(limit) || 10;
    const skip = (page - 1) * limit;
    const pipeline: PipelineStage[] = [
      { $match: { status: { $in: ['Shipped', 'Delivered', 'Pending'] } } },
      {
        $facet: {
          paginateOrders: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'total' }],
          statusCounts: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
        },
      },
      {
        $project: {
          orders: '$paginateOrders',
          total: { $ifNull: [{ $arrayElemAt: ['$totalCount.total', 0] }, 0] },
          statusCounts: 1,
        },
      },
    ];
    const result = await this.orderModel.aggregate(pipeline);
    const data = result[0] || { order: [], total: 0, statuscounts: [] };
    return {
      order: data.orders,
      total: data.total,

      currentPages: page,
      totalPages: Math.ceil(data.toal / limit),
      statusCounts: data.statusCounts,
    };
  }

  async findAllCustomers(){
    return this.userModel.find().select('email address phone fullName createdAt').lean();
  }

  async deleteUser(id: string){
    return this.userModel.findByIdAndDelete( new Types.ObjectId(id))
  }


  async updateProduct(
  id: string,
  updateProductDto: UpdateProductDto,
  files?: Express.Multer.File[],
) {
  const existingProduct = await this.productModel.findById(id);
  if (!existingProduct) {
    throw new NotFoundException('Sản phẩm không tồn tại');
  }
  let varian;
  if (updateProductDto.varian) {
    try {
      const varianData = updateProductDto.varian as any;

      if (typeof varianData === 'string') {
        let cleanedJson = varianData
          .trim()
          .replace(/,(\s*[}\]])/g, '$1')
          .replace(/,\s*$/, '');
        varian = JSON.parse(cleanedJson);
      } else {
        varian = varianData;
      }
    } catch (error) {
      console.error('JSON parse error for varian:', error.message);
      
      try {
        const varianString = updateProductDto.varian as any;
        let manualClean = varianString
          .replace(/\s+/g, ' ')
          .replace(/,\s*]/g, ']')
          .replace(/,\s*}/g, '}')
          .trim();

        varian = JSON.parse(manualClean);
      } catch (manualError) {
        console.error('Manual parse also failed:', manualError.message);
        throw new BadRequestException(
          `Invalid varian format. JSON error: ${error.message}`,
        );
      }
    }
    if (files && files.length > 0) {
      let fileIndex = 0;
      varian = varian.map((v) => {
        let imageUrl = v.images; 
        
        if (files[fileIndex]) {
          imageUrl = files[fileIndex].path; 
        }
        
        for (let i = 0; i < (v.imagesCount || 1); i++) {
          fileIndex++;
        }

        return {
          ...v,
          images: imageUrl,
        };
      });
    }
    const totalProduct = varian.reduce((sum, v) => sum + v.quantity, 0);
    updateProductDto.stock = totalProduct;
  }
  let specs;
  if (updateProductDto.specs) {
    try {
      if (typeof updateProductDto.specs === 'string') {
        specs = JSON.parse(updateProductDto.specs);
      } else {
        specs = updateProductDto.specs;
      }
    } catch (error) {
      console.error('JSON parse error for specs:', error.message);
      throw new BadRequestException(
        'Invalid specs format. Please check your JSON data.',
      );
    }
  }
  const updateData = {
    ...updateProductDto,
    ...(varian && { varian }),
    ...(specs && { specs }),
    updatedAt: new Date(),
  };
  const updatedProduct = await this.productModel.findByIdAndUpdate(
    new Types.ObjectId(id),
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!updatedProduct) {
    throw new NotFoundException('Unable to update product');
  }

  return updatedProduct;
}


async updateOrder(){
  const result = await this.orderModel.updateMany(
    {status: StatusOrder.Shipped},
    {$set : {status: StatusOrder.Delivered}}
  )
  return result.modifiedCount;
}
}
