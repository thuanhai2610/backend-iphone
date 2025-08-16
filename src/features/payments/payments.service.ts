import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, PaymentDocument } from './schema/payment.schema';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../order/schema/order.schema';
import { Cart, CartDocument } from '../cart/schemas/cart.schema';
import { Product, ProductDocument } from '../product/schemas/product.schema';
import { PaymentStatus } from './enums/payment-status.enum';
import { StatusOrder } from '../order/enums/status-order.enum';
import { PaymentMethod } from '../order/enums/payment.enum';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import * as querystring from 'querystring';
import * as crypto from 'crypto';
import { PaymentRepository } from './payment.repository';
import storage from 'src/stores/cloudinary-store';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private readonly paymentModel:Model<PaymentDocument>,
    @InjectModel(Order.name) private readonly orderModel:Model<OrderDocument>,
    @InjectModel(Cart.name) private readonly cartModel:Model<CartDocument>,
    @InjectModel(Product.name) private readonly productModel:Model<ProductDocument>,
    @InjectModel(User.name) private readonly userModel:Model<User>,
    private readonly paymentRepository: PaymentRepository,
  ){}
async  create(userId : string , createPaymentDto: CreatePaymentDto) {
    const userObjectId = new Types.ObjectId(userId)
    const user = await this.userModel.findOne({_id: userObjectId})
    const cart = await this.cartModel.findOne({userId : userObjectId})
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart not found!');
    }
    for(const item of cart.items){
      const product = await this.productModel.findById(item.product);
      if(!product) throw new BadRequestException('Product not found!');
      const variant = product.varian.find(v => v.color ===item.variant.color);
      if(!variant) throw new BadRequestException('Variant not found!');
      if (variant.quantity < item.variant.quantity) {
        throw new BadRequestException(`Product ${item.product} not enough in stock`);

      }
    }
    let paymentStatus: PaymentStatus;
    let orderStatus: StatusOrder;
    if (createPaymentDto.method === PaymentMethod.COD) {
      paymentStatus = PaymentStatus.Completed;
      orderStatus = StatusOrder.Shipped;
       for(const item of cart.items){
          const product = await this.productModel.findById(item.product);
          if(!product) throw new BadRequestException('Product not found!');
          const variant = product.varian.find(v => v.color === item.variant.color);
          if(!variant) throw new BadRequestException('Variant not found!');
          variant.quantity -= item.variant.quantity;
          await product?.save();
          await this.productModel.updateOne({stock:product.varian.reduce((sum, v) => sum + v.quantity, 0) });
        } 
    } else if (createPaymentDto.method === PaymentMethod.VN_PAY) {
        paymentStatus = PaymentStatus.Pending;
        orderStatus = StatusOrder.Pending;
        
      } else {
        throw new BadRequestException('Payment Method invalid')
      }
      if (createPaymentDto.amount != cart.totalPriceInCart) {
        throw new BadRequestException('Amout dont match Price. Please check again!')
      }


      const order = await this.orderModel.create({
        userOrderId: userObjectId,
        items: cart.items.map(i => ({
          product: i.product,
          variant: i.variant,
          name: i.name ,
          storage: i.storage,
          totalPrice: i.totalPrice,
        })),
        totalPriceInOrder: cart.totalPriceInCart,
        status: orderStatus,
        paymentMethod: createPaymentDto.method,
        shippingAddress: user?.address,
      });
        let paymentUrl = '';
       const payment = await this.paymentModel.create({
        orderId: order._id,
        order: order,
        method: createPaymentDto.method,
        amount: createPaymentDto.amount,
        status: paymentStatus,
        transactionId: new Date().toISOString().replace(/[T:\.Z]/g, ''),
        paidAt:  PaymentStatus.Completed ? new Date() : null,
      });
       const paymentId = (payment._id as Types.ObjectId).toString();
      if (createPaymentDto.method === PaymentMethod.VN_PAY) {
           const vnpayUrl = process.env.VNPAY_URL;
          const tmnCode = process.env.VNPAY_TMN_CODE;
          const hashSecret = process.env.VNPAY_HASH_SECRET;
          const returnUrl = process.env.RETURN_URL;
          const vnpParams : any = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: tmnCode,
            vnp_Amount: payment.amount * 100 ,
            vnp_CurrCode: 'VND',
            vnp_TxnRef: paymentId,
            vnp_OrderInfo: `Thanhtoan${payment._id}`,
            vnp_OrderType: '250000',
            vnp_Locale: 'vn',
            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr: '127.0.0.1', 
            vnp_CreateDate: this.formatDate(new Date()),
            
          };
          
      const sortedParams = this.sortObject(vnpParams);
      const signData = querystring.stringify(sortedParams);
      const hmac = crypto.createHmac('sha512', hashSecret!);
      const secureHash = hmac.update(signData).digest('hex');
      vnpParams['vnp_SecureHash'] = secureHash;
         paymentUrl = `${vnpayUrl}?${querystring.stringify(vnpParams)}`;
 

        } 
            const updatePaymentUrl =   await this.paymentModel.findByIdAndUpdate(
          payment._id,
  { $set: { paymentUrl }}, {new: true},
);
      await this.cartModel.updateOne({ userId: userObjectId }, { $set: { items: [], totalPriceInCart: 0 } });
       return {order, payment: updatePaymentUrl}
    }
    

  findAll() {
    return `This action returns all payments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
   private formatDate(date: Date): string {
    return date.toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  }
  private sortObject(obj: any): any {
    const sorted: any = {};
    Object.keys(obj)
      .sort()
      .forEach((key) => {
        sorted[key] = obj[key];
      });
    return sorted;
  }
   async handleVnpayReturn(query: any): Promise<any> {
    const hashSecret = process.env.VNPAY_HASH_SECRET;
    const vnpParams = { ...query };
    const secureHash = vnpParams['vnp_SecureHash'];

    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    const sortedParams = this.sortObject(vnpParams);
    const signData = querystring.stringify(sortedParams);
    const hmac = crypto.createHmac('sha512', hashSecret!);
    const calculatedHash = hmac.update(signData).digest('hex');

    if (secureHash !== calculatedHash) {
      throw new Error('Invalid VNPay signature');
    }

    const paymentId = vnpParams['vnp_TxnRef'];
    const payment = await this.paymentRepository.findPaymentById(paymentId);

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    if (vnpParams['vnp_ResponseCode'] === '00') {
      const totalAmount = payment.amount;
      if (PaymentStatus.Completed) {
        return { status: 'Completed', paymentId, amount: totalAmount };
      }
      await this.paymentRepository.updatePaymentStatus(paymentId, PaymentStatus.Completed);

    } else {
      await this.paymentRepository.updatePaymentStatus(paymentId, PaymentStatus.Failed);
      return { status: 'Failed', message: vnpParams['vnp_ResponseCode'] };
      
    }
    
  } 
}
